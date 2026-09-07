import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

export interface Site {
  id: string;
  name: string;
  url: string;
  gscUrl?: string;
  ga4PropertyId?: string;
  username: string;
  applicationPassword?: string;
  tags: string[];
}

// Legacy: kept for backward compat with old settings.json files
export interface Settings {
  openRouterApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  customApiUrl?: string;
  customApiKey?: string;
}

export interface PostRecord {
  id: string;
  title: string;
  siteName: string;
  siteUrl: string;
  postUrl?: string;
  status: 'Live' | 'Draft' | 'Failed';
  date: string;
  performance: string;
  type: 'Blog Post' | 'Newsletter' | 'Social Post' | 'SEO Optimized Article';
  wordCount?: number;
  focusKeyword?: string;
  hasKeywordInTitle?: boolean;
  keywordDensity?: number;
  hasTOC?: boolean;
  hasTable?: boolean;
  hasImageWithAlt?: boolean;
  hasCitations?: boolean;
  seoScore?: number;
}

export interface TopicIdea {
  id: string;
  title: string;
  focusKeyword: string;
  scheduledDay?: number;
  status: 'Pending' | 'Generating' | 'Published' | 'Failed';
  publishedPostId?: string;
  publishedUrl?: string;
  publishedAt?: string;
  error?: string;
}

export interface Campaign {
  id: string;
  name: string;
  niche: string;
  targetSiteId: string;
  targetSiteName: string;
  status: 'Active' | 'Paused' | 'Completed';
  frequency: 'Daily' | 'Twice Daily' | 'Weekly' | 'Manual';
  topics: TopicIdea[];
  createdAt: string;
}

// Ensure data dir exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function getSites(): Site[] {
  const file = path.join(dataDir, 'sites.json');
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveSites(sites: Site[]) {
  const file = path.join(dataDir, 'sites.json');
  fs.writeFileSync(file, JSON.stringify(sites, null, 2));
}

export function getSettings(): Settings {
  const file = path.join(dataDir, 'settings.json');
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveSettings(settings: Settings) {
  const file = path.join(dataDir, 'settings.json');
  fs.writeFileSync(file, JSON.stringify(settings, null, 2));
}

export function getPosts(): PostRecord[] {
  const file = path.join(dataDir, 'posts.json');
  if (!fs.existsSync(file)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

export function savePost(post: PostRecord) {
  const posts = getPosts();
  // If post already exists, replace it
  const existingIdx = posts.findIndex(p => p.id === post.id);
  if (existingIdx >= 0) {
    posts[existingIdx] = post;
  } else {
    posts.unshift(post);
  }
  const file = path.join(dataDir, 'posts.json');
  fs.writeFileSync(file, JSON.stringify(posts, null, 2));
}

export function deletePost(id: string) {
  const posts = getPosts().filter(p => p.id !== id);
  const file = path.join(dataDir, 'posts.json');
  fs.writeFileSync(file, JSON.stringify(posts, null, 2));
}

export function getCampaigns(): Campaign[] {
  const file = path.join(dataDir, 'campaigns.json');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveCampaigns(campaigns: Campaign[]) {
  const file = path.join(dataDir, 'campaigns.json');
  fs.writeFileSync(file, JSON.stringify(campaigns, null, 2));
}

export function saveCampaign(campaign: Campaign) {
  const camps = getCampaigns();
  const idx = camps.findIndex(c => c.id === campaign.id);
  if (idx >= 0) {
    camps[idx] = campaign;
  } else {
    camps.unshift(campaign);
  }
  saveCampaigns(camps);
}

export function deleteCampaign(id: string) {
  const camps = getCampaigns().filter(c => c.id !== id);
  saveCampaigns(camps);
}

// ─────────────────────────────────────────────
// BACKLINKS & INTERNAL/EXTERNAL LINKS ENGINE
// ─────────────────────────────────────────────
export interface Backlink {
  id: string;
  url: string;
  anchorText: string;
  type: 'internal' | 'external';
  targetKeyword?: string;
  active: boolean;
  createdAt: string;
}

export function getBacklinks(): Backlink[] {
  const file = path.join(dataDir, 'backlinks.json');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveBacklinks(backlinks: Backlink[]) {
  const file = path.join(dataDir, 'backlinks.json');
  fs.writeFileSync(file, JSON.stringify(backlinks, null, 2));
}

export function saveBacklink(link: Backlink) {
  const list = getBacklinks();
  const idx = list.findIndex(b => b.id === link.id);
  if (idx >= 0) {
    list[idx] = link;
  } else {
    list.unshift(link);
  }
  saveBacklinks(list);
}

export function deleteBacklink(id: string) {
  const list = getBacklinks().filter(b => b.id !== id);
  saveBacklinks(list);
}

// ─────────────────────────────────────────────
// GOOGLE SEARCH CONSOLE & INDEXING API ENGINE
// ─────────────────────────────────────────────
export interface GscConfig {
  clientEmail: string;          // service account email
  privateKey: string;           // PEM RSA private key
  autoIndexOnPublish: boolean;
  status: 'unconfigured' | 'connected' | 'error';
  lastChecked?: string;
  lastError?: string;
}

export interface GscIndexLog {
  id: string;
  url: string;
  type: 'URL_UPDATED' | 'URL_DELETED';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  submittedAt: string;
  responseMessage?: string;
}

export function getGscConfig(): GscConfig {
  const file = path.join(dataDir, 'gsc_config.json');
  if (!fs.existsSync(file)) {
    return {
      clientEmail: '',
      privateKey: '',
      autoIndexOnPublish: true,
      status: 'unconfigured',
    };
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return {
      clientEmail: '',
      privateKey: '',
      autoIndexOnPublish: true,
      status: 'unconfigured',
    };
  }
}

export function saveGscConfig(config: GscConfig) {
  const file = path.join(dataDir, 'gsc_config.json');
  fs.writeFileSync(file, JSON.stringify(config, null, 2));
}

export function getGscLogs(): GscIndexLog[] {
  const file = path.join(dataDir, 'gsc_logs.json');
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveGscLog(log: GscIndexLog) {
  const logs = getGscLogs();
  logs.unshift(log);
  if (logs.length > 100) logs.pop(); // Keep last 100 entries
  const file = path.join(dataDir, 'gsc_logs.json');
  fs.writeFileSync(file, JSON.stringify(logs, null, 2));
}

