import {withProject} from './project-session.mjs';import {mkdir,writeFile} from 'node:fs/promises';
await withProject(async f=>{
 const from=new Date(Date.now()-14*86400000).toISOString(),to=new Date().toISOString();
 const [pages,campaigns]=await Promise.all([
  f.agent.queryAnalytics({query:"SELECT pathname, countIf(eventType='pageview') AS pageviews, countIf(eventType='click') AS clicks, countIf(eventType='form_submit') AS submissions FROM events_v2 GROUP BY pathname ORDER BY pageviews DESC LIMIT 30",from,to}),
  f.agent.queryAnalytics({query:"SELECT utmSource,utmMedium,utmCampaign,utmContent,countIf(eventType='pageview') AS pageviews,countIf(eventType='click') AS recordedClicks,countIf(eventType='form_submit') AS submissions,uniqIf(dailyVisitorIdHash,eventType='pageview') AS dailyUniqueVisitorInstances FROM events_v2 WHERE utmCampaign != '' GROUP BY utmSource,utmMedium,utmCampaign,utmContent ORDER BY pageviews DESC LIMIT 30",from,to})
 ]);
 // Schema probe for outbound-click tracking (Nov 2): which fields a click event carries. Only column names and,
 // if a link-target column exists, aggregate counts per destination host are logged. No visitor-level data.
 let clickFields=[],outbound=[];
 try{const one=await f.agent.queryAnalytics({query:"SELECT * FROM events_v2 WHERE eventType='click' LIMIT 1",from,to});const row=(Array.isArray(one)?one:(one?.rows||one?.data||[]))[0]||{};
  clickFields=Object.keys(row);const target=clickFields.find(k=>/href|target|url|link|destination/i.test(k)&&!/referr|page|utm/i.test(k));
  if(target)outbound=await f.agent.queryAnalytics({query:`SELECT domain(${target}) AS host, count() AS clicks FROM events_v2 WHERE eventType='click' AND ${target} != '' GROUP BY host ORDER BY clicks DESC LIMIT 40`,from,to});
 }catch(e){clickFields=['probe failed: '+String(e.message).slice(0,120)];}
 // Referrals we send organizations (priority 1, Nov 2): outbound clicks per listing page and destination, classified as
 // registration, contact or website from the link itself. Private artifact only; the public log prints row counts.
 const kind="multiIf(startsWith(href,'mailto:') OR startsWith(href,'tel:') OR match(href,'(?i)wa\\.me|whatsapp|/contact'),'contact',match(href,'(?i)regist|signup|sign-up|tryout|enroll|checkout|form|camp|book'),'registration','website')";
 let referrals=[];try{referrals=await f.agent.queryAnalytics({query:`SELECT pathname, if(startsWith(href,'http'),domain(href),'') AS destination, ${kind} AS kind, count() AS clicks, uniq(dailyVisitorIdHash) AS visitorDays FROM events_v2 WHERE eventType='click' AND href != '' AND (startsWith(href,'mailto:') OR startsWith(href,'tel:') OR (startsWith(href,'http') AND NOT endsWith(domain(href),'framer.app') AND NOT endsWith(domain(href),'framer.website') AND domain(href) != hostname)) GROUP BY pathname, destination, kind ORDER BY clicks DESC LIMIT 300`,from,to});}catch(e){referrals=[{error:String(e.message).slice(0,160)}];}
 console.log(JSON.stringify({clickFields:clickFields.length,outboundHostRows:Array.isArray(outbound)?outbound.length:0,referralRows:Array.isArray(referrals)?referrals.length:0}));
 const report={from,to,timezone:'America/New_York',pages,campaigns,clickFields,outbound,referrals,limitations:['Referrals are outbound clicks on Cancha pages (registration, contact or website by link pattern); a click is not a confirmed registration.','UTM-tagged visits are attributable links, not proof a registration or sale occurred. Recorded clicks include internal navigation unless separately classified.','Counts can include owner and QA traffic; they are not ad conversion or Instagram engagement metrics.','Daily visitor hashes are aggregated only, never exported.','No Meta Pixel or new third-party tracking was installed.']};await mkdir('private-data',{recursive:true,mode:0o700});await writeFile('private-data/site-analytics.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify({webAnalyticsAvailable:true,pageRows:pages.length,campaignRows:campaigns.length}));
});
