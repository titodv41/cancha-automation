import {confirmAutomatedNewsVideo} from './automated-news-video.mjs';
import {confirmDirectorySource} from './directory-editorial.mjs';
import {confirmProductSource} from './product-editorial.mjs';
import {confirmOpportunitySource} from './opportunity-recheck.mjs';
import {confirmNewsSource} from './soccer-news.mjs';
import {confirmLocalStorySource} from './local-story-source.mjs';
import {confirmComparisonSources} from './comparison-carousels.mjs';
export const requiresSource=row=>['directory-guide','product-demo','news-film','comparison-carousel','comparison-reel'].includes(row.visualEvidence?.kind)||!!row.editorialSourceId||['opportunity','news'].includes(row.sourceType);
export async function confirmPostSource(row,options={}){if(['comparison-carousel','comparison-reel'].includes(row.visualEvidence?.kind))return confirmComparisonSources(row,options);if(row.visualEvidence?.kind==='news-film')return confirmAutomatedNewsVideo(row,options);if(row.visualEvidence?.kind==='directory-guide')return confirmDirectorySource(row,options);if(row.visualEvidence?.kind==='product-demo')return confirmProductSource(row,options);if(row.editorialSourceId)return confirmLocalStorySource(row,options);if(row.sourceType==='opportunity')return confirmOpportunitySource(row,options);if(row.sourceType==='news')return confirmNewsSource(row,options);return row.sourceType==='brand';}
