import {parseHTML} from 'linkedom';
function publicEditorialUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.hostname.includes('.')&&!/^(?:\d+\.){3}\d+$/.test(u.hostname)&&!u.hostname.includes(':')&&!/(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(u.hostname)?u:null}catch{return null}}
export function officialHeaderLogo(html,website){
 const {document}=parseHTML(html),home=new URL(website),candidates=[];
 for(const i of document.querySelectorAll('img[src],img[data-src]')){
  const src=i.getAttribute('data-src')||i.getAttribute('src');let path='';try{path=new URL(src,website).pathname}catch{}const label=[i.id,i.className,i.getAttribute('alt'),path].join(' ');
  if(!src||!/logo|crest|badge/i.test(label)||/sponsor|partner|margaritaville|campground|casino|sportsconnect|sportsengine|demosphere|bluesombrero|gotsoccer|adidas|nike|capelli|wordpress|facebook|instagram|google/i.test(label))continue;
  let link;try{link=new URL(i.closest('a')?.getAttribute('href')||'__missing__',home)}catch{continue}
  if(link.hostname.replace(/^www\./,'')!==home.hostname.replace(/^www\./,'')||!['/','/default.aspx','/home'].includes(link.pathname.toLowerCase()))continue;
  const header=!!i.closest('header,nav,[role="banner"],#header,.header,.site-header,.navbar'),identity=/dnn.*logo|custom-logo|site-logo|header-logo|navbar-brand/i.test(label+' '+i.parentElement?.className);
  if(!header&&!identity&&i!==document.querySelector('img'))continue;
  let image;try{image=new URL(src,home).href}catch{continue}if(!publicEditorialUrl(image))continue;
  candidates.push({url:image,score:(header?4:0)+(identity?3:0)+(i===document.querySelector('img')?1:0)});
 }
 return candidates.sort((a,b)=>b.score-a.score)[0]?.url||null;
}
