# 🔍 Google Search Console & Instant Indexing Integration Guide
> **100% Free Official Google API Integration for Instant Googlebot Indexing & Live Search Telemetry**

---

## 🌟 Why Link Google Search Console to OniPress?

By default, newly published articles on WordPress can take anywhere from **3 days to 4 weeks** to be crawled and indexed by Googlebot.

By linking your Google Search Console credentials with OniPress:
1. **Instant Indexing**: Every newly published article pings Google's official **Web Search Indexing API v3** in real time. Googlebot visits and indexes your URL within minutes!
2. **Zero Cost**: Google provides this official API **completely free of charge** (up to 200 URLs submitted per day per project).
3. **Live Telemetry in OniPress**: Track live Clicks, Impressions, Click-Through Rate (CTR), and average Google ranking positions directly from the OniPress Dashboard without needing third-party SaaS tools.
4. **MCP Agent Ready**: Your AI agents (Cursor, Claude, Antigravity) can trigger indexing on demand via MCP tool calls (`onipress_gsc_index_url`).

---

## 📋 5-Minute Setup Walkthrough

### Step 1: Create a Project in Google Cloud Console
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top &rarr; **New Project**.
3. Name your project (e.g. `OniPress-SEO-Engine`) and click **Create**.

---

### Step 2: Enable the Two Required Google APIs
In the Google Cloud Console, navigate to **APIs & Services &rarr; Library**:
1. Search for **"Web Search Indexing API"** (or `Indexing API`) &rarr; Click **Enable**.
2. Search for **"Google Search Console API"** &rarr; Click **Enable**.

---

### Step 3: Create a Service Account & Download the JSON Key
1. In the Cloud Console, go to **IAM & Admin &rarr; Service Accounts**.
2. Click **+ Create Service Account**.
   - **Name**: `onipress-bot`
   - **ID**: `onipress-bot@your-project-id.iam.gserviceaccount.com`
   - Click **Create and Continue**, then click **Done** (no extra roles needed here).
3. In the list of service accounts, click on the newly created `onipress-bot` account.
4. Go to the **Keys** tab at the top.
5. Click **Add Key &rarr; Create new key**.
6. Select **JSON** and click **Create**. A file named `your-project-xxxx.json` will automatically download to your computer.

---

### Step 4: Add the Service Account to Google Search Console
1. Open [Google Search Console](https://search.google.com/search-console).
2. Select your website property in the top-left dropdown (e.g., `https://myblog.com` or `sc-domain:myblog.com`).
3. In the left sidebar, click **Settings &rarr; Users and permissions**.
4. Click **Add User** in the top right.
5. In the **Email address** field, paste your Service Account client email from Step 3:
   ```
   onipress-bot@your-project-id.iam.gserviceaccount.com
   ```
6. In **Permission**, choose **Owner** (Owner permission is required by Google's Indexing API).
7. Click **Add**.

---

### Step 5: Connect in the OniPress Dashboard
1. Open your OniPress Dashboard (`http://localhost:3000`).
2. Click the **Search Console** tab in the sidebar.
3. Click **Select .json Key File** and choose the downloaded JSON file from Step 3 (or paste the email and private key manually).
4. Ensure **Auto-Ping Google Indexing API when post is published** is checked.
5. Click **Verify & Save GSC Credentials**.
6. Go to the **Sites** tab to add the specific Google Search Console property URL (e.g., `https://myblog.com/` or `sc-domain:myblog.com`) for each of your connected WordPress sites.

You will see a glowing green **"Connected & Verified"** badge.

---

## ⚡ How It Works Under the Hood

```text
┌────────────────────────────────────────────────────────┐
│               OniPress Autonomous Publisher            │
└───────────────────────────┬────────────────────────────┘
                            │  1. Article Published
                            ▼
┌────────────────────────────────────────────────────────┐
│           WordPress + OniPress Connect Plugin          │
│       RankMath 100/100 · Featured Image Sideloaded     │
└───────────────────────────┬────────────────────────────┘
                            │  2. Returns Live Post URL
                            ▼
┌────────────────────────────────────────────────────────┐
│           OniPress Native RS256 JWT Generator          │
│        Signs request with Service Account Private Key  │
└───────────────────────────┬────────────────────────────┘
                            │  3. Exchanges for Google OAuth2 Bearer Token
                            ▼
┌────────────────────────────────────────────────────────┐
│          Google Web Search Indexing API v3             │
│        POST https://indexing.googleapis.com/v3...      │
└───────────────────────────┬────────────────────────────┘
                            │  4. Immediate Googlebot crawl scheduled
                            ▼
┌────────────────────────────────────────────────────────┐
│             Googlebot crawls URL in minutes 🚀         │
└────────────────────────────────────────────────────────┘
```

---

## 🤖 Using with MCP (Model Context Protocol)

Your AI coding agents can interact directly with the Google Search Console engine:

### Index a URL
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "onipress_gsc_index_url",
    "arguments": {
      "url": "https://myblog.com/breakthrough-quantum-computing-2026/",
      "type": "URL_UPDATED"
    }
  }
}
```

### Fetch 28-Day Search Analytics
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "onipress_gsc_get_metrics",
    "arguments": {
      "days": 28
    }
  }
}
```

---

## ❓ FAQ & Troubleshooting

### Error: "Permission denied for target URL"
- **Solution**: The Service Account email must be added as an **Owner** in Google Search Console, not just "Full" or "Restricted".

### Does this violate Google guidelines?
- **No**: This uses the **official Google Indexing API** (`indexing.googleapis.com`) and **Google Search Console API** (`webmasters.googleapis.com`), officially supported and maintained by Google.

### What is the daily quota?
- Google provides **200 URL submissions per day** for free per Google Cloud project. If you publish more than 200 posts daily, you can request a quota increase directly in Google Cloud Console.
