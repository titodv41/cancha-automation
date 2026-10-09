export function growthProgress(items,plan,date){
 const counts={};for(const row of items)counts[row.status||'Unknown']=(counts[row.status||'Unknown']||0)+1;
 const start=date<plan.startDate?plan.startDate:date,days=Math.max(0,Math.floor((Date.parse(plan.deadline+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000)+1),active=counts.Active||0,gap=Math.max(0,plan.targetCurrentOpportunities-active);
 return {date,deadline:plan.deadline,totalRecords:items.length,currentActive:active,pendingReview:counts['Pending review']||0,closedOrArchived:(counts.Expired||0)+(counts.Archived||0),targetCurrentOpportunities:plan.targetCurrentOpportunities,gap,remainingDays:days,neededPerDay:days?Math.ceil(gap/days):gap?null:0,configuredDailyTarget:plan.dailyQualityTarget,guaranteed:false,note:'Target only. Pending, expired and archived records do not count as current; source quality and actual availability determine additions.'};
}
