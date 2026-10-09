import {confirmOpportunitySource} from './opportunity-recheck.mjs';
import {confirmNewsSource} from './soccer-news.mjs';
export const requiresSource=row=>['opportunity','news'].includes(row.sourceType);
export async function confirmPostSource(row,options={}){if(row.sourceType==='opportunity')return confirmOpportunitySource(row,options);if(row.sourceType==='news')return confirmNewsSource(row,options);return row.sourceType==='brand';}
