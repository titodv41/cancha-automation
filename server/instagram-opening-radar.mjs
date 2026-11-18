// Pure helpers for the Instagram opening radar (report only): find recent public posts from club accounts that look
// like a tryout or a call for players. Nothing here publishes, comments or messages anyone.
const SIGNALS = [
  /\btry\s?-?outs?\b/i, /\bopen\s+(trials?|tryouts?|practice|talent)\b/i, /\btalent\s+id\b/i, /\bid\s+camp\b/i, /\bcombine\b/i,
  /\blooking\s+for\s+(players?|a\s+(keeper|goalkeeper|striker|defender|midfielder|winger))\b/i, /\bplayers?\s+wanted\b/i, /\brecruit(ing|ment)\b/i,
  /\bpruebas?\b/i, /\bconvocatoria\b/i, /\bbuscamos\s+(jugador|arquer|portero)/i, /\bse\s+buscan?\s+jugador/i, /\bvisorias?\b/i, /\btryout\b/i,
];
// Youth programs are not adult openings; they are flagged so they are never listed in the adults-only app.
const YOUTH = /\b(u-?(?:[4-9]|1[0-8])\b|born\s+(?:in\s+)?20(?:0[89]|1\d)|20(?:0[89]|1\d)\s*-\s*20(?:0\d|1\d)|ages?\s+\d{1,2}\s*(?:-|to)\s*1[0-7]\b|boys|girls|ecnl|mls\s+next|academy\s+tryouts?)/i;
const HANDLE = /^[a-z0-9._]{1,30}$/;
export const validHandle = h => typeof h === 'string' && HANDLE.test(h);
export function signals(caption = '') { return SIGNALS.filter(r => r.test(caption)).map(r => caption.match(r)[0].toLowerCase()); }
export const youth = (caption = '') => YOUTH.test(caption);
export function mentions(caption = '') {
  return [...new Set([...String(caption).matchAll(/(?:^|[^\w.])@([a-z0-9._]{2,30})/gi)].map(m => m[1].toLowerCase().replace(/\.+$/, '')).filter(validHandle))];
}
// Only recent posts count: an old tryout post is not an opening.
export function candidates(club, media = [], now = new Date(), maxAgeDays = 60) {
  const cutoff = now.getTime() - maxAgeDays * 864e5;
  return media.filter(m => m?.permalink && Date.parse(m.timestamp) >= cutoff).map(m => ({ club: club.club, handle: club.handle,
    permalink: m.permalink, postedAt: m.timestamp, matched: signals(m.caption), youth: youth(m.caption), caption: String(m.caption || '').slice(0, 1500) }))
    .filter(c => c.matched.length);
}
// Business discovery field list: profile name/bio (to confirm it is a soccer club), captions, dates and links.
// No follower counts or other account metrics.
export const discoveryFields = handle => `business_discovery.username(${handle}){username,name,biography,media.limit(30){caption,timestamp,permalink}}`;
