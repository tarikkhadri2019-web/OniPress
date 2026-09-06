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
  "title": "Top 5 Air Fresheners for Cars in Morocco",
  "content": "<h2>Why Air Freshener Matters</h2><p>Article body here...</p>",
  "status": "publish",
  "focus_keyword": "car air freshener Morocco",
  "seo_description": "Discover the longest-lasting car air fresheners in Morocco with fruity and fresh scents.",
  "featured_image_url": "https://example.com/fruit_orange.jpg",
  "category_names": ["Automotive", "Lifestyle"],
  "tag_names": ["Onifresh", "Air Freshener", "Morocco"]
}
```

### Auto-SEO Features:
- **RankMath**: Automatically sets `rank_math_focus_keyword`, `rank_math_description`, and `rank_math_title`.
- **Yoast SEO**: Automatically sets `_yoast_wpseo_focuskw`, `_yoast_wpseo_metadesc`, and `_yoast_wpseo_title`.
- **Featured Image**: Automatically downloads `featured_image_url`, uploads it to Media Library, and assigns it as the featured thumbnail (`_thumbnail_id`) in a single call!

---

## 🤖 MCP (Model Context Protocol) Support

OniPress Connect includes an MCP-compatible manifest at `/wp-json/onipress/v1/mcp`. You can connect Claude Desktop or custom agents to call `onipress_create_post`, `onipress_upload_media`, and `onipress_site_info`.

---

## 🔒 Security

- 48-character cryptographically random token generated upon plugin activation (`wp_generate_password(48, false)`).
- Token is safely verified with constant-time string comparison (`hash_equals`).
- Regenerate secret token at any time with one click from WP Admin.

---

## 📄 License

MIT — Free and Open Source for the world 🌍
