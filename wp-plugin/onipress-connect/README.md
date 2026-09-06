# ⚡ OniPress Connect — Universal WordPress AI & MCP Plugin

Connects any WordPress site to the **OniPress Dashboard** and any **Model Context Protocol (MCP)** AI client (Claude Desktop, Cursor, Antigravity, or custom agents) using a secure, auto-generated Bearer token.

Works with **RankMath SEO** and **Yoast SEO** out of the box.

---

## 🚀 Quick Setup (30 Seconds)

1. Copy the `onipress-connect` folder into your WordPress `wp-content/plugins/` directory.
2. In your WordPress Admin, go to **Plugins → Installed Plugins** and activate **OniPress Connect**.
3. Go to **Settings → OniPress** in WP Admin to view your **WordPress Site URL** and secret **OniPress Token**.
4. Paste the URL and Token into your **OniPress Dashboard → Site Manager** (or configure in MCP).
5. Click **Verify** — you're connected!

---

## 📡 Endpoints Reference

All endpoints are scoped under `/wp-json/onipress/v1` and require the header:  
`Authorization: Bearer <your-secret-token>`

| Method | Endpoint | Description |
|---|---|---|
| `GET / POST` | `/mcp` | **Model Context Protocol (MCP)** manifest & tool definitions |
| `GET` | `/ping` | Health-check & connection verification |
| `GET` | `/info` | WordPress site info (name, version, RankMath & Yoast status) |
| `POST` | `/posts` | Create & publish post with SEO meta & featured image |
| `DELETE` | `/posts/<id>` | Delete a post by ID |
| `POST` | `/media/upload-from-url` | Download image from URL and add to Media Library |
| `GET` | `/categories` | List all site categories |

---

## 📝 Create Post Payload (`POST /posts`)

```json
{
  "title": "The Complete Guide to Next-Gen Quantum Computing in 2026",
  "content": "<h2>Why Architecture Matters</h2><p>Comprehensive article body here...</p>",
  "status": "publish",
  "focus_keyword": "quantum computing 2026",
  "seo_description": "Master the fundamentals and future of quantum computing with our detailed 2026 technical guide.",
  "featured_image_base64": "data:image/jpeg;base64,...",
  "category_names": ["Technology", "Engineering"],
  "tag_names": ["AI", "Quantum", "Future Tech"]
}
```

### Auto-SEO Features:
- **RankMath**: Automatically sets `rank_math_focus_keyword`, `rank_math_description`, and `rank_math_title`.
- **Yoast SEO**: Automatically sets `_yoast_wpseo_focuskw`, `_yoast_wpseo_metadesc`, and `_yoast_wpseo_title`.
- **Featured Image**: Automatically embeds `featured_image_base64` or downloads `featured_image_url`, uploads to Media Library, and assigns it as the featured thumbnail (`_thumbnail_id`) in a single call!

---

## 🔍 Google Search Console & Instant Indexing

When integrated with OniPress:
1. Whenever a post is published via `/posts`, OniPress automatically dispatches an immediate crawl ping to **Google Web Search Indexing API v3**.
2. Googlebot visits and indexes the new post within minutes instead of waiting days or weeks.
3. Live Search Console telemetry (Clicks, Impressions, CTR, Keywords position) is automatically synced.

---

## 🤖 MCP (Model Context Protocol) Support

OniPress Connect includes an MCP-compatible manifest at `/wp-json/onipress/v1/mcp` and the OniPress Next.js bridge at `/api/mcp`. You can connect Claude Desktop, Cursor, or Antigravity IDE to call:
- `onipress_generate_and_publish` — Full autonomous generation & publish
- `onipress_gsc_index_url` — Submit URL directly to Googlebot for instant indexing
- `onipress_gsc_get_metrics` — Fetch real Google Search Console metrics
- `onipress_list_backlinks` — Inspect internal & external linking database

---

## 🔒 Security

- 48-character cryptographically random token generated upon plugin activation (`wp_generate_password(48, false)`).
- Token is safely verified with constant-time string comparison (`hash_equals`).
- Regenerate secret token at any time with one click from WP Admin.

---

## 📄 License

MIT — Free and Open Source for the world 🌍
