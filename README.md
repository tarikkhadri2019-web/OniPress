# OniPress — Free AI WordPress Auto-Blogger

> **Write, optimize, and publish full SEO blog posts to any WordPress site in one click — powered by Gemini AI through your Gmail login. No API keys required.**

[![License: MIT](https://img.shields.io/badge/License-MIT-ff7a18.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![WordPress Plugin](https://img.shields.io/badge/WordPress-Plugin-21759b?logo=wordpress)](wp-plugin/onipress-connect)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> 📖 **New user? Start here → [INSTALL.md — Complete Setup Guide From Zero](INSTALL.md)**

---

## ✨ What is OniPress?

**OniPress** is an open-source, self-hosted WordPress AI auto-blogging dashboard. It connects to any WordPress site via the OniPress Connect plugin, then uses **Google Gemini** (through the free [Antigravity IDE](https://antigravity.ai) `agy` CLI) to generate fully SEO-optimized blog posts and publish them directly.

**Zero API keys. Zero subscriptions. Just have Antigravity IDE open and logged in with your Gmail account on your PC.**

### 💡 The "IDE Trick" — Why You Never Need Paid API Keys
Most AI blogging tools require paying for OpenAI, Anthropic, or Google Cloud Vertex AI accounts. **OniPress eliminates that completely:**
- When you install **Antigravity IDE** on your computer and sign in with your **free Gmail account**, your computer gains an authenticated local AI bridge (`agy`).
- OniPress connects directly to `agy` via PowerShell behind the scenes.
- You get world-class **Google Gemini** reasoning to write 1,500+ word RankMath 100/100 articles **100% free with unlimited generation**!

### What it does
- Generates **1,200–1,600 word** deep articles with clean semantic HTML, comparison tables, FAQ, and structured headings
- Auto-generates a **studio-grade 16:9 featured photograph** using **Antigravity IDE's native Google Imagen engine** via `agy`
- **Backlinks & Link Strategy Manager**: Add your target internal links and external authority references — OniPress forces them into every article for 100/100 RankMath SEO link scores
- Sideloads the image directly into your **WordPress Media Library** and sets it as the official Featured Image
- Publishes directly to **any WordPress site** via the secure OniPress Connect REST API plugin
- Tracks all published posts in a local history dashboard
- Exposes an **MCP server** at `http://localhost:3000/api/mcp` for AI assistant integration

---

## Requirements

| Requirement | Details |
|-------------|---------|
| **[Antigravity IDE](https://antigravity.ai)** | **Required** — Free desktop app. Just sign in with your Google/Gmail account. |
| **Node.js 18+** | [nodejs.org](https://nodejs.org) |
| **WordPress site** | Any self-hosted WordPress site with admin access |

> [!IMPORTANT]
> **You MUST be logged into Antigravity IDE on your PC!**  
> Simply keep Antigravity IDE open and signed in with your Gmail account. OniPress uses PowerShell to call `agy` locally. As long as you are logged in, all AI generation works seamlessly with zero API keys or credit cards.

---

## Quick Start (5 Minutes)

### Step 1 — Install & Sign into Antigravity IDE

1. Download Antigravity IDE from **[antigravity.ai](https://antigravity.ai)**
2. Install and launch the app
3. Click **Sign in with Google** and log in with your **Gmail account**
4. Keep the IDE open on your PC — the `agy` command is now active and authenticated!

Verify the connection in your PowerShell terminal:

```powershell
agy --print "Hello, respond with: OK" --dangerously-skip-permissions
```
*(If it returns "OK", your AI bridge is 100% ready!)*

---

### Step 2 — Clone and Run OniPress

```bash
# Clone the repository
git clone https://github.com/your-username/onipress.git
cd onipress

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

### Step 3 — Install the WordPress Plugin

1. In the OniPress dashboard, go to the **Site Manager** tab
2. Download the **OniPress Connect Plugin** (the download link is shown in the UI)
3. In your WordPress admin go to: **Plugins → Add New → Upload Plugin**
4. Upload `onipress-connect.zip` and click **Activate**

---

### Step 4 — Connect Your WordPress Site

1. In WordPress admin go to: **Users → Your Profile → Application Passwords**
2. Enter `OniPress` as the name and click **Add New Application Password**
3. Copy the generated password (you only see it once)
4. In OniPress dashboard → **Site Manager** → **Add New Site**:
   - **Site Name**: Your blog name (e.g. `Travel Blog`)
   - **WordPress URL**: Your site URL (e.g. `https://myblog.com`)
   - **Username**: Your WordPress admin username
   - **Application Password**: Paste the password from step 2
5. Click **Verify and Save** — you will see a green confirmation

---

### Step 5 — Publish Your First AI Blog Post

1. Go to the **Write Blog** tab
2. Select your connected site
3. Enter a topic (e.g. `7 best budget smartphones for students in 2026`)
4. Optionally enter a focus keyword (e.g. `budget smartphones students`)
5. Click **Generate and Publish**

OniPress will:
1. Call `agy` (Gemini via your Gmail) to write a 1,500+ word full SEO article
2. Auto-generate a studio-quality 16:9 featured photo via Antigravity's native Google Imagen tool
3. Publish it directly to WordPress with RankMath SEO metadata filled in

---

## Project Structure

```
onipress/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.ts    # Core AI → WordPress pipeline (uses agy CLI)
│   │   │   ├── mcp/route.ts         # MCP server endpoint for AI assistant integration
│   │   │   ├── sites/route.ts       # WordPress site CRUD API
│   │   │   ├── posts/route.ts       # Post history API
│   │   │   └── settings/route.ts    # Settings persistence API
│   │   ├── page.tsx                 # Main dashboard with tabs
│   │   └── globals.css              # Dark glassmorphism design system
│   ├── components/
│   │   ├── AutoBlogger.tsx          # Blog generation form and published post history
│   │   ├── SiteManager.tsx          # WordPress site connection manager
│   │   └── ApiSettings.tsx          # Settings panel
│   └── lib/
│       └── db.ts                    # JSON file-based local storage for sites and posts
├── wp-plugin/
│   └── onipress-connect/
│       └── onipress-connect.php     # WordPress REST API plugin (upload this to WP)
├── data/                            # Auto-created at runtime — stores your site configs
├── package.json
└── README.md
```

---

## How It Works

```
[You click Generate & Publish]
           │
           ▼  POST /api/generate
  [Next.js API Route]
           │
           ▼  Spawns subprocess
  [agy CLI — Antigravity IDE]
           │  Authenticated by your Gmail session
           ▼
  [Google Gemini 2.5 Pro]
           │  Returns 1,500+ word JSON article
           ▼
  [SEO Sanitizer]
           │  Enforces: table, internal link, external link,
           │  keyword in H2, 1,000+ word minimum, focus keyword bold
           ▼
  [Pollinations AI Image API]
           │  Generates HD 1280x720 professional photo for the topic
           ▼  POST /wp-json/onipress/v1/posts
  [WordPress + OniPress Plugin]
           │  Sets: title, content, focus keyword, meta description,
           │        featured image alt, RankMath SEO score, permalink
           ▼
  [Live Published Post on WordPress ✅]
```

---

## SEO Rules Enforced Automatically

Every article generated by OniPress automatically includes:

| Rule | What it means |
|------|--------------|
| Minimum 1,200 words | Ensures RankMath word count check passes |
| Focus keyword in title | Required for RankMath title check |
| Focus keyword in first 100 words | Required for RankMath placement check (wrapped in bold) |
| Focus keyword in at least one H2 | Required for RankMath subheading check |
| Focus keyword in meta description | Required for RankMath meta check |
| Comparison table with thead/tbody | RankMath content richness |
| Internal link to site homepage | RankMath internal link check |
| External Wikipedia link | RankMath external link check |
| FAQ section with full answers | Content depth and People Also Ask coverage |
| RankMath score saved to post meta | Shows green score in wp-admin post list instead of N/A |
| Featured image alt text = focus keyword | RankMath image alt check |

---

## MCP Server Integration (Advanced)

OniPress exposes a Model Context Protocol (MCP) server at `http://localhost:3000/api/mcp`.

You can add it directly to Antigravity IDE:

```bash
agy mcp add onipress http://localhost:3000/api/mcp
```

Or add it to `~/.gemini/config/mcp_config.json`:

```json
{
  "servers": {
    "onipress": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

Available MCP tools:

| Tool | Description |
|------|-------------|
| `onipress_list_sites` | List all connected WordPress sites |
| `onipress_verify_site` | Verify connection status to a site |
| `onipress_generate_and_publish` | Generate a full SEO article and publish it |
| `onipress_publish_post` | Publish a pre-written article |
| `onipress_get_recent_posts` | Get recent published post history |
| `onipress_upload_media` | Upload an image from URL to WordPress media library |

---

## WordPress Plugin — REST API Reference

The plugin registers a secure REST endpoint:

```
POST /wp-json/onipress/v1/posts
Authorization: Bearer <WordPress Application Password>
Content-Type: application/json
```

Request body:

```json
{
  "title": "7 Best Hiking Trails in the Alps for Beginners",
  "content": "<h2>Introduction</h2><p>...</p><table>...</table>",
  "status": "publish",
  "focus_keyword": "Alps hiking trails",
  "seo_description": "Discover the 7 best Alps hiking trails for beginners...",
  "featured_image_url": "https://image.pollinations.ai/prompt/..."
}
```

Response:

```json
{
  "success": true,
  "post_id": 42,
  "post_url": "https://myblog.com/alps-hiking-trails/"
}
```

---

## Security

- The `data/` directory contains your WordPress application passwords — it is in `.gitignore` and **never committed to Git**
- Application Passwords are WordPress-native and can be revoked at any time from **Users → Profile → Application Passwords**
- OniPress only has permission to create posts — it cannot delete content or access user accounts
- The plugin verifies the `Bearer` token on every request

---

## Development

```bash
# Run with hot reload
npm run dev

# TypeScript type check
npx tsc --noEmit

# Production build
npm run build && npm start
```

---

## License

MIT License — free to use, modify, and redistribute.

---

## Credits

- **Google Gemini** — AI content generation via [Antigravity IDE](https://antigravity.ai)
- **Pollinations AI** — Free image generation at [pollinations.ai](https://pollinations.ai)
- **RankMath SEO** — WordPress SEO plugin at [rankmath.com](https://rankmath.com)
- **Next.js** — React framework at [nextjs.org](https://nextjs.org)
