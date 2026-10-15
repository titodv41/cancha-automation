export function expiredClubPlacement({sponsored,priority,until},today){
 if(!sponsored&&!(priority>0))return false;
 return !sponsored||!until||!Number.isFinite(Date.parse(until))||String(until).slice(0,10)<=today;
}
