import {confirmOpportunitySource} from './opportunity-recheck.mjs';
import {confirmNewsSource} from './soccer-news.mjs';
import {confirmLocalStorySource} from './local-story-source.mjs';
export const requiresSource=row=>!!row.editorialSourceId||['opportunity','news'].includes(row.sourceType);
export async function confirmPostSource(row,options={}){if(row.editorialSourceId)return confirmLocalStorySource(row,options);if(row.sourceType==='opportunity')return confirmOpportunitySource(row,options);if(row.sourceType==='news')return confirmNewsSource(row,options);return row.sourceType==='brand';}
