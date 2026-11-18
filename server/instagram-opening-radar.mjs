// Pure helpers for the Instagram opening radar (report only): find recent public posts from club accounts that look
// like a tryout or a call for players. Nothing here publishes, comments or messages anyone.
const SIGNALS = [
  /\btry\s?-?outs?\b/i, /\bopen\s+(trials?|tryouts?|practice)\b/i, /\bid\s+camp\b/i, /\bcombine\b/i,
  /\blooking\s+for\s+(players?|a\s+(keeper|goalkeeper|striker|defender|midfielder|winger))\b/i, /\bplayers?\s+wanted\b/i,
  /\bpruebas?\b/i, /\bconvocatoria\b/i, /\bbuscamos\s+(jugador|arquer|portero)/i, /\bse\s+buscan?\s+jugador/i, /\bvisorias?\b/i,
];
const HANDLE = /^[a-z0-9._]{1,30}$/;
export const validHandle = h => typeof h === 'string' && HANDLE.test(h);
export function signals(caption = '') { return SIGNALS.filter(r => r.test(caption)).map(r => caption.match(r)[0].toLowerCase()); }
// Only recent posts count: an old tryout post is not an opening.
export function candidates(club, media = [], now = new Date(), maxAgeDays = 45) {
  const cutoff = now.getTime() - maxAgeDays * 864e5;
  return media.filter(m => m?.permalink && Date.parse(m.timestamp) >= cutoff).map(m => ({ club: club.club, handle: club.handle,
    permalink: m.permalink, postedAt: m.timestamp, matched: signals(m.caption), caption: String(m.caption || '').slice(0, 500) }))
    .filter(c => c.matched.length);
}
// Business discovery field list: captions, dates and links only. No follower counts or other account metrics.
export const discoveryFields = handle => `business_discovery.username(${handle}){username,media.limit(25){caption,timestamp,permalink}}`;
