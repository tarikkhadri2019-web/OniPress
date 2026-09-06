<div align="center">

![OniPress Banner](docs/images/onipress_banner.jpg)

# ⚡ OniPress — Autonomous AI Publishing & Indexing Engine

> **Autonomous, self-hosted WordPress AI publishing pipeline. Writes 1,500+ word RankMath 100/100 articles, generates high-res Google Imagen visuals, enforces backlink strategy, and triggers instant Googlebot indexing via Google Search Console API — 100% Free.**

[![License: MIT](https://img.shields.io/badge/License-MIT-ff7a18.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![AI: Google Gemini](https://img.shields.io/badge/Gemini_2.5_Pro-Local_Bridge-4285f4?logo=google)](https://antigravity.ai)
[![Visuals: Google Imagen](https://img.shields.io/badge/Imagen_Visuals-Native_Engine-ff7a18)](https://antigravity.ai)
[![Indexing: Google Official API](https://img.shields.io/badge/Google_Indexing_API-Instant_Crawl-34a853?logo=google)](https://developers.google.com/search)
[![RankMath](https://img.shields.io/badge/RankMath-100%2F100_SEO-e91e63)](https://rankmath.com)
[![MCP Protocol](https://img.shields.io/badge/MCP-v1.2_Ready-9333ea)](https://modelcontextprotocol.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-key-features) • [Why OniPress](#-why-onipress-vs-alternatives) • [Quick Start](#-quick-start-5-minutes) • [Google Indexing](#-google-search-console--instant-indexing) • [Architecture](#-architecture) • [MCP Protocol](#-model-context-protocol-mcp)

</div>

---

## 💡 The "IDE Trick" — Why You Never Pay for AI

Most automated blogging systems cost hundreds of dollars a month in OpenAI, Claude, or Midjourney API bills. **OniPress eliminates that entirely:**

- When you install the free **[Antigravity IDE](https://antigravity.ai)** and log in with your personal **Gmail account**, your workstation receives an authenticated AI CLI bridge (`agy`).
- OniPress connects locally to this authenticated bridge via PowerShell.
- You unlock unlimited, production-grade **Google Gemini** copywriting and **Google Imagen** featured image generation with **zero API keys, zero credits, and zero billing**.

---

## 🚀 Key Features

| Capability | What OniPress Delivers |
|---|---|
| **✍️ Autonomous Copywriting** | 1,200–1,800+ word comprehensive guides in semantic HTML, styled tables, key takeaways, FAQ, and structured subheadings. |
| **🎨 Google Imagen Visuals** | Generates photorealistic 16:9 studio-grade featured images directly via the native IDE engine and sideloads them to the WordPress Media Library with alt tags. |
| **🔍 Instant Google Indexing** | Integrated with the official **Google Web Search Indexing API v3**. Googlebot visits and indexes newly published articles in minutes instead of weeks. |
| **📊 GSC Telemetry** | Live Search Console dashboard tracking Clicks, Impressions, CTR, and Keyword Ranking positions with zero third-party tracking scripts. |
| **🔗 Backlinks Strategy Engine** | Define your internal and external domain authority anchors. OniPress forces them into generated articles to guarantee RankMath link requirements pass. |
| **🌐 Multi-Site WordPress** | Manage 10+ WordPress sites from a single unified dark-mode dashboard with one-click Bearer token verification. |
| **🤖 Model Context Protocol (MCP)** | Full MCP v1.2 JSON-RPC server (`/api/mcp`) allowing Claude Desktop, Cursor, and agentic workflows to publish and index autonomously. |

---

## 🥊 Why OniPress vs. Alternatives

| Feature | OniPress | Jasper / Copy.ai | Traditional Auto-Bloggers |
|---|:---:|:---:|:---:|
| **Monthly Cost** | **$0.00 / mo (Free)** | $49 – $129 / mo | $29 – $99 / mo |
| **API Keys Required** | ❌ None (Local Auth) | ❌ Proprietary SaaS | ⚠️ Expensive OpenAI Keys |
| **Featured Images** | ✅ Studio-Grade Google Imagen | ⚠️ Generic Stock Photos | ❌ Often None / Watermarked |
| **Googlebot Fast Indexing** | ✅ Official Indexing API (Minutes) | ❌ Wait Days/Weeks | ❌ Not Included |
| **RankMath 100/100 Ready** | ✅ Automated Compliance | ⚠️ Basic SEO | ❌ Often Fails Word Count |
| **Open Source & Self-Hosted** | ✅ 100% MIT | ❌ Closed SaaS | ⚠️ Mixed / Heavily Obfuscated |
| **Model Context Protocol (MCP)**| ✅ Native Endpoint | ❌ None | ❌ None |

---

## 🛠️ Requirements

- **[Antigravity IDE](https://antigravity.ai)** (Free desktop application — signed in with your Gmail account)
- **Node.js 18+** ([nodejs.org](https://nodejs.org))
- **WordPress Site** (Self-hosted with admin rights to install the lightweight companion plugin)

---

## ⚡ Quick Start (5 Minutes)

### 1. Verify Your Local AI Bridge

Install and launch [Antigravity IDE](https://antigravity.ai), sign in with your Google account, and keep it running in the background. Test the connection in PowerShell:

```powershell
agy --print "Hello, respond with: OK" --dangerously-skip-permissions
```
*(If it returns "OK", your Gemini AI bridge is fully active!)*

---

### 2. Clone & Run OniPress

```bash
# Clone the repository
git clone https://github.com/tarik7099/onipress.git
cd onipress

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

### 3. Install the WordPress Companion Plugin

1. Navigate to the `wp-plugin/onipress-connect/` directory in this repository.
2. Zip the `onipress-connect` folder (or copy it into `wp-content/plugins/` on your WordPress server).
3. In WP Admin: **Plugins → Installed Plugins** &rarr; Activate **OniPress Connect**.
4. Go to **Settings → OniPress** to find your **Site URL** and secure **Bearer Token**.

---

### 4. Connect Your Site in OniPress

1. In the OniPress Dashboard, click **Site Manager** &rarr; **Add New Site**.
2. Enter your Site Name, WordPress URL, and your WordPress Application Password or OniPress Token.
3. Click **Verify and Save**.

---

### 5. Publish Your First Article

1. Head to the **Write Blog** tab.
2. Enter any topic (e.g. *The Future of Solid-State Battery Technology in 2026*).
3. Click **Generate & Publish**.
4. OniPress writes the article, generates high-res Google Imagen photography, optimizes RankMath tags, sideloads the media to WordPress, and pings Googlebot for indexing!

---

## 🔍 Google Search Console & Instant Indexing

Stop waiting weeks for Google to discover your content. OniPress includes native integration with Google's official developer APIs:

1. **Web Search Indexing API v3**: Pings Googlebot the exact second your article goes live.
2. **Google Search Console API**: Fetches real search queries, impressions, clicks, and rankings.

### Setup Steps:
1. Enable **Web Search Indexing API** and **Google Search Console API** in [Google Cloud Console](https://console.cloud.google.com/).
2. Create a Service Account, generate a **JSON Key**, and download it.
3. In [Google Search Console](https://search.google.com/search-console), add the Service Account email as an **Owner** of your site property.
4. In OniPress, go to the **Google Indexing** tab and drop your JSON key file.

👉 *Read the full step-by-step tutorial: [docs/GSC_INTEGRATION_GUIDE.md](docs/GSC_INTEGRATION_GUIDE.md)*

---

## 🏗️ Architecture

```text
  ┌────────────────────────────────────────────────────────┐
  │                 OniPress User Dashboard                │
  │     Next.js 15 · Tailwind CSS · Dark Glassmorphism     │
  └───────────────────────────┬────────────────────────────┘
                              │
               POST /api/generate ──► Spawns Local Subprocess
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │                Antigravity IDE Local CLI               │
  │        Authenticated via your free Gmail session       │
  └─────────────┬────────────────────────────┬─────────────┘
                │                            │
                ▼                            ▼
  ┌───────────────────────────┐┌───────────────────────────┐
  │     Google Gemini AI      ││    Google Imagen Engine   │
  │ Writes 1,500+ word guide  ││ Creates 16:9 HD visuals   │
  │ with semantic HTML & FAQ  ││ Sideloaded via base64     │
  └─────────────┬─────────────┘└─────────────┬─────────────┘
                │                            │
                └─────────────┬──────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 SEO Sanitization Engine                │
  │  - Injects target internal/external backlink anchors   │
  │  - Inserts semantic table with <thead> and <tbody>     │
  │  - Optimizes focus keyword in H1, H2, and lead text    │
  └───────────────────────────┬────────────────────────────┘
                              │
            POST /wp-json/onipress/v1/posts
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │           WordPress + OniPress Connect Plugin          │
  │  Sets RankMath/Yoast meta, tags, category & thumbnail  │
  └───────────────────────────┬────────────────────────────┘
                              │
                 Article Live on Web (Post URL)
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │           Google Web Search Indexing API v3            │
  │     Dispatches instant crawl notification to Google    │
  └────────────────────────────────────────────────────────┘
```

---

## 🤖 Model Context Protocol (MCP)

OniPress acts as a first-class MCP server at `http://localhost:3000/api/mcp`. You can plug it into Claude Desktop, Cursor, or Antigravity IDE:

```json
{
  "mcpServers": {
    "onipress": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

### Available MCP Tools:
- `onipress_list_sites`: List all connected WordPress sites and their tags.
- `onipress_generate_and_publish`: Autonomous AI article generation & publishing.
- `onipress_gsc_index_url`: Request immediate Googlebot crawl for any live URL.
- `onipress_gsc_get_metrics`: Query live Search Console performance (clicks, impressions, position).
- `onipress_list_backlinks`: Retrieve internal/external backlinks configured in your SEO strategy.
- `onipress_upload_media`: Upload images directly into WordPress media library.

---

## 🔒 Security & Privacy

- **Zero Cloud Leakage**: Site passwords and API configs are stored in local JSON files under `data/`, which is strictly excluded via `.gitignore`.
- **Application Passwords**: Uses native WordPress Application Passwords that can be revoked in one click from WP Admin.
- **Constant-Time Verification**: The companion plugin uses cryptographically secure `hash_equals` verification.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with precision for the global open-source community by <a href="https://github.com/tarik7099">tarik7099</a>.</sub>
</div>
