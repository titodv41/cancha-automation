import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseHTML} from 'linkedom';

// Exact, manually reviewed documents. This is not an arbitrary-URL news crawler.
const reviewed = JSON.parse(readFileSync(new URL('../config/local-editorial-sources.json', import.meta.url)));
const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
export function localStoryDescriptor(id) { return reviewed.find(source => source.id === id); }
export function localStoryHash(source) { return createHash('sha256').update(JSON.stringify(source)).digest('hex'); }
export function reviewedLocalStory(row) {
  const source = localStoryDescriptor(row.editorialSourceId);
  return !!source && row.sourceHash === localStoryHash(source) && row.officialSourceUrl === source.documents[0].url;
}
async function boundedHtml(response) {
  if (!response.ok || !/text\/html/i.test(response.headers.get('content-type') || '')) {
    await response.body?.cancel(); throw Error('Official editorial source unavailable');
  }
  const reader = response.body.getReader(), chunks = []; let length = 0;
  try {
    while (true) {
      const {done, value} = await reader.read(); if (done) break;
      length += value.length;
      if (length > 2_000_000) throw Error('Editorial source exceeds size limit');
      chunks.push(Buffer.from(value));
    }
  } finally { await reader.cancel(); }
  return Buffer.concat(chunks).toString('utf8');
}
export async function confirmLocalStorySource(row, {fetchImpl = fetch, now = Date.now()} = {}) {
  if (!reviewedLocalStory(row)) return false;
  const source = localStoryDescriptor(row.editorialSourceId);
  if (!Number.isFinite(now) || now >= Date.parse(source.validUntil)) return false;
  for (const doc of source.documents) {
    const response = await fetchImpl(doc.url, {redirect: 'error', signal: AbortSignal.timeout(25000)});
    const {document} = parseHTML(await boundedHtml(response));
    for (const node of document.querySelectorAll('script,style,nav,header,footer,noscript')) node.remove();
    const text = normalize(document.body?.textContent || '');
    if (!doc.facts.every(fact => text.includes(normalize(fact)))) return false;
  }
  return true;
}
