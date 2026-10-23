export function narrativeSocialFields(recipe,social,source){
 if(social?.id!==recipe.id||social.editorialSourceId!==recipe.sourceId||source.id!==recipe.sourceId)throw Error('Narrative social brief does not match its story and source');
 for(const[key,max]of[['headline',140],['organization',100],['caption',2200],['altText',1000],['footagePublisher',100],['footageSubject',300]])if(typeof social[key]!=='string'||!social[key].trim()||social[key].length>max)throw Error('Narrative social brief needs concise '+key);
 if(!social.caption.includes(source.documents[0].url))throw Error('Narrative caption must retain its official source link');
 return{headline:social.headline,caption:social.caption,altText:social.altText,editorialOrganization:social.organization};
}
