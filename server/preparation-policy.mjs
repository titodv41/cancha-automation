// Successful completion is written only after the whole preparation child exits
// successfully. A partial run or a same-day growth target is not completion.
export function preparationNeeded({event,today,lastPreparation}) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(today))throw Error('Expected New York preparation date');
 return event!=='schedule'||lastPreparation?.completedOn!==today;
}
