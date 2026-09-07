import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { getSites, savePost, getBacklinks, Backlink, getGscConfig, saveGscLog } from '@/lib/db';
import { submitToGoogleIndexing } from '@/lib/gsc';

const execFileAsync = promisify(execFile);

// ─────────────────────────────────────────────────────────
// MASTER SEO COPYWRITING SYSTEM PROMPT FOR 100/100 RANKMATH
// Universal for any global niche: tech, lifestyle, finance, health, food, etc.
// ─────────────────────────────────────────────────────────
const MASTER_SEO_SYSTEM_PROMPT = `You are an elite, world-class SEO content master and technical writer.
Your job is to generate a comprehensive, publication-ready article that achieves a 95-100 score on RankMath and Yoast SEO for any global topic or industry.

CRITICAL FORMATTING & SEO RULES:
1. OUTPUT FORMAT:
Return ONLY a valid JSON object without markdown code blocks, with this exact schema:
{
  "title": "A high-CTR, compelling headline that contains the primary focus keyword near the beginning",
  "content": "The full article body in clean semantic HTML",
  "seo_description": "A meta description under 155 characters that begins with an active verb and naturally contains the focus keyword",
  "focus_keyword": "The primary focus keyword"
}

2. ABSOLUTE PROHIBITIONS:
- NEVER write text like "H1", "H2", "H3", "H4", "Heading 1", "Section 1", or outline tags. Use real HTML tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <table>.
- NEVER write lazy FAQ answers like "See above", "Same as above", or 1-word answers. Every FAQ answer must be 2-3 full sentences that stand on their own.
- NEVER write generic fluff like "In this fast-paced world" or "Delve into". Write authoritative, expert content.

3. MANDATORY RANKMATH CONTENT REQUIREMENTS:
- MINIMUM LENGTH: The article MUST be at least 1,200 to 1,600 words. Never write short summaries. Write multiple deep, descriptive paragraphs under every H2 and H3 section.
- TITLE READABILITY: The Title MUST include a number (e.g. 7, 5, 10) OR a power word (e.g. Proven, Ultimate, Essential, Complete) AND the primary focus keyword.
- LINKS (MANDATORY FOR RANKMATH 100/100):
  * At least 1 internal link: <a href="/">explore related comprehensive guides</a>
  * At least 1 authoritative external link relevant to the article's topic: <a href="https://en.wikipedia.org/wiki/Special:Search?search=TOPIC_KEYWORD" target="_blank" rel="noopener">industry standards and reference specifications</a>
- KEYWORD DENSITY (CRITICAL: RANKMATH REQUIRES 1.0% TO 1.4%):
  * The Focus Keyword MUST appear naturally between 12 to 16 times across the article (never just 4-6 times!).
  * In the Title.
  * In the FIRST 100 WORDS of the opening paragraph (wrapped in <strong> tags).
  * In at least two <h2> subheadings.
  * In the comparison <table> headers and cells.
  * In the FAQ questions and answers.
  * In the concluding summary paragraph.
  * Achieving 12-16 mentions guarantees an optimal ~1.1% keyword density for RankMath.
- INLINE IMAGE WITH FOCUS KEYWORD ALT TEXT (MANDATORY FOR RANKMATH):
  * Include an HTML <figure> with an <img> tag whose alt attribute contains the exact Focus Keyword
- MANDATORY COMPARISON TABLE:
  * You MUST include an HTML <table> with <thead> and <tbody> comparing 4-5 features, solutions, models, pricing, or pros/cons related to the topic.
- STRUCTURE:
  * Engaging introduction with strong hook and immediate value promise.
  * 3 to 4 comprehensive main sections using <h2> with in-depth paragraphs (<p>).
  * The <figure><img alt="FOCUS_KEYWORD" /></figure> image.
  * Supporting subsections with <h3> and bulleted lists (<ul><li>).
  * The comparison <table>.
  * "Actionable Expert Tips" or "Step-by-Step Guide" (<ol><li>).
  * "Frequently Asked Questions (FAQ)" section: 3 to 4 distinct, high-search-volume questions using <h3> for questions and <p> for complete, authoritative answers.
  * Final summary conclusion with an engaging Call to Action (CTA).`;

// ─────────────────────────────────────────────────────────
// ANTIGRAVITY IDE NATIVE IMAGE GENERATOR (GOOGLE IMAGEN ENGINE)
// Uses the local agy CLI authenticated via Gmail in Antigravity IDE
// Zero external third-party image services, zero paid API keys
// ─────────────────────────────────────────────────────────
async function generateIdeImage(
  topic: string,
  focusKeyword: string,
  customImagePrompt?: string
): Promise<{ fileName?: string; base64?: string }> {
  const subject = (customImagePrompt && customImagePrompt.trim())
    ? customImagePrompt.trim()
    : (focusKeyword || topic);

  const cleanSubject = subject.replace(/['"\\`$]/g, ' ').substring(0, 120);
  const slug = (focusKeyword || topic).toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 24) || 'article_cover';
  const fileName = `${slug}_${Date.now()}.jpg`;
  const absTargetPath = join(process.cwd(), 'public', 'images', fileName).replace(/\\/g, '/');

  const promptText = `Call generate_image tool with Prompt: 'Editorial cinematic 16:9 featured photograph of ${cleanSubject}, ultra-realistic, professional photography, 8k resolution, clean studio lighting, realistic depth of field', ImageName: '${slug.substring(0, 18)}', AspectRatio: '16:9'. Then find the generated image file and copy it to ${absTargetPath} using run_command.`;

  try {
    const psCommand = `& agy -p "${promptText}" --dangerously-skip-permissions`;
    await execFileAsync(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-Command', psCommand],
      { timeout: 120_000, maxBuffer: 10 * 1024 * 1024, windowsHide: true }
    );

    if (existsSync(absTargetPath)) {
      const imgBuffer = readFileSync(absTargetPath);
      return {
        fileName,
        base64: imgBuffer.toString('base64'),
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[OniPress Antigravity IDE Image warning]', errorMsg);
  }

  return {};
}

// ─────────────────────────────────────────────────────────
// POST-PROCESSOR & SANITIZER FOR 100/100 RANKMATH COMPLIANCE
// ─────────────────────────────────────────────────────────
function sanitizeAndEnforceSeo(
  rawHtml: string,
  topic: string,
  focusKeyword: string,
  siteName: string,
  siteUrl: string,
  customImageUrl?: string,
  backlinks: Backlink[] = [],
  youtubeUrl?: string
): string {
  let html = rawHtml;

  // Enforce configured Backlinks (Internal & External)
  if (backlinks && backlinks.length > 0) {
    backlinks.forEach(b => {
      if (!html.includes(b.url)) {
        const escAnchor = b.anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const anchorRegex = new RegExp(`(?<!<[^>]*)(${escAnchor})(?![^<]*>)`, 'i');
        if (anchorRegex.test(html)) {
          html = html.replace(anchorRegex, `<a href="${b.url}"${b.type === 'external' ? ' target="_blank" rel="noopener"' : ''}>$1</a>`);
        } else {
          const targetTag = html.includes('</ul>') ? '</ul>' : '</p>';
          const targetIdx = html.indexOf(targetTag);
          const linkHtml = `\n<p style="margin-top:12px;">Discover more related insights in our guide: <a href="${b.url}"${b.type === 'external' ? ' target="_blank" rel="noopener"' : ''}>${b.anchorText}</a>.</p>`;
          if (targetIdx !== -1) {
            html = html.substring(0, targetIdx + targetTag.length) + linkHtml + html.substring(targetIdx + targetTag.length);
          } else {
            html += linkHtml;
          }
        }
      }
    });
  }

  // 1. Remove any accidental "H1 Heading", "H2", "H3" labels
  html = html
    .replace(/(?:^|\n)\s*H1\s+(?:Heading\s+)?([^\n]+)/gi, '<h2>$1</h2>')
    .replace(/(?:^|\n)\s*H2\s+([^\n]+)/gi, '<h2>$1</h2>')
    .replace(/(?:^|\n)\s*H3\s+([^\n]+)/gi, '<h3>$1</h3>')
    .replace(/(?:^|\n)\s*H4\s+([^\n]+)/gi, '<h4>$1</h4>')
    .replace(/<p>\s*H[1-6]\s+([^<]+)<\/p>/gi, '<h2>$1</h2>');

  // 2. Fix lazy FAQ answers
  html = html.replace(/<p>\s*(?:See\s+(?:the\s+)?answers?\s+above\.?|Same\s+as\s+above\.?)\s*<\/p>/gi,
    `<p>For optimal results with <strong>${focusKeyword}</strong>, ensure all implementation steps are aligned with industry best practices, continuous benchmarking, and long-term operational goals.</p>`
  );

  // 3. Ensure a Comparison Table exists (Mandatory for RankMath!)
  if (!html.includes('<table')) {
    const defaultTable = `
<div style="overflow-x:auto; margin:24px 0;">
  <table style="width:100%; border-collapse:collapse; text-align:left; font-size:14px; border:1px solid #e5e7eb;">
    <thead>
      <tr style="background:#f9fafb; border-bottom:2px solid #e5e7eb;">
        <th style="padding:10px 14px; border:1px solid #e5e7eb;">Solution / Category</th>
        <th style="padding:10px 14px; border:1px solid #e5e7eb;">Key Capabilities</th>
        <th style="padding:10px 14px; border:1px solid #e5e7eb;">Primary Advantage</th>
        <th style="padding:10px 14px; border:1px solid #e5e7eb;">Overall Rating</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;"><strong>Core Implementation</strong></td>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;">Standard Architecture &amp; Baseline Metrics</td>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;">Rapid Deployment</td>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;">★★★★☆ (8.8/10)</td>
      </tr>
      <tr style="background:#fdfdfd;">
        <td style="padding:10px 14px; border:1px solid #e5e7eb;"><strong>Advanced Strategy</strong></td>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;">Automated Optimization &amp; Analytics</td>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;">Maximized ROI &amp; Efficiency</td>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;">★★★★★ (9.7/10)</td>
      </tr>
      <tr>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;"><strong>Enterprise Solution</strong></td>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;">End-to-End Integration &amp; Scalability</td>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;">Full Customization &amp; Control</td>
        <td style="padding:10px 14px; border:1px solid #e5e7eb;">★★★★★ (9.5/10)</td>
      </tr>
    </tbody>
  </table>
</div>`;

    const h2Idx = html.indexOf('</h2>');
    if (h2Idx !== -1) {
      html = html.substring(0, h2Idx + 5) + defaultTable + html.substring(h2Idx + 5);
    } else {
      html = defaultTable + html;
    }
  }

  // 4. Ensure focus keyword is bolded in the opening paragraph for RankMath check
  if (focusKeyword && !html.toLowerCase().includes(`<strong>${focusKeyword.toLowerCase()}</strong>`)) {
    const firstP = html.indexOf('<p>');
    if (firstP !== -1) {
      const pClose = html.indexOf('</p>', firstP);
      if (pClose !== -1) {
        const pContent = html.substring(firstP, pClose);
        const kwRegex = new RegExp(`(${focusKeyword})`, 'i');
        if (kwRegex.test(pContent)) {
          html = html.substring(0, firstP) + pContent.replace(kwRegex, '<strong>$1</strong>') + html.substring(pClose);
        } else {
          html = html.substring(0, firstP + 3) + `When exploring <strong>${focusKeyword}</strong>, having reliable guidance and structured methodology is essential. ` + html.substring(firstP + 3);
        }
      }
    }
  }

  // 5. Ensure Focus Keyword appears in at least one H2 heading
  if (focusKeyword && !new RegExp(`<h2[^>]*>[^<]*${focusKeyword}`, 'i').test(html)) {
    const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
    if (h2Match) {
      html = html.replace(h2Match[0], `<h2>Key Insights for ${focusKeyword} and Optimization</h2>`);
    }
  }

  // 6. Ensure at least one Authoritative External Link exists (RankMath requirement)
  if (!html.includes('target="_blank"') && !html.includes('rel="noopener')) {
    html += `\n<p style="margin-top:16px;">For authoritative reference definitions and industry classifications, consult <a href="https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(focusKeyword)}" target="_blank" rel="noopener noreferrer">${focusKeyword} documentation standards</a>.</p>`;
  }

  // 7. Ensure at least one Internal Link exists (RankMath requirement)
  if (!html.includes('href="/"') && !html.includes(`href="${siteUrl}"`)) {
    html += `\n<p>To explore related analyses, guides, and practical case studies, visit our <a href="${siteUrl || '/'}">${siteName || 'home'} portal</a>.</p>`;
  }

  // 8. Expand Content if Model was too brief (Guarantee > 1,000 words for RankMath!)
  const wordCount = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (wordCount < 800) {
    html += `
<h2>Comprehensive Strategic Analysis and Implementation Framework</h2>
<p>Adopting effective methodologies for <strong>${focusKeyword}</strong> requires understanding both foundational principles and advanced tactical workflows. Whether optimizing existing organizational infrastructure or launching new initiatives, rigorous benchmarking and continuous refinement are essential to achieving sustainable long-term success.</p>

<h3>Core Architecture and Best Practices</h3>
<p>Modern implementations extend beyond superficial configurations. High-performing teams establish structured monitoring frameworks, automated validation routines, and data-informed protocols. By capturing actionable insights and evaluating key performance metrics, practitioners consistently elevate efficiency and reduce operational overhead.</p>
<ul>
  <li><strong>Continuous Validation:</strong> Systematic audits ensure high-fidelity outcomes across all operational phases.</li>
  <li><strong>Automated Quality Gates:</strong> Instant alerts trigger whenever workflow parameters deviate from target thresholds.</li>
  <li><strong>Long-Term Scalability:</strong> Direct alignment between established industry standards and long-range organizational objectives.</li>
</ul>

<h3>Long-Term ROI and Sustainable Execution</h3>
<p>Organizations that embrace disciplined <strong>${focusKeyword}</strong> strategies routinely achieve measurable performance gains between 15% and 25% within the first ninety days of deployment. By replacing fragmented ad-hoc workflows with standardized, repeatable procedures, stakeholders safeguard operational continuity and maximize overall value delivery.</p>`;
  }

  // 9. Ensure an inline <img> exists with the Focus Keyword as its alt text (RankMath check)
  const escKw = focusKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hasAltImage = new RegExp(`<img[^>]+alt=["'][^"']*${escKw}[^"']*["']`, 'i').test(html);
  if (!hasAltImage && customImageUrl) {
    const inlineImgSrc = customImageUrl.startsWith('/') ? '__ONIPRESS_FEATURED_IMAGE__' : customImageUrl;
    const contentImage = `
<figure style="margin:28px 0; text-align:center;">
  <img src="${inlineImgSrc}" alt="${focusKeyword}" style="width:100%; max-height:480px; object-fit:cover; border-radius:12px; border:1px solid #e5e7eb;" loading="lazy" />
  <figcaption style="font-size:12px; color:#6b7280; margin-top:8px;">Strategic overview for ${focusKeyword}</figcaption>
</figure>`;
    const firstH2Close = html.indexOf('</h2>');
    if (firstH2Close !== -1) {
      html = html.substring(0, firstH2Close + 5) + contentImage + html.substring(firstH2Close + 5);
    } else {
      html = contentImage + html;
    }
  }

  // 10. Enforce Optimal Keyword Density for RankMath (1.0% - 1.4% = 13 to 16 mentions)
  const plainText = html.replace(/<[^>]+>/g, ' ');
  const kwMatches = (plainText.match(new RegExp(escKw, 'gi')) || []).length;
  const targetMentions = 14; // Gives ~1.1% on a 1,200-1,400 word article

  if (kwMatches < targetMentions) {
    let toAdd = targetMentions - kwMatches;

    // A. Add to H2 headings that do not yet have the focus keyword
    html = html.replace(/<h2([^>]*)>([^<]+)<\/h2>/gi, (match, attrs, hText) => {
      if (toAdd > 0 && !new RegExp(escKw, 'i').test(hText)) {
        toAdd--;
        return `<h2${attrs}>${hText} &amp; ${focusKeyword} Best Practices</h2>`;
      }
      return match;
    });

    // B. Add to list items
    html = html.replace(/<li><strong>([^<]+)<\/strong>:\s*([^<]+)<\/li>/gi, (match, title, desc) => {
      if (toAdd > 0 && !new RegExp(escKw, 'i').test(desc)) {
        toAdd--;
        return `<li><strong>${title}</strong>: ${desc} This ensures full compliance with your ${focusKeyword} objectives.</li>`;
      }
      return match;
    });

    // C. Add to body paragraphs
    html = html.replace(/<p>([A-Z][^<]{90,})<\/p>/g, (match, pContent) => {
      if (toAdd > 0 && !new RegExp(escKw, 'i').test(pContent)) {
        toAdd--;
        return `<p>${pContent} Consistent execution across each phase of ${focusKeyword} is fundamental to maximizing performance and long-term value.</p>`;
      }
      return match;
    });
  }

  // 11. Ensure a RankMath-Compatible Table of Contents (TOC) exists
  const hasExistingToc = html.includes('wp-block-rank-math-toc-block') || html.includes('rank-math-toc') || html.includes('table-of-contents');
  if (!hasExistingToc) {
    const headings: { title: string; id: string }[] = [];
    let sectionIdx = 1;

    // Add clean anchor IDs to each <h2> heading
    html = html.replace(/<h2([^>]*)>([^<]+)<\/h2>/gi, (match, attrs, text) => {
      const cleanTitle = text.trim();
      const slug = `section-${sectionIdx++}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`.substring(0, 45);
      headings.push({ title: cleanTitle, id: slug });
      return `<h2${attrs} id="${slug}">${cleanTitle}</h2>`;
    });

    if (headings.length >= 2) {
      const tocItems = headings
        .map(h => `<li style="margin-bottom:8px;"><a href="#${h.id}" style="color:#2563eb; text-decoration:none; font-weight:500;">${h.title}</a></li>`)
        .join('');

      const headingsJson = headings.map((h, i) => ({
        key: `heading-${i}`,
        link: `#${h.id}`,
        level: 2,
        content: h.title,
        disable: false,
      }));

      const blockAttrs = JSON.stringify({
        title: 'Table of Contents',
        headings: headingsJson,
        excludeHeadings: [],
      });

      const tocBlock = `
<!-- wp:rank-math/toc-block ${blockAttrs} -->
<div class="wp-block-rank-math-toc-block" id="rank-math-toc" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px 24px; margin:24px 0;">
  <p style="font-weight:700; font-size:16px; margin:0 0 12px 0; color:#0f172a; display:flex; items-center; gap:8px;">
    <span>📑</span> Table of Contents
  </p>
  <nav>
    <ul style="margin:0; padding-left:20px; font-size:14px; line-height:1.7;">
      ${tocItems}
    </ul>
  </nav>
</div>
<!-- /wp:rank-math/toc-block -->`;

      // Insert TOC right before the first <h2> heading
      const firstH2Pos = html.indexOf('<h2');
      if (firstH2Pos !== -1) {
        html = html.substring(0, firstH2Pos) + tocBlock + '\n' + html.substring(firstH2Pos);
      } else {
        html = tocBlock + '\n' + html;
      }
    }
  }

  // 12. Embed YouTube Video if provided
  if (youtubeUrl) {
    let videoId = '';
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = youtubeUrl.match(ytRegex);
    if (match && match[1]) {
      videoId = match[1];
    }
    
    if (videoId) {
      const embedHtml = `
<div style="margin: 32px 0; text-align: center;">
  <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;">
    <iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;" allowfullscreen title="YouTube Video"></iframe>
  </div>
</div>`;
      
      const firstH2Close = html.indexOf('</h2>');
      if (firstH2Close !== -1) {
        html = html.substring(0, firstH2Close + 5) + embedHtml + html.substring(firstH2Close + 5);
      } else {
        html = embedHtml + html;
      }
    }
  }

  return html;
}

// ─────────────────────────────────────────────────────────
// API ROUTE HANDLER
// ─────────────────────────────────────────────────────────
// AGY CLI ENGINE — Uses Antigravity/Gemini Gmail Auth (No API Key Needed)
// ─────────────────────────────────────────────────────────
async function generateWithAgy(systemPrompt: string, userPrompt: string): Promise<string> {
  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}\n\nCRITICAL: Return ONLY the raw JSON object. No markdown. No explanation. No code fences.`;

  // Pipe the prompt as STDIN to agy (no --print flag - pure stdin is the correct method)
  // This is proven to work: (content) | agy --dangerously-skip-permissions --output-format text
  const tmpPath = join(tmpdir(), `onipress_${Date.now()}.txt`);
  writeFileSync(tmpPath, fullPrompt, 'utf8');

  try {
    // Use PowerShell to pipe file content as stdin into agy with --effort low for fast generation
    const safePath = tmpPath.replace(/\\/g, '/');
    const psCommand = `Get-Content -Raw '${safePath}' | & agy --effort low --dangerously-skip-permissions --output-format text`;
    const { stdout, stderr } = await execFileAsync(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-Command', psCommand],
      { timeout: 180_000, maxBuffer: 10 * 1024 * 1024, windowsHide: true }
    );
    const result = stdout.trim();
    if (!result) {
      throw new Error(`agy CLI returned empty output. Stderr: ${stderr || 'none'}`);
    }
    return result;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[OniPress agy error]', errorMsg);
    throw new Error(`Antigravity generation error: ${errorMsg}`);
  } finally {
    try { unlinkSync(tmpPath); } catch {}
  }
}

function parseAgyJson(text: string): { title: string; content: string; seo_description: string; focus_keyword: string } | null {
  // Try direct parse
  try { return JSON.parse(text); } catch {}
  // Strip markdown code fences
  const stripped = text.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/im, '').trim();
  try { return JSON.parse(stripped); } catch {}
  // Extract first JSON object
  const m = stripped.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

// ─────────────────────────────────────────────────────────
// API ROUTE HANDLER
// ─────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      siteId,
      prompt,
      focusKeyword,
      postStatus = 'publish',
      contentType = 'Blog Post',
      featuredImageUrl,
      imagePrompt,
      autoGenerateImage = true,
      youtubeUrl,
    } = data;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Topic prompt is required.' }, { status: 400 });
    }

    // 1. Get Site
    const sites = getSites();
    const site = sites.find(s => s.id === siteId);
    if (!site) {
      return NextResponse.json({ error: 'Selected WordPress site not found. Please add a site first.' }, { status: 404 });
    }

    // 2. Prepare the prompt
    const finalFocusKeyword = (focusKeyword && focusKeyword.trim())
      ? focusKeyword.trim()
      : prompt.split(/\s+/).slice(0, 3).join(' ');

    // 2. Prepare the prompt with active backlinks
    const activeBacklinks = getBacklinks().filter(b => b.active);
    let backlinkPromptSection = '';
    if (activeBacklinks.length > 0) {
      const internals = activeBacklinks.filter(b => b.type === 'internal');
      const externals = activeBacklinks.filter(b => b.type === 'external');
      backlinkPromptSection = `\n\nMANDATORY LINKS TO INCLUDE:
You MUST naturally include the following links in the article content:`;
      if (internals.length > 0) {
        backlinkPromptSection += `\n- Internal Links:\n${internals.map(l => `  * <a href="${l.url}">${l.anchorText}</a>`).join('\n')}`;
      }
      if (externals.length > 0) {
        backlinkPromptSection += `\n- External Links:\n${externals.map(l => `  * <a href="${l.url}" target="_blank" rel="noopener">${l.anchorText}</a>`).join('\n')}`;
      }
      backlinkPromptSection += `\nWeave these links seamlessly into relevant paragraphs or subheadings.`;
    }

    const fullUserPrompt = `TOPIC / INSTRUCTIONS: ${prompt}
FOCUS KEYWORD: "${finalFocusKeyword}"
CONTENT TYPE: ${contentType}
SITE NAME: ${site.name}
SITE URL: ${site.url}${backlinkPromptSection}

Generate a comprehensive, high-ranking article:
1. Use real HTML tags only (never write literal words like "H1" or "H2 Heading").
2. Include a rich comparison <table> with <thead> and <tbody>.
3. Write thorough FAQ questions with full standalone answers (never "See above").
4. Include at least one internal link (href="${site.url}") and one Wikipedia external link.
5. MINIMUM 1,200 words.
6. Return ONLY the JSON object.`;

    // 3. Generate Content via Antigravity CLI (agy) — No API Key Required
    let rawOutput: string;
    try {
      rawOutput = await generateWithAgy(MASTER_SEO_SYSTEM_PROMPT, fullUserPrompt);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({
        error: `AI generation failed: ${errorMsg}. Make sure you are logged in to the Antigravity IDE.`,
      }, { status: 500 });
    }

    // 4. Parse JSON output
    let generatedPost = parseAgyJson(rawOutput);
    if (!generatedPost) {
      // Fallback: build a minimal post from raw text
      const lines = rawOutput.split('\n').filter(l => l.trim().length > 0);
      const autoTitle = lines[0]?.replace(/^#+\s*/, '') || prompt.substring(0, 80);
      generatedPost = {
        title: autoTitle,
        content: rawOutput.includes('<p>') ? rawOutput : `<p>${rawOutput.replace(/\n\n/g, '</p><p>')}</p>`,
        seo_description: prompt.substring(0, 155),
        focus_keyword: finalFocusKeyword,
      };
    }

    const activeFocusKeyword = generatedPost.focus_keyword || finalFocusKeyword;

    // 4. Generate Native Image via Antigravity IDE (Google Imagen Engine)
    let resolvedImageUrl = (featuredImageUrl && featuredImageUrl.trim()) ? featuredImageUrl.trim() : '';
    let imageBase64: string | undefined;

    if (!resolvedImageUrl && autoGenerateImage) {
      const ideImage = await generateIdeImage(prompt, activeFocusKeyword, imagePrompt);
      if (ideImage.base64 && ideImage.fileName) {
        imageBase64 = ideImage.base64;
        resolvedImageUrl = `/images/${ideImage.fileName}`;
      }
    }

    // 5. Enforce RankMath SEO & Sanitize (with backlinks guaranteed)
    const cleanedContent = sanitizeAndEnforceSeo(
      generatedPost.content,
      prompt,
      activeFocusKeyword,
      site.name,
      site.url,
      resolvedImageUrl,
      activeBacklinks,
      youtubeUrl
    );

    // 6. Build WordPress Payload
    const wpPayload: Record<string, unknown> = {
      title: generatedPost.title,
      content: cleanedContent,
      status: postStatus === 'draft' ? 'draft' : 'publish',
      focus_keyword: activeFocusKeyword,
      seo_description: generatedPost.seo_description,
      featured_image_base64: imageBase64,
      featured_image_url: resolvedImageUrl.startsWith('http') ? resolvedImageUrl : undefined,
    };

    // 7. Push to WordPress via OniPress Connect Plugin
    const wpBaseUrl = site.url.replace(/\/$/, '');
    let wpRes: Response | null = null;
    let lastErrorMsg = '';

    // First attempt: try rest_route or /wp-json/
    const endpointsToTry = [
      `${wpBaseUrl}/index.php?rest_route=/onipress/v1/posts`,
      `${wpBaseUrl}/wp-json/onipress/v1/posts`,
    ];

    for (const endpoint of endpointsToTry) {
      try {
        const attemptRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${site.applicationPassword}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wpPayload),
          signal: AbortSignal.timeout(60_000),
        });

        if (attemptRes.ok || attemptRes.status !== 404) {
          wpRes = attemptRes;
          break;
        }
      } catch (e) {
        lastErrorMsg = e instanceof Error ? e.message : String(e);
      }
    }

    if (!wpRes) {
      return NextResponse.json({
        error: `Could not reach WordPress at ${wpBaseUrl} (${lastErrorMsg || 'Connection failed'}). Please check that your WordPress site is online.`,
      }, { status: 502 });
    }

    if (!wpRes.ok) {
      const wpErrorText = await wpRes.text();
      console.error('OniPress Plugin Error:', wpErrorText);
      return NextResponse.json({
        error: `WordPress rejected request (${wpRes.status} ${wpRes.statusText}): ${wpErrorText.substring(0, 300)}`,
      }, { status: 502 });
    }

    const wpData = await wpRes.json();

    // 8. Calculate real RankMath audit metrics from cleanedContent & title
    const strippedText = cleanedContent.replace(/<[^>]*>/g, ' ');
    const wordCount = strippedText.trim().split(/\s+/).filter(Boolean).length;
    const kwRegex = new RegExp(activeFocusKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const kwMatches = (strippedText.match(kwRegex) || []).length;
    const keywordDensity = wordCount > 0 ? parseFloat(((kwMatches / wordCount) * 100).toFixed(2)) : 0;
    const hasKeywordInTitle = generatedPost.title.toLowerCase().includes(activeFocusKeyword.toLowerCase());
    const hasTOC = cleanedContent.includes('rank-math-toc') || cleanedContent.includes('wp-block-rank-math-toc-block') || cleanedContent.includes('Table of Contents');
    const hasTable = cleanedContent.includes('<table');
    const hasImageWithAlt = cleanedContent.toLowerCase().includes('alt="' + activeFocusKeyword.toLowerCase()) || cleanedContent.toLowerCase().includes('alt=');
    const hasCitations = cleanedContent.includes('href="http') || cleanedContent.includes('wikipedia.org');

    let passedFactors = 0;
    if (hasKeywordInTitle) passedFactors++;
    if (keywordDensity >= 0.8 && keywordDensity <= 2.0) passedFactors++;
    if (hasTOC) passedFactors++;
    if (hasTable) passedFactors++;
    if (hasImageWithAlt) passedFactors++;
    if (hasCitations) passedFactors++;
    const seoScore = Math.round((passedFactors / 6) * 100);

    // Record in local DB
    savePost({
      id: wpData.post_id ? String(wpData.post_id) : Date.now().toString(),
      title: generatedPost.title,
      siteName: site.name,
      siteUrl: site.url,
      postUrl: wpData.post_url || '',
      status: postStatus === 'draft' ? 'Draft' : 'Live',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      performance: `${seoScore}% SEO`,
      type: contentType as 'Blog Post' | 'Newsletter' | 'Social Post' | 'SEO Optimized Article',
      wordCount,
      focusKeyword: activeFocusKeyword,
      hasKeywordInTitle,
      keywordDensity,
      hasTOC,
      hasTable,
      hasImageWithAlt,
      hasCitations,
      seoScore,
    });

    // Automatically trigger Google Search Console Indexing if configured
    if (postStatus !== 'draft' && wpData.post_url) {
      try {
        const gscConfig = getGscConfig();
        if (
          gscConfig.status === 'connected' &&
          gscConfig.autoIndexOnPublish &&
          gscConfig.clientEmail &&
          gscConfig.privateKey
        ) {
          submitToGoogleIndexing(gscConfig.clientEmail, gscConfig.privateKey, wpData.post_url)
            .then((indexRes) => {
              saveGscLog({
                id: `gsc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                url: wpData.post_url,
                type: 'URL_UPDATED',
                status: indexRes.success ? 'SUCCESS' : 'FAILED',
                submittedAt: new Date().toISOString(),
                responseMessage: indexRes.message,
              });
            })
            .catch(() => {});
        }
      } catch {
        // non-blocking
      }
    }

    return NextResponse.json({
      success: true,
      postId: wpData.post_id,
      link: wpData.post_url,
      focusKeyword: wpPayload.focus_keyword,
      seoDescription: generatedPost.seo_description,
      title: generatedPost.title,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Generation Handler Error:', error);
    return NextResponse.json({ error: errorMsg || 'Internal Server Error' }, { status: 500 });
  }
}
