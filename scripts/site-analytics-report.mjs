import {withProject} from './project-session.mjs';import {mkdir,writeFile} from 'node:fs/promises';
await withProject(async f=>{
 const from=new Date(Date.now()-7*86400000).toISOString(),to=new Date().toISOString();
 const [pages,campaigns]=await Promise.all([
  f.agent.queryAnalytics({query:"SELECT pathname, countIf(eventType='pageview') AS pageviews, countIf(eventType='click') AS clicks, countIf(eventType='form_submit') AS submissions FROM events_v2 GROUP BY pathname ORDER BY pageviews DESC LIMIT 30",from,to}),
  f.agent.queryAnalytics({query:"SELECT utmSource,utmMedium,utmCampaign,utmContent,countIf(eventType='pageview') AS pageviews,uniqIf(dailyVisitorIdHash,eventType='pageview') AS dailyUniqueVisitorInstances FROM events_v2 WHERE utmCampaign != '' GROUP BY utmSource,utmMedium,utmCampaign,utmContent ORDER BY pageviews DESC LIMIT 30",from,to})
 ]);
 const report={from,to,timezone:'America/New_York',pages,campaigns,limitations:['Counts can include owner and QA traffic; they are not ad conversion or Instagram engagement metrics.','Daily visitor hashes are aggregated only, never exported.','No Meta Pixel or new third-party tracking was installed.']};await mkdir('private-data',{recursive:true,mode:0o700});await writeFile('private-data/site-analytics.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify({webAnalyticsAvailable:true,pageRows:pages.length,campaignRows:campaigns.length}));
});
