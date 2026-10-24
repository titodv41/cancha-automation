const esc=s=>String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

// Layout regions participate in normal flow. Copy cannot sit behind the photo.
export function photoCardHtml({brand,post,slide,index,asset,display,ui,uiBold,logo}) {
 if(!['program','field-notes','club-card'].includes(slide.layout))throw Error('Unknown card layout');
 const facts=slide.facts||[];
 if(facts.length>3||facts.some(f=>!f.label||!f.value||f.label.length>35||f.value.length>65))throw Error('Keep card facts concise');
 const theme=slide.layout==='field-notes'?'cream':slide.layout==='program'?'forest':'lime';
 const background=theme==='cream'?brand.cream:theme==='lime'?brand.accent:brand.forest,ink=theme==='forest'?brand.cream:brand.forest;
 const words=[slide.eyebrow,slide.title,slide.body,slide.label,...facts.flatMap(f=>[f.label,f.value])].filter(Boolean).join(' ').trim().split(/\s+/);
 if(words.length>47)throw Error('Card needs a shorter idea: '+post.id+'/'+index);
 return `<!doctype html><html><head><style>
 @font-face{font-family:Display;src:url('${display}');font-weight:700;font-style:italic}@font-face{font-family:UI;src:url('${ui}');font-weight:700}
 *{box-sizing:border-box}html,body{width:1080px;height:1350px;margin:0}body{background:${background};color:${ink};font:700 40px/1.15 UI,sans-serif;letter-spacing:-.4px;-webkit-font-smoothing:antialiased}
 main{width:1080px;height:1350px;overflow:hidden;padding:44px 60px 36px;display:grid;grid-template-rows:62px auto minmax(300px,1fr) ${facts.length?'auto ':''}42px;gap:25px}
 header{display:flex;justify-content:space-between;align-items:center;min-width:0}.logo{width:191px;height:62px;overflow:hidden}.logo img{width:100%;height:100%;object-fit:cover;${theme==='forest'?'filter:brightness(0) invert(1)':''}}.page-number{font-size:36px;font-weight:700;font-variant-numeric:tabular-nums}
 .copy{min-width:0}.eyebrow{font-size:38px;margin-bottom:15px}h1{margin:0;font:italic 700 ${Math.min(slide.titleSize||120,120)}px/.94 Display,sans-serif;letter-spacing:-.8px;white-space:pre-line}.body{margin:17px 0 0;white-space:pre-line;font-size:42px;line-height:1.16}.label{display:inline-block;margin-top:15px;padding:10px 17px;background:${brand.orange};color:#062219;border-radius:10px;font-size:36px;line-height:1.1}
 .photo{position:relative;min-height:300px;min-width:0;overflow:hidden;border-radius:${slide.layout==='field-notes'?10:24}px;background:#234e3f}.photo img{display:block;width:100%;height:100%;object-fit:cover;object-position:${esc(slide.position||'50% 40%')}}
 .facts{display:grid;grid-template-columns:repeat(${facts.length||1},minmax(0,1fr));gap:16px}.fact{background:${theme==='forest'?'#244f40':theme==='lime'?brand.cream:brand.accent};color:${theme==='forest'?brand.cream:brand.forest};border-radius:16px;padding:20px 24px;min-height:160px}.fact span{font-size:36px;line-height:1.15;display:block;margin-bottom:12px}.fact b{font-size:44px;line-height:1.08;display:block;overflow-wrap:break-word}
 footer{display:flex;gap:28px;justify-content:space-between;align-items:center;font-size:36px;line-height:1.1}.arrow,.handle{white-space:nowrap}
 </style></head><body><main class="${esc(slide.layout)}"><header><div class="logo"><img src="${logo}" alt="Cancha"></div><span class="page-number">${index+1} / ${post.slides.length}</span></header><div class="copy"><div class="eyebrow">${esc(slide.eyebrow)}</div><h1>${esc(slide.title)}</h1>${slide.body?`<p class="body">${esc(slide.body)}</p>`:''}${slide.label?`<div class="label">${esc(slide.label)}</div>`:''}</div><div class="photo"><img src="${asset.data}" alt="${esc(slide.altText)}"></div>${facts.length?`<div class="facts">${facts.map(f=>`<div class="fact"><span>${esc(f.label)}</span><b>${esc(f.value)}</b></div>`).join('')}</div>`:''}<footer><span class="handle">${esc(brand.handle)}</span><span class="arrow">${esc(slide.footer||'Florida soccer')}</span></footer></main></body></html>`;
}
