// Browser-independent rendering smoke test. Interaction behavior is verified in the browser.
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const handlers={};
const nodes=Object.fromEntries(['#main-content','#site-header','#site-footer','#toast'].map(id=>[id,{innerHTML:'',focus(){},classList:{add(){},remove(){}}}]));
globalThis.document={querySelector:selector=>nodes[selector],addEventListener:(name,fn)=>handlers['document:'+name]=fn,title:''};
globalThis.location={hash:'#/'};
globalThis.window={localStorage:{getItem(){return null;},setItem(){throw new Error('Storage denied');}},addEventListener:(name,fn)=>handlers[name]=fn,scrollTo(){},confirm(){return true;}};
globalThis.fetch=async url=>({ok:true,json:async()=>{const data=JSON.parse(await readFile(url,'utf8'));if(url.pathname.endsWith('/assets/media.json'))data.attention={comic:'assets/panels/attention/01.webp',panels:Array.from({length:6},(_,i)=>`assets/panels/attention/${String(i+1).padStart(2,'0')}.webp`)};return data;}});
await import('../src/app.js');
const until=Date.now()+3000;while(!nodes['#main-content'].innerHTML&&Date.now()<until)await new Promise(r=>setTimeout(r,10));
assert.match(nodes['#main-content'].innerHTML,/画个明白/);
const lessons=JSON.parse(await readFile(new URL('../content/lessons.json',import.meta.url),'utf8'));
for(const route of ['#/explore','#/explore?q=绝对不匹配的字符串','#/map','#/discover','#/discover?view=scenes','#/discover?view=experiments','#/collection','#/library','#/about','#/unknown',...lessons.map(l=>'#/story/'+l.id)]){
 location.hash=route;handlers.hashchange();const html=nodes['#main-content'].innerHTML;assert.ok(html.length>100,route);assert.ok(!html.includes('undefined'),route+' undefined');assert.ok(!html.includes('[object Object]'),route+' object rendering');if(route.startsWith('#/story/')){assert.equal((html.match(/class="comic-panel"/g)||[]).length,lessons.find(l=>route.endsWith(l.id)).panels.length,route);assert.match(html,/id="sources"/);assert.ok(!html.includes('<video'),'video element is created only after explicit playback');}
}
location.hash='#/story/attention';handlers.hashchange();const independent=nodes['#main-content'].innerHTML;assert.ok(independent.includes('independent-panel-image'));assert.ok(independent.includes('comic-transcript'));assert.ok(!independent.includes('class="dialogue"'),'no repeated captions below picture');assert.ok(independent.includes('id="panel-dialog"'));assert.ok(independent.includes('data-enlarge="attention"'));
console.log(`Render smoke passed: ${lessons.length} lesson routes + 10 discovery/system routes.`);

// Regression: a failed write must not be overwritten by a success toast.
function clickAction(dataset){const button={dataset,classList:{add(){},remove(){},toggle(){}},setAttribute(){},hasAttribute(name){return Object.hasOwn(dataset,name.replace('data-',''));},closest(selector){return selector==='button'?this:null;}};handlers['document:click']({target:button});}
clickAction({save:'attention'});assert.match(nodes['#toast'].textContent,/未能保存.*刷新后可能丢失/);
location.hash='#/collection';handlers.hashchange();assert.match(nodes['#main-content'].innerHTML,/story\/attention/,'failed storage preserves in-memory bookmark');
clickAction({read:'attention'});assert.match(nodes['#toast'].textContent,/未能保存.*刷新后可能丢失/);
clickAction({clear:''});assert.match(nodes['#toast'].textContent,/刷新后旧记录可能恢复/);assert.ok(!nodes['#main-content'].innerHTML.includes('story/attention'));
window.localStorage.setItem=()=>{};
clickAction({save:'attention'});assert.equal(nodes['#toast'].textContent,'已收进书架，只保存在当前浏览器。');
clickAction({read:'attention'});assert.equal(nodes['#toast'].textContent,'已记录这段漫游。');
clickAction({clear:''});assert.equal(nodes['#toast'].textContent,'本地记录已清除。');
console.log('Storage-denied and durable-success UI regression passed for bookmark, read, and clear.');
