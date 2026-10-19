const metrics=['reach','saved','shares','likes','comments','total_interactions'];
export function instagramLearning(reports){
 const first=new Map();for(const r of [...reports].sort((a,b)=>Date.parse(a.collectedAt)-Date.parse(b.collectedAt)))for(const p of r.posts||[]){const age=(Date.parse(r.collectedAt)-Date.parse(p.publishedAt))/3600000;if(age<48||age>=192||!Number.isFinite(age)||!(p.metrics.reach>=20)||!Number.isFinite(p.metrics.saved)||!Number.isFinite(p.metrics.shares))continue;const cohort=Math.floor(age/48),key=p.id+':'+cohort;if(!first.has(key))first.set(key,{...p,cohort});}
 const candidates=[];for(const cohort of[1,2,3]){const topics={};for(const p of first.values())if(p.cohort===cohort)(topics[p.topic]||=[]).push((p.metrics.saved+p.metrics.shares)/p.metrics.reach*100);const comparison=Object.entries(topics).filter(([,v])=>v.length>=5).map(([topic,v])=>({topic,posts:v.length,savesAndSharesPer100Reached:v.reduce((a,b)=>a+b,0)/v.length})).sort((a,b)=>b.savesAndSharesPer100Reached-a.savesAndSharesPer100Reached);if(comparison.length>=2)candidates.push({ageCohortHours:[cohort*48,(cohort+1)*48],topicComparison:comparison});}
 return candidates.sort((a,b)=>b.topicComparison.reduce((n,t)=>n+t.posts,0)-a.topicComparison.reduce((n,t)=>n+t.posts,0))[0]||{ageCohortHours:null,topicComparison:[],note:'Insufficient comparable samples: need five posts per topic in two topics, captured in the same 48-hour age cohort between 2 and 8 days after publishing.'};
}
export async function collectInstagramInsights(connection,published,{fetchImpl=fetch,now=new Date()}={}){
 const result={collectedAt:now.toISOString(),readOnly:true,status:'available',posts:[],unavailableMetrics:[],recommendations:[],requiredPermission:null};
 const version=/^v\d+\.\d+$/.test(connection.version||'')?connection.version:'v26.0';
 for(const row of published.slice(-30)){
  if(!/^\d+$/.test(row.published_id||''))continue;let content;try{content=JSON.parse(row.content)}catch{continue}
  const post={id:row.id,mediaId:row.published_id,publishedAt:row.published_at||row.scheduled_at,topic:content.topic||content.sourceType,format:content.format,metrics:{}};
  for(const metric of metrics){
   const url=new URL(`https://graph.facebook.com/${version}/${row.published_id}/insights`);url.searchParams.set('metric',metric);
   let response,data;try{response=await fetchImpl(url,{headers:{Authorization:'Bearer '+connection.pageToken},redirect:'error',signal:AbortSignal.timeout(20000)});data=await response.json()}catch{result.unavailableMetrics.push({post:row.id,metric,reason:'Network or invalid response'});continue}
   if(!response.ok||data.error){const code=data.error?.code;if([10,200].includes(code)){result.status='permission_required';result.requiredPermission='instagram_manage_insights';result.posts.push(post);result.recommendations.push('Enable Instagram read-only insights access in the Meta app and reconnect securely. Publishing access does not imply insights access.');return result}if(code===190){result.status='connection_needs_attention';result.recommendations.push('The Meta connection needs a secure renewal. No publishing was attempted.');return result}result.unavailableMetrics.push({post:row.id,metric,reason:'Metric unavailable',code:code||response.status});continue}
   const point=data.data?.find(x=>x.name===metric),value=point?.total_value?.value??point?.values?.at(-1)?.value;if(typeof value==='number'&&Number.isFinite(value))post.metrics[metric]=value;else result.unavailableMetrics.push({post:row.id,metric,reason:'No metric value'});
  }
  result.posts.push(post);
 }
 result.recommendations.push('A single collection is not enough evidence to select a winning topic. Compare accumulated snapshots at similar post ages before changing the mix.');
 if(!result.posts.length)result.status='no_published_posts';else if(result.posts.every(p=>!Object.keys(p.metrics).length))result.status='metrics_unavailable';return result;
}
