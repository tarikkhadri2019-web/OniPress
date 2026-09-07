<div align="center">

![OniPress Banner](docs/images/onipress_banner.jpg)

# OniPress — Autonomous Gemini AI Publishing Dashboard

> **A self-hosted, autonomous WordPress publishing pipeline powered by Google Gemini AI. Generates comprehensive 1,500+ word articles, provisions high-resolution featured images, enforces SEO backlink strategies, and triggers immediate indexing via Google Search Console — all from a single dashboard.**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-black?logo=typescript)](https://www.typescriptlang.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-v1.2_Ready-black)](https://modelcontextprotocol.io)

</div>

---

## ⚡ The Zero-Cost Architecture

Traditional auto-blogging SaaS platforms charge hundreds of dollars monthly for OpenAI and Midjourney API usage. OniPress takes a fundamentally different approach.

By running the free **[Antigravity IDE](https://antigravity.ai)** locally and authenticating with your personal Gmail account, your machine establishes an authenticated CLI bridge. OniPress connects to this bridge, granting you access to production-grade **Google Gemini** copywriting and **Google Imagen** visuals with **zero API keys, zero credits, and zero billing**.

## 🚀 Core Capabilities

| Feature | Description |
| :--- | :--- |
| **Autonomous Copywriting** | Generates 1,200–1,800+ word SEO guides structured with semantic HTML, tables, key takeaways, and FAQs. |
| **Native Visual Engine** | Provisions photorealistic 16:9 featured images via Google Imagen, sideloading them directly into the WP Media Library. |
| **Instant Google Indexing** | Bypasses crawl wait times using the official **Google Web Search Indexing API v3** to ping Googlebot immediately. |
| **Unified Telemetry** | A single dashboard displaying live Google Search Console rankings alongside live Google Analytics 4 (GA4) traffic data. |
| **Strategic Backlinking** | Weaves target internal/external domain authority anchors semantically into generated content to satisfy RankMath. |
| **Multi-Site Architecture** | Manage an unlimited number of WordPress sites from a centralized interface via secure Bearer token authentication. |


---

## 🛠️ Step-by-Step Setup Guide

Setting up OniPress requires configuring three separate environments: Your WordPress site, Google Cloud, and Google Search Console. 

### Phase 1: WordPress Plugin Configuration

1. Locate the `wp-plugin/onipress-connect/` directory inside this repository.
2. Compress the `onipress-connect` folder into a `.zip` file.
3. Log into your WordPress Admin panel.
4. Navigate to **Plugins &rarr; Add New Plugin &rarr; Upload Plugin**.
5. Upload the `.zip` file, click **Install Now**, and then **Activate**.
6. Navigate to **Settings &rarr; OniPress**. Copy your secure **Bearer Token**.

### Phase 2: Google Cloud & Service Account

To enable instant indexing and telemetry, you must provision a Google Cloud Service Account.

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `OniPress-Engine`).
3. Go to **APIs & Services &rarr; Library** and enable the following APIs:
   - **Web Search Indexing API**
   - **Google Search Console API**
   - **Google Analytics Data API** (If using GA4)
4. Navigate to **IAM & Admin &rarr; Service Accounts** and click **Create Service Account** (e.g., `onipress-bot`).
5. Open the newly created account, go to the **Keys** tab, and click **Add Key &rarr; Create New Key (JSON)**. 
6. Save the downloaded `.json` file securely to your local machine.

### Phase 3: Google Search Console Permissions

Google's Indexing API requires strict ownership verification.

1. Navigate to [Google Search Console](https://search.google.com/search-console).
2. Select your target property in the top-left dropdown.
3. In the left sidebar, click **Settings**.
4. Click **Users and permissions**.
5. Click **Add User**.
6. Paste the email address of the Service Account you created in Phase 2 (e.g., `onipress-bot@your-project.iam.gserviceaccount.com`).
7. **Critical**: Set the permission level dropdown to **Owner** (Propriétaire). If this is set to "Full", the Indexing API will reject all requests.
8. Click **Add**.

### Phase 4: Launch OniPress

With the prerequisites complete, you can now launch the dashboard.

```bash
# Clone the repository
git clone https://github.com/tarikkhadri2019-web/OniPress.git
cd OniPress

# Install dependencies
npm install

# Start the application
npm run dev
```

1. Open `http://localhost:3000`.
2. Navigate to the **Search Console** tab and upload your `.json` key file to verify your Service Account.
3. Navigate to the **Site Manager** tab and add your WordPress site using the URL and the Bearer Token from Phase 1. 
4. (Optional) Enter your GA4 Property ID to enable the Google Analytics dashboard.

---

## 🤖 Model Context Protocol (MCP)

OniPress ships with a native MCP v1.2 JSON-RPC server at `http://localhost:3000/api/mcp`. This allows agentic IDEs like Cursor, Claude Desktop, and Antigravity IDE to execute SEO workflows autonomously.

```json
{
  "mcpServers": {
    "onipress": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

**Exposed Capabilities:**
- `onipress_generate_and_publish`: Autonomous article generation and WP deployment.
- `onipress_gsc_index_url`: Dispatch instant Googlebot crawl requests.
- `onipress_gsc_get_metrics`: Query live Search Console performance (clicks, impressions, position).
- `onipress_ga4_get_metrics`: Query live GA4 traffic and top performing pages.
- `onipress_upload_media`: Push local assets to the WordPress media library.

---

## 🔒 Security Posture

- **Zero Cloud Leakage**: API configurations and Application Passwords are encrypted and stored entirely in local JSON files under `data/` (excluded via `.gitignore`).
- **Cryptographic Verification**: The companion WP plugin utilizes secure `hash_equals` time-constant verification to prevent timing attacks.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
