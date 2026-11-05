// Refreshes data/youtube-stats.json from the YouTube Data API v3.
// Run by .github/workflows/youtube-stats.yml, or by hand:  YT_API_KEY=... node scripts/update-youtube-stats.mjs
// The key is read from the environment and never written to the site.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const KEY = process.env.YT_API_KEY;
const CHANNEL = process.env.YT_CHANNEL_ID || 'UCRvzYUcd-Fm7SScCaC7UHNg';
const OUT = new URL('../data/youtube-stats.json', import.meta.url);

if (!KEY) {
  console.log('YT_API_KEY is not set: leaving data/youtube-stats.json as it is.');
  process.exit(0);
}

const url = 'https://www.googleapis.com/youtube/v3/channels?part=statistics&id=' + encodeURIComponent(CHANNEL) + '&key=' + encodeURIComponent(KEY);
const res = await fetch(url);
const body = await res.json().catch(() => ({}));
if (!res.ok) {
  const why = body.error && (body.error.details?.[0]?.reason || body.error.message) || 'HTTP ' + res.status;
  console.error('YouTube API refused the request: ' + why);
  process.exit(1);
}

const s = body.items && body.items[0] && body.items[0].statistics;
const views = Number(s && s.viewCount);
const subs = Number(s && s.subscriberCount);
if (!s || !Number.isFinite(views) || (!s.hiddenSubscriberCount && !Number.isFinite(subs))) {
  console.error('Unexpected API answer, nothing written.');
  process.exit(1);
}

const next = {
  subscribers: s.hiddenSubscriberCount ? null : subs,
  views,
  asOf: new Date().toISOString().slice(0, 10),
  updatedAt: new Date().toISOString()
};

let prev = {};
try { prev = JSON.parse(await readFile(OUT, 'utf8')); } catch { /* first run */ }
if (prev.subscribers === next.subscribers && prev.views === next.views) {
  console.log('No change (' + next.subscribers + ' subscribers, ' + next.views + ' views).');
  process.exit(0);
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(OUT, JSON.stringify(next, null, 2) + '\n');
console.log('Updated: ' + next.subscribers + ' subscribers, ' + next.views + ' views.');
