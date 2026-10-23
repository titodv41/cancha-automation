import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
import{narrativeSocialFields}from'../server/narrative-social.mjs';import{localStoryDescriptor}from'../server/local-story-source.mjs';
const social=JSON.parse(await readFile(new URL('../content/instagram/narrative-social.json',import.meta.url))),recipe={id:social.id,sourceId:social.editorialSourceId},source=localStoryDescriptor(recipe.sourceId);
test('story-specific captions and publisher identity are data, with no silent fallback to another club',()=>{
 assert.equal(narrativeSocialFields(recipe,social,source).editorialOrganization,'Fort Lauderdale United');
 for(const bad of[{...social,id:'another-story'},{...social,editorialSourceId:'another-source'},{...social,caption:'Missing the primary source'},{...social,footagePublisher:''},{...social,caption:'x'.repeat(2201)}])assert.throws(()=>narrativeSocialFields(recipe,bad,source));
});
