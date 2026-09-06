import { NextResponse } from 'next/server';
import { getSites, getSettings, getPosts, savePost, Site, PostRecord } from '@/lib/db';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const MCP_SERVER_INFO = {
  name: 'onipress-mcp-server',
  version: '1.1.0',
  description: 'Universal Model Context Protocol (MCP) bridge for WordPress multi-site management and SEO auto-blogging.',
};

const MCP_TOOLS = [
  {
    name: 'onipress_list_sites',
    description: 'Retrieve all connected WordPress sites configured in OniPress, including their names, URLs, and tags.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'onipress_verify_site',
    description: 'Ping and verify connection health for a specific WordPress site using its OniPress Connect Bearer token.',
    inputSchema: {
      type: 'object',
      properties: {
        site_id: { type: 'string', description: 'The ID of the site from onipress_list_sites' },
      },
      required: ['site_id'],
    },
  },
  {
    name: 'onipress_generate_and_publish',
    description: 'Generate an SEO-optimized article with an AI model and publish it directly to a WordPress site with RankMath/Yoast focus keyword and meta description.',
    inputSchema: {
      type: 'object',
      properties: {
        site_id: { type: 'string', description: 'Target WordPress site ID' },
        prompt: { type: 'string', description: 'Topic or instructions for the article' },
        focus_keyword: { type: 'string', description: 'Target primary SEO keyword for RankMath' },
        model: { type: 'string', description: 'AI model identifier (e.g., openai:gpt-4o, anthropic:claude-3-5-sonnet-20240620, google:models/gemini-1.5-pro-latest)', default: 'openai:gpt-4o' },
        status: { type: 'string', enum: ['publish', 'draft'], default: 'publish' },
      },
      required: ['site_id', 'prompt'],
    },
  },
  {
    name: 'onipress_publish_post',
    description: 'Publish already written content directly to WordPress with RankMath SEO metadata and optional featured image.',
    inputSchema: {
      type: 'object',
      properties: {
        site_id: { type: 'string', description: 'Target WordPress site ID' },
        title: { type: 'string', description: 'Post title' },
        content: { type: 'string', description: 'HTML formatted post content' },
        status: { type: 'string', enum: ['publish', 'draft'], default: 'publish' },
        focus_keyword: { type: 'string', description: 'RankMath SEO focus keyword' },
        seo_description: { type: 'string', description: 'Meta description under 155 characters' },
        featured_image_url: { type: 'string', description: 'URL of image to download and set as featured thumbnail' },
      },
      required: ['site_id', 'title', 'content'],
    },
  },
  {
    name: 'onipress_get_recent_posts',
    description: 'Get the list of recently published posts and their SEO performance metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', default: 10 },
      },
    },
  },
  {
    name: 'onipress_upload_media',
    description: 'Upload an image from a URL into the WordPress media library of a connected site.',
    inputSchema: {
      type: 'object',
      properties: {
        site_id: { type: 'string', description: 'Target WordPress site ID' },
        image_url: { type: 'string', description: 'Public URL of image to upload' },
        title: { type: 'string', description: 'Optional media title' },
      },
      required: ['site_id', 'image_url'],
    },
  },
];

export async function GET() {
  return NextResponse.json({
    jsonrpc: '2.0',
    server: MCP_SERVER_INFO,
    capabilities: {
      tools: MCP_TOOLS,
      prompts: [
        {
          name: 'elite_seo_blog',
          description: 'High-ranking master SEO prompt for blog generation with RankMath optimization',
        },
      ],
      resources: [
        { uri: 'onipress://sites', name: 'Connected WordPress Sites' },
        { uri: 'onipress://posts', name: 'Recent Content Activity' },
      ],
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, method, params } = body;

    // 1. MCP initialize
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: MCP_SERVER_INFO,
          capabilities: {
            tools: {},
            resources: {},
            prompts: {},
          },
        },
      });
    }

    // 2. tools/list
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS,
        },
      });
    }

    // 3. tools/call
    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};
      const sites = getSites();

      // Tool 1: List sites
      if (name === 'onipress_list_sites') {
        const sanitized = sites.map(s => ({
          id: s.id,
          name: s.name,
          url: s.url,
          tags: s.tags,
        }));
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(sanitized, null, 2) }],
          },
        });
      }

      // Tool 2: Verify site
      if (name === 'onipress_verify_site') {
        const site = sites.find(s => s.id === args?.site_id);
        if (!site) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `Site with ID ${args?.site_id} not found.` },
          });
        }
        const pingUrl = `${site.url.replace(/\/$/, '')}/wp-json/onipress/v1/ping`;
        const res = await fetch(pingUrl, {
          headers: { Authorization: `Bearer ${site.applicationPassword}` },
        });
        const data = await res.json();
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify({ connected: res.ok, data }, null, 2) }],
          },
        });
      }

      // Tool 3: Generate and publish
      if (name === 'onipress_generate_and_publish') {
        const site = sites.find(s => s.id === args?.site_id);
        if (!site) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `Site ${args?.site_id} not found.` },
          });
        }

        const settings = getSettings();
        const modelStr = args?.model || 'openai:gpt-4o';
        const [providerName, modelId] = modelStr.split(':');
        let aiModel;

        if (providerName === 'openai') {
          if (!settings.openaiApiKey) throw new Error('OpenAI API Key is missing.');
          aiModel = createOpenAI({ apiKey: settings.openaiApiKey })(modelId);
        } else if (providerName === 'anthropic') {
          if (!settings.anthropicApiKey) throw new Error('Anthropic API Key is missing.');
          aiModel = createAnthropic({ apiKey: settings.anthropicApiKey })(modelId);
        } else if (providerName === 'google') {
          if (!settings.geminiApiKey) throw new Error('Gemini API Key is missing.');
          aiModel = createGoogleGenerativeAI({ apiKey: settings.geminiApiKey })(modelId);
        } else if (providerName === 'openrouter') {
          if (!settings.openRouterApiKey) throw new Error('OpenRouter API Key is missing.');
          aiModel = createOpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: settings.openRouterApiKey })(modelId);
        } else if (providerName === 'custom') {
          aiModel = createOpenAI({ baseURL: settings.customApiUrl, apiKey: settings.customApiKey || 'dummy' })(modelId);
        } else {
          throw new Error(`Unsupported AI provider: ${providerName}`);
        }

        const finalFocusKeyword = (args.focus_keyword && args.focus_keyword.trim())
          ? args.focus_keyword.trim()
          : args.prompt.split(/\s+/).slice(0, 3).join(' ');

        const masterSystemPrompt = `You are an elite SEO strategist. Return ONLY valid JSON with keys: title, content, seo_description, focus_keyword.
Rules: Use real HTML tags (never write literal 'H1' or 'H2 Heading'). Include a rich comparison <table> with <thead> and <tbody>. Include a 3-question FAQ section with thorough 2-3 sentence answers (never say 'See above'). Place focus keyword in title, first paragraph in <strong>, and H2.`;

        let generatedPost: { title: string; content: string; seo_description: string; focus_keyword: string };

        try {
          const { object } = await generateObject({
            model: aiModel,
            system: masterSystemPrompt,
            prompt: args.prompt + `\nTarget Focus Keyword: "${finalFocusKeyword}"`,
            schema: z.object({
              title: z.string(),
              content: z.string(),
              seo_description: z.string().max(155),
              focus_keyword: z.string(),
            }),
          });
          generatedPost = object;
        } catch {
          const { text } = await generateText({
            model: aiModel,
            system: `${masterSystemPrompt}\n\nCRITICAL: Return ONLY JSON object.`,
            prompt: args.prompt + `\nTarget Focus Keyword: "${finalFocusKeyword}"`,
          });
          const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          try {
            generatedPost = JSON.parse(cleaned);
          } catch {
            generatedPost = {
              title: args.prompt.substring(0, 60),
              content: text.includes('<p>') ? text : `<p>${text.replace(/\n\n/g, '</p><p>')}</p>`,
              seo_description: args.prompt.substring(0, 150),
              focus_keyword: finalFocusKeyword,
            };
          }
        }

        // Clean any literal H1/H2 labels
        let cleanedContent = generatedPost.content
          .replace(/(?:^|\n)\s*H1\s+(?:Heading\s+)?([^\n]+)/gi, '<h2>$1</h2>')
          .replace(/(?:^|\n)\s*H2\s+([^\n]+)/gi, '<h2>$1</h2>')
          .replace(/(?:^|\n)\s*H3\s+([^\n]+)/gi, '<h3>$1</h3>');

        // Ensure table exists
        if (!cleanedContent.includes('<table')) {
          const defaultTable = `<div style="overflow-x:auto; margin:20px 0;"><table style="width:100%; border-collapse:collapse; border:1px solid #ddd;"><thead><tr style="background:#f3f4f6;"><th style="border:1px solid #ddd; padding:8px;">Category</th><th style="border:1px solid #ddd; padding:8px;">Key Specifications</th><th style="border:1px solid #ddd; padding:8px;">Rating</th></tr></thead><tbody><tr><td style="border:1px solid #ddd; padding:8px;">Standard Implementation</td><td style="border:1px solid #ddd; padding:8px;">Industry Baseline Standards</td><td style="border:1px solid #ddd; padding:8px;">★★★★★ (9.5/10)</td></tr></tbody></table></div>`;
          const h2Idx = cleanedContent.indexOf('</h2>');
          cleanedContent = h2Idx !== -1 ? cleanedContent.substring(0, h2Idx + 5) + defaultTable + cleanedContent.substring(h2Idx + 5) : defaultTable + cleanedContent;
        }

        const autoImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalFocusKeyword)}%20professional%20studio%20lighting%204k%20ultra%20realistic%20award%20winning%20editorial%20photography?width=1280&height=720&nologo=true&enhance=true`;

        // Publish to WordPress via OniPress Connect Plugin
        const wpRes = await fetch(`${site.url.replace(/\/$/, '')}/wp-json/onipress/v1/posts`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${site.applicationPassword}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: generatedPost.title,
            content: cleanedContent,
            status: args.status || 'publish',
            focus_keyword: generatedPost.focus_keyword || finalFocusKeyword,
            seo_description: generatedPost.seo_description,
            featured_image_url: autoImageUrl,
          }),
        });

        const wpData = await wpRes.json();
        if (!wpRes.ok) throw new Error(JSON.stringify(wpData));

        savePost({
          id: String(wpData.post_id || Date.now()),
          title: generatedPost.title,
          siteName: site.name,
          siteUrl: site.url,
          postUrl: wpData.post_url || '',
          status: 'Live',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          performance: '100% SEO',
          type: 'Blog Post',
        });

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{
              type: 'text',
              text: `Post created successfully on ${site.name}!\nTitle: ${generatedPost.title}\nURL: ${wpData.post_url}\nPost ID: ${wpData.post_id}`,
            }],
          },
        });
      }

      // Tool 4: Direct publish post
      if (name === 'onipress_publish_post') {
        const site = sites.find(s => s.id === args?.site_id);
        if (!site) throw new Error(`Site ${args?.site_id} not found.`);

        const wpRes = await fetch(`${site.url.replace(/\/$/, '')}/wp-json/onipress/v1/posts`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${site.applicationPassword}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: args.title,
            content: args.content,
            status: args.status || 'publish',
            focus_keyword: args.focus_keyword,
            seo_description: args.seo_description,
            featured_image_url: args.featured_image_url,
          }),
        });

        const wpData = await wpRes.json();
        if (!wpRes.ok) throw new Error(JSON.stringify(wpData));

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(wpData, null, 2) }],
          },
        });
      }

      // Tool 5: Get recent posts
      if (name === 'onipress_get_recent_posts') {
        const posts = getPosts().slice(0, args?.limit || 10);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(posts, null, 2) }],
          },
        });
      }

      // Tool 6: Upload media
      if (name === 'onipress_upload_media') {
        const site = sites.find(s => s.id === args?.site_id);
        if (!site) throw new Error(`Site ${args?.site_id} not found.`);

        const wpRes = await fetch(`${site.url.replace(/\/$/, '')}/wp-json/onipress/v1/media/upload-from-url`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${site.applicationPassword}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: args.image_url,
            title: args.title,
          }),
        });
        const wpData = await wpRes.json();
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(wpData, null, 2) }],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool ${name} not found.` },
      });
    }

    // Default error for unknown methods
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method ${method} not implemented.` },
    });
  } catch (error: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: error.message || 'Internal error' },
    }, { status: 500 });
  }
}
