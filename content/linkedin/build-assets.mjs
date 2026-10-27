import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

// LinkedIn-only, local renderer. No provider calls, account writes or publication.
const base = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await readFile(join(base, 'content.json'), 'utf8'));
const out = join(base, 'exports');
await mkdir(out, { recursive: true });
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const logoBytes = await readFile(join(base, 'sources/cancha-wordmark-original.png'));
if (hash(logoBytes) !== '44debf4b6bcc76af8bd96bd4b6e5bda870a1af689d057c95eac9f6ec99f17955') {
  throw Error('Inspect and approve any changed source logo before rendering');
}
const logo = 'data:image/png;base64,' + logoBytes.toString('base64');
const display = (await readFile(join(base, 'sources/display.woff2'))).toString('base64');
const supporting = (await readFile(join(base, 'sources/supporting-700.woff2'))).toString('base64');
const fontCss = `@font-face{font-family:CanchaDisplay;src:url(data:font/woff2;base64,${display}) format('woff2');font-weight:700;font-style:italic}@font-face{font-family:CanchaSupport;src:url(data:font/woff2;base64,${supporting}) format('woff2');font-weight:700;font-style:normal}`;
const colors = { forest: '#103f32', cream: '#f5f3e9', lime: '#d7ef86' };
const wordmark = (x, y, width) => `<svg x="${x}" y="${y}" width="${width}" height="${width * 345 / 1319}" viewBox="92 325 1319 345" overflow="hidden"><image width="1536" height="1024" href="${logo}"/></svg>`;
const text = (x, y, value, size, { color = colors.forest, display: isDisplay = false, anchor = 'start', max = 0 } = {}) => `<text x="${x}" y="${y}" fill="${color}" font-family="${isDisplay ? 'CanchaDisplay' : 'CanchaSupport'}" font-size="${size}" font-weight="700" font-style="${isDisplay ? 'italic' : 'normal'}" text-anchor="${anchor}"${max ? ` data-max-width="${max}"` : ''}>${escape(value)}</text>`;
function svg(width, height, title, body, background = colors.cream) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(title)}"><title>${escape(title)}</title><defs><style>${fontCss}</style></defs><rect width="${width}" height="${height}" fill="${background}"/>${body}</svg>`;
}
const cover = svg(1512, 256, 'Cancha: Discover Florida soccer. Clubs, camps, coaches and places to play.', `
  <path d="M116 0v256M116 34h144v188H116m0-146h55v104h-55" fill="none" stroke="${colors.lime}" stroke-opacity=".25" stroke-width="3"/>
  <path d="M260 51a77 77 0 0 1 0 154" fill="none" stroke="${colors.lime}" stroke-opacity=".25" stroke-width="3"/>
  <path d="M1380 0v256" stroke="${colors.lime}" stroke-width="8"/>
  ${text(756, 128, 'Discover Florida soccer.', 92, { color: colors.cream, display: true, anchor: 'middle', max: 640 })}
  ${text(756, 180, 'Clubs, camps, coaches and places to play.', 38, { color: colors.lime, anchor: 'middle', max: 600 })}
`, colors.forest);
const squareLogo = svg(400, 400, 'The existing Cancha wordmark, unchanged, centered on cream.', wordmark(28, 155, 344));
const intro = svg(1200, 627, 'Cancha. Find soccer in Florida. Clubs, camps, coaches and places to play.', `
  ${wordmark(72, 58, 244)}
  <path d="M1110 0v627M1110 184h-90v259h90m0-186h-40v113h40" fill="none" stroke="${colors.forest}" stroke-opacity=".15" stroke-width="4"/>
  <rect x="72" y="175" width="12" height="270" fill="${colors.lime}"/>
  ${text(112, 293, 'Find soccer', 144, { display: true, max: 960 })}
  ${text(112, 426, 'in Florida.', 144, { display: true, max: 960 })}
  ${text(112, 521, 'Clubs, camps, coaches and places to play.', 45, { max: 970 })}
`);
const people = svg(1200, 627, 'Meet Your Local Club and Meet Your Local Coach: planned Cancha features about the people behind Florida soccer.', `
  ${wordmark(72, 58, 244)}
  <path d="M1090 145v370" stroke="${colors.lime}" stroke-width="12"/>
  ${text(72, 282, 'Meet your local club.', 113, { display: true, max: 1000 })}
  ${text(72, 396, 'Meet your local coach.', 113, { display: true, max: 1000 })}
  ${text(72, 518, 'The people behind Florida soccer.', 47, { max: 1000 })}
`);
const checked = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(data.asOf + 'T12:00:00Z'));
const comparison = svg(1200, 1500, 'Three December 2026 college ID camps: FKK girls in Orlando, USA League boys in Tampa, and UCF in Orlando. Prices and eligibility checked October 27, 2026.', `
  <rect x="72" y="40" width="270" height="89" rx="4" fill="${colors.cream}"/>
  ${wordmark(88, 53, 237)}
  ${text(72, 249, 'December', 132, { color: colors.cream, display: true })}
  ${text(72, 370, 'ID camps', 132, { color: colors.cream, display: true })}
  ${text(1128, 369, 'Florida · 2026', 39, { color: colors.lime, anchor: 'end' })}
  <rect x="72" y="430" width="1056" height="238" rx="6" fill="${colors.cream}"/>
  ${text(104, 484, 'December 12 · Orlando', 41)}
  ${text(104, 550, 'FKK girls’ college ID camp', 57, { max: 790 })}
  ${text(1092, 550, '$225', 70, { anchor: 'end' })}
  ${text(104, 615, 'Girls born 2007–2011 · Open to non-FKK players', 39, { max: 978 })}
  <rect x="72" y="697" width="1056" height="284" rx="6" fill="${colors.lime}"/>
  ${text(104, 751, 'December 13 · Tampa', 41)}
  ${text(104, 816, 'USA League boys’ ID camp', 57, { max: 978 })}
  ${text(104, 872, 'USA League players: $50 · Other players: $275', 42, { max: 978 })}
  ${text(104, 931, 'Age range not listed; confirm with organizer.', 39, { max: 978 })}
  <rect x="72" y="1010" width="1056" height="284" rx="6" fill="${colors.cream}"/>
  ${text(104, 1064, 'December 20 · Orlando', 41)}
  ${text(104, 1129, 'UCF winter ID camp', 57, { max: 790 })}
  ${text(1092, 1129, '$195', 70, { anchor: 'end' })}
  ${text(104, 1188, 'Grades 9–12, gap-year players and JUCO', 40, { max: 978 })}
  ${text(104, 1246, 'Lunch and housing not included', 40, { max: 978 })}
  ${text(72, 1371, 'Listed prices · checked ' + checked, 38, { color: colors.cream })}
  ${text(72, 1432, 'Organizer links in the post', 38, { color: colors.lime })}
`, colors.forest);

const assets = [
  { name: 'cancha-linkedin-logo-400', width: 400, height: 400, svg: squareLogo },
  { name: 'cancha-linkedin-cover-1512x256', width: 1512, height: 256, svg: cover },
  { name: 'post-01-introducing-cancha', width: 1200, height: 627, svg: intro },
  { name: 'post-02-local-soccer', width: 1200, height: 627, svg: people },
  { name: 'post-03-id-camp-comparison', width: 1200, height: 1500, svg: comparison },
];
const browser = await chromium.launch({ headless: true, ...(process.env.CANCHA_BROWSER_EXECUTABLE ? { executablePath: process.env.CANCHA_BROWSER_EXECUTABLE } : {}) });
const qa = { builtAt: new Date().toISOString(), contentCheckedOn: data.asOf, renderOnly: true, linkedinApplied: false, sourceLogoUnchanged: true, assets: [], textCounts: { tagline: [...data.company.tagline].length, about: [...data.company.about].length, founder: [...data.founder.description].length, posts: data.posts.map(p => ({ id: p.id, characters: [...p.copy].length })) } };
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const asset of assets) {
    const path = join(out, asset.name + '.svg');
    await writeFile(path, asset.svg);
    await page.setViewportSize({ width: asset.width, height: asset.height });
    // Render already-authorized source bytes in memory; no browser file access
    // or changes to managed browser policy are needed.
    await page.setContent('<!doctype html><html><body style="margin:0">' + asset.svg + '</body></html>');
    await page.evaluate(async () => {
      await Promise.all([document.fonts.load('italic 700 90px CanchaDisplay'), document.fonts.load('700 38px CanchaSupport')]);
      await document.fonts.ready;
    });
    const result = await page.evaluate(() => {
      for (const element of document.querySelectorAll('text[data-max-width]')) {
        const max = Number(element.getAttribute('data-max-width'));
        const width = element.getBBox().width;
        if (width > max) element.setAttribute('font-size', String(Math.floor(Number(element.getAttribute('font-size')) * max / width)));
      }
      const root = document.querySelector('svg');
      const bounds = root.viewBox.baseVal;
      const texts = [...document.querySelectorAll('text')].map(t => { const b = t.getBBox(); return { text: t.textContent, x: b.x, y: b.y, width: b.width, height: b.height, fontSize: Number(t.getAttribute('font-size')) }; });
      return { fontsLoaded: document.fonts.check('italic 700 90px CanchaDisplay') && document.fonts.check('700 38px CanchaSupport'), texts, overflows: texts.filter(b => b.x < 0 || b.y < 0 || b.x + b.width > bounds.width + 1 || b.y + b.height > bounds.height + 1), svg: new XMLSerializer().serializeToString(root) };
    });
    if (!result.fontsLoaded || result.overflows.length) throw Error('Font/bounds check failed for ' + asset.name);
    if (asset.name === 'cancha-linkedin-cover-1512x256') {
      qa.coverCenterCropChecks = [260, 320].map(width => {
        const height = 100, scale = Math.max(width / asset.width, height / asset.height);
        const left = (asset.width - width / scale) / 2, top = (asset.height - height / scale) / 2;
        const passed = result.texts.every(t => t.x >= left && t.x + t.width <= asset.width - left && t.y >= top && t.y + t.height <= asset.height - top);
        return { width, height, allEssentialTextVisible: passed, simulationOnly: true };
      });
      if (qa.coverCenterCropChecks.some(c => !c.allEssentialTextVisible)) throw Error('Essential cover text fails a simulated center crop');
    }
    // Preserve fitted text sizes in the editable source as well as the PNG.
    await writeFile(path, result.svg);
    const png = join(out, asset.name + '.png');
    await page.screenshot({ path: png });
    const bytes = await readFile(png);
    if ((await stat(png)).size >= 3_000_000) throw Error('LinkedIn image exceeds 3 MB');
    qa.assets.push({ file: 'exports/' + asset.name + '.png', width: asset.width, height: asset.height, bytes: bytes.length, sha256: hash(bytes), fontsLoaded: result.fontsLoaded, textBoundsPassed: true, textSizes: result.texts.map(t => t.fontSize) });
  }

  const company = data.company;
  const field = (label, value) => `<section class="field"><div class="field-name">${escape(label)}</div><div class="field-value">${escape(value)}</div><button class="copy" type="button" data-copy="${escape(value)}">Copy</button></section>`;
  const cardFields = [field('Page name', company.name), field('Public URL slug — proposed, not reserved', company.proposedSlug), field('Tagline · ' + qa.textCounts.tagline + ' characters', company.tagline), field('About · ' + qa.textCounts.about + ' characters', company.about), field('Website', company.website), field('Industry', company.industry), field('Organization size — confirm current selector', company.organizationSize), field('Organization type — confirm current selector', company.organizationType), field('Broad operating location — no street address', company.location), field('Specialties, if offered', company.specialties.join(', ')), field('Free CTA under More', company.cta)].join('');
  const mockup = `<div class="page-mock"><img class="page-cover" src="exports/cancha-linkedin-cover-1512x256.png" alt="Prepared Cancha Company Page cover"><div class="page-info"><img class="page-logo" src="exports/cancha-linkedin-logo-400.png" alt="Existing Cancha wordmark"><h2>Cancha</h2><p class="tagline">${escape(company.tagline)}</p><p class="meta">Internet Publishing · Florida</p><p class="site">${escape(company.website)}</p><span class="follow">Follow</span><span class="more">More</span></div><div class="about"><h3>About Cancha</h3><p>${escape(company.about)}</p></div></div>`;
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cancha · LinkedIn setup kit</title><style>
  :root{--forest:#103f32;--cream:#f5f3e9;--lime:#d7ef86}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:#17372c;font:16px/1.55 Arial,sans-serif}.wrap{max-width:1220px;margin:auto;padding:32px 28px 70px}.status{font-size:14px;font-weight:700;color:#6b5227;background:#fff7de;border:1px solid #e3d3a2;padding:12px 16px;border-radius:8px}h1{font-size:36px;letter-spacing:-1px;line-height:1.2;margin:26px 0 14px}h2{font-size:25px;line-height:1.25;letter-spacing:-.5px}h3{font-size:18px}p{max-width:780px}a{color:var(--forest);text-underline-offset:3px}.actions,nav{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}.action{background:var(--forest);color:white;padding:11px 16px;text-decoration:none;border-radius:7px;font-weight:700}.action.light{background:white;color:var(--forest);border:1px solid #cbd3c7}.grid{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:22px;align-items:start}.page-mock{background:white;border:1px solid #d9ddd6;border-radius:10px;overflow:hidden}.page-cover{display:block;width:100%;aspect-ratio:1512/256;object-fit:cover}.page-info{padding:0 26px 26px}.page-logo{display:block;width:104px;height:104px;border:5px solid white;margin-top:-30px;position:relative}.page-info h2{font-size:29px;margin:12px 0 8px}.tagline{font-size:17px;line-height:1.5;margin:0 0 10px}.meta,.site{font-size:14px;color:#5d6b62;margin:6px 0;overflow-wrap:anywhere}.follow,.more{display:inline-block;padding:7px 19px;border-radius:18px;font-weight:700;margin:16px 8px 0 0;border:1px solid #0a66c2;color:#0a66c2}.follow{background:#0a66c2;color:white}.about{border-top:1px solid #e7ebe4;padding:6px 26px 24px}.about p{white-space:pre-line;font-size:15px}.founder{padding:20px;border-radius:10px;background:white;border:1px solid #d9ddd6}.founder img{width:64px;height:64px}.founder h3{margin:14px 0 3px}.founder p{font-size:14px;white-space:pre-line}.founder .muted{color:#67756b}.section{margin-top:46px}.field{background:white;border:1px solid #d9ddd6;border-radius:8px;padding:17px 100px 17px 18px;margin:10px 0;position:relative}.field-name{font-size:13px;font-weight:700;color:#5c6a60;margin-bottom:7px}.field-value{white-space:pre-line;overflow-wrap:anywhere}.copy{position:absolute;right:14px;top:17px;border:1px solid #b8c9b8;background:#edf3e7;color:var(--forest);padding:8px 12px;border-radius:6px;cursor:pointer;font-weight:700}.small{font-size:14px;color:#5c6a60}.post{background:white;border:1px solid #d9ddd6;border-radius:10px;padding:22px;margin-top:18px}.post img{display:block;max-width:100%;max-height:450px;margin:20px auto;object-fit:contain}.post pre{font:inherit;white-space:pre-wrap}.post .field{padding-left:0;border:0}li{margin:10px 0}.assets{display:flex;gap:14px;flex-wrap:wrap}.asset{background:white;border:1px solid #d9ddd6;border-radius:8px;padding:16px}.asset img{display:block;max-width:100%;max-height:130px;margin-bottom:12px}button:focus-visible,a:focus-visible{outline:3px solid #b65d23;outline-offset:4px}.preview-only .setup-content,.preview-only .actions,.preview-only nav{display:none}.preview-only .wrap{max-width:1220px;padding-bottom:32px}.preview-only h1{font-size:29px}.preview-only .status{font-size:13px}.crop{background:white;border:1px solid #d9ddd6;border-radius:8px;margin:18px 0 0;padding:14px}.crop img{display:block;width:320px;height:100px;object-fit:cover;object-position:center;max-width:100%}
  @media(max-width:760px){.wrap{padding:18px 14px 46px}h1{font-size:28px}.grid{grid-template-columns:1fr}.page-info{padding:0 18px 22px}.page-logo{width:76px;height:76px;margin-top:-22px}.page-info h2{font-size:26px}.tagline{font-size:16px}.about{padding:4px 18px 18px}.field{padding-right:83px}.copy{right:10px;padding:8px}.founder{margin-top:0}.preview-only .wrap{padding:14px}.preview-only h1{font-size:25px}}
  </style><body><main class="wrap"><div class="status">Prepared preview. No LinkedIn Page created or profile changes applied.</div><h1>Cancha on LinkedIn</h1><p>A company page, the Founder entry and three unpublished drafts. Use the copy buttons and image files below in your own signed-in LinkedIn browser.</p><div class="actions"><a class="action" href="https://www.linkedin.com/company/setup/new/" target="_blank" rel="noopener noreferrer">Open LinkedIn Page setup</a><a class="action light" href="${escape(data.founder.profileUrl)}" target="_blank" rel="noopener noreferrer">Open Jose’s profile</a><a class="action light" href="SETUP.md">Full setup notes</a></div><nav><a href="#company">Company fields</a><a href="#founder">Founder entry</a><a href="#drafts">Draft posts</a><a href="#plan">First month</a></nav><div class="grid">${mockup}<aside><div class="founder"><img src="exports/cancha-linkedin-logo-400.png" alt="Cancha logo"><h3>Founder</h3><strong>Cancha</strong><p class="muted">Aug 2026 – Present<br>Gainesville, Florida</p><p>${escape(data.founder.description)}</p><p class="small">Prepared entry. Association with the actual Company Page is not yet applied.</p></div><div class="crop"><strong>Cover crop stress check</strong><p class="small">Simulated narrow crop, not a live LinkedIn screenshot.</p><img src="exports/cancha-linkedin-cover-1512x256.png" alt="Cover shown in a 320 by 100 center crop"></div></aside></div><div class="setup-content"><section class="section"><h2>Finish in LinkedIn</h2><ol><li>Confirm the signed-in profile is Jose Del Vecchio. Check managed Pages and existing Cancha Experience entries first; edit existing items rather than creating duplicates.</li><li>Create a free Company Page only if none exists. Paste the fields below, upload the 400 × 400 logo and 1512 × 256 cover, then add About and the optional specialties. Confirm the slug in the form; the proposed URL is not reserved.</li><li>Edit or add Founder, August 2026–Present. Choose the actual Cancha Page from the company selector. Keep Notify network and Update my headline off; preserve the previous primary position and other roles. Save, then click the company name/logo to verify the link.</li></ol><p class="small">No personal email, phone or street address is included. Free CTA visibility is under More; do not buy Premium. Industry is a taxonomy-backed recommendation; organization type/size labels require the actual selector. Field limits, existing drafts and account settings could not be inspected without authentication.</p></section><section class="section" id="company"><h2>Company Page fields</h2>${cardFields}<p class="small">${escape(company.locationNote)} Founded year 2026 is optional and based on the owner’s confirmed August 2026 start. ${escape(company.futureDomainStatus)}</p><div class="assets"><div class="asset"><img src="exports/cancha-linkedin-logo-400.png" alt="Square Company Page logo"><a href="exports/cancha-linkedin-logo-400.png" download>Download logo PNG</a></div><div class="asset"><img src="exports/cancha-linkedin-cover-1512x256.png" alt="Company Page cover"><a href="exports/cancha-linkedin-cover-1512x256.png" download>Download cover PNG</a></div></div><p><a href="exports/cancha-linkedin-logo-400.svg" download>Editable logo export</a> · <a href="exports/cancha-linkedin-cover-1512x256.svg" download>Editable cover SVG</a></p></section><section class="section" id="founder"><h2>Founder experience</h2>${field('Title', data.founder.title)}${field('Description', data.founder.description)}<p>Start: August 2026. Current position: Present. Leave optional employment type unset rather than guessing full-time, part-time or a legal status.</p><p>${escape(data.founder.linkingInstruction)}</p></section><section class="section" id="drafts"><h2>Three unpublished drafts</h2><p>These are not scheduled. Publishing needs a separate instruction. Recheck the December camp facts before eventual publication.</p>${data.posts.map((p, i) => `<article class="post"><h3>${i + 1}. ${escape(p.title)}</h3><p class="small">${escape(p.publisher)} · ${escape(p.audience)}</p><img src="${escape(p.visual)}" alt="Prepared visual for ${escape(p.title)}">${field('Post copy', p.copy)}<p class="small">${escape(p.status)}</p><a href="${escape(p.visual)}" download>Download draft visual</a></article>`).join('')}</section><section class="section" id="plan"><h2>A manageable first month</h2><p>${escape(data.monthPlanNote)}</p><ol>${data.firstMonth.map(w => `<li><strong>Week ${w.week} · ${escape(w.publisher)}</strong><br>${escape(w.content)}<br><span class="small">${escape(w.purpose)}</span></li>`).join('')}</ol><p class="small">${escape(data.optionalProfileSuggestions)}</p></section></div></main><script>document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const value=button.dataset.copy;let ok=false;try{await navigator.clipboard.writeText(value);ok=true}catch{const box=document.createElement('textarea');box.value=value;document.body.append(box);box.select();ok=document.execCommand('copy');box.remove()}button.textContent=ok?'Copied':'Select text';setTimeout(()=>button.textContent='Copy',1800)}));if(new URLSearchParams(location.search).has('preview'))document.body.classList.add('preview-only');</script></body></html>`;
  await writeFile(join(base, 'index.html'), html);
  for (const viewport of [{ width: 1280, height: 1120, name: 'desktop' }, { width: 390, height: 844, name: 'mobile' }]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    let inline = html;
    for (const asset of assets) {
      const name = 'exports/' + asset.name + '.png';
      inline = inline.replaceAll('src="' + name + '"', 'src="data:image/png;base64,' + (await readFile(join(base, name))).toString('base64') + '"');
    }
    await page.setContent(inline);
    await page.evaluate(async () => {
      document.body.classList.add('preview-only');
      await Promise.all([...document.images].map(img => img.decode()));
    });
    await page.screenshot({ path: join(out, 'page-preview-' + viewport.name + '.png'), fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw Error('Preview overflows on ' + viewport.name);
  }
  await writeFile(join(base, 'qa.json'), JSON.stringify(qa, null, 2) + '\n');
  console.log(JSON.stringify({ prepared: true, accountWrites: 0, images: qa.assets.length, taglineCharacters: qa.textCounts.tagline, aboutCharacters: qa.textCounts.about, output: out }));
} finally {
  await browser.close();
}
