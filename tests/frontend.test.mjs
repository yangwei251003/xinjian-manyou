import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONES,escapeHTML,safeURL,parseRoute,exploreURL,filterLessons,normalizeLessons,readCollection,toggleValue,resolveMedia,panelGeometry} from '../src/core.js';
import {interactionFor} from '../src/interactions.js';
const sample={id:'attention',zone:'perception',title:'看见与注意',question:'注意什么？',summary:'注意取决于目标',tags:['注意'],panels:[{},{},{},{}]};
test('eight unique zones',()=>assert.equal(new Set(ZONES.map(z=>z.id)).size,8));
test('HTML escaping and URL protocol allowlist',()=>{assert.equal(escapeHTML('<a "x">&'),'&lt;a &quot;x&quot;&gt;&amp;');assert.equal(safeURL('javascript:alert(1)'),'#');assert.equal(safeURL('https://example.org'),'https://example.org/');});
test('hash route preserves encoded queries and handles invalid encoding',()=>{const r=parseRoute('#/story/attention?from=map');assert.equal(r.id,'attention');assert.equal(r.params.get('from'),'map');assert.equal(parseRoute('').name,'home');assert.equal(parseRoute('#/story/%XX').id,'%XX');});
test('explore search and filtering intersect',()=>{assert.match(exploreURL({zone:'perception',q:'注意'}),/^#\/explore\?zone=perception&q=/);assert.equal(filterLessons([sample],{q:'注意 目标'}).length,1);assert.equal(filterLessons([sample],{zone:'self'}).length,0);assert.equal(filterLessons([sample],{saved:[]}).length,0);});
test('data normalization fails on duplicates and incomplete panels',()=>{assert.equal(normalizeLessons([sample])[0].duration,6);assert.throws(()=>normalizeLessons([sample,sample]));assert.throws(()=>normalizeLessons([{...sample,panels:[]}]));});
test('storage is optional and malformed content cannot break reading',()=>{assert.deepEqual(readCollection(undefined),{saved:[],read:[]});assert.deepEqual(readCollection({getItem:()=>'{invalid'}),{saved:[],read:[]});assert.deepEqual(readCollection({getItem:()=>'{"saved":[4,"attention"]}'}).saved,['attention']);});
test('bookmark toggle is immutable and media schema supports optional videos',()=>{let a=['attention'];assert.deepEqual(toggleValue(a,'attention'),[]);assert.deepEqual(a,['attention']);assert.deepEqual(resolveMedia({},'attention'),{});assert.equal(resolveMedia({a:{comic:'a.webp'}},'a').comic,'a.webp');});
test('thirteen meaningful mechanisms render with explicit teaching boundary',()=>{for(const id of ['attention','attribution','framing','personality','sampling','correlation','retrieval','reappraisal','listening','sunk-cost','habits','memory','metacognition']){const html=interactionFor(id);assert.match(html,/教学演示/);assert.match(html,/不计能力分数/);}assert.equal(interactionFor('unknown'),'');});

test('local server serves correct MIME, byte ranges, errors, and portable root',async t=>{
 const {spawn}=await import('node:child_process');
 const child=spawn(process.execPath,['scripts/serve.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'14173'},stdio:['ignore','pipe','pipe']});
 t.after(()=>child.kill());
 await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',code=>reject(new Error('server exit '+code)));});
 const base='http://127.0.0.1:14173';
 const home=await fetch(base);assert.equal(home.status,200);assert.match(home.headers.get('content-type'),/text\/html/);assert.match(await home.text(),/心间漫游/);
 const script=await fetch(base+'/src/app.js');assert.match(script.headers.get('content-type'),/javascript/);
 const data=await fetch(base+'/content/lessons.json');assert.match(data.headers.get('content-type'),/application\/json/);
 const art=await fetch(base+'/assets/hero-v2.webp',{headers:{Range:'bytes=0-99'}});assert.equal(art.status,206);assert.equal(art.headers.get('content-type'),'image/webp');assert.equal((await art.arrayBuffer()).byteLength,100);
 assert.equal((await fetch(base+'/assets/hero-v2.webp',{headers:{Range:'bytes=999999999-'}})).status,416);
 assert.equal((await fetch(base+'/missing-file.json')).status,404);
});

test('abandoned media response releases the file for replacement',async t=>{
  const {spawn}=await import('node:child_process');
  const fs=await import('node:fs/promises');
  const path=await import('node:path');
  const os=await import('node:os');
  const http=await import('node:http');
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'xinjian-stream-'));
  const original=path.join(temp,'large.mp4');
  const moved=path.join(temp,'replacement.mp4');
  const file=await fs.open(original,'w');await file.truncate(64*1024*1024);await file.close();
  const child=spawn(process.execPath,['scripts/serve.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'14174',SERVE_DIR:temp},stdio:['ignore','pipe','pipe']});
  t.after(async()=>{
    child.kill();
    const resolved=path.resolve(temp);
    assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('xinjian-stream-'));
    await fs.rm(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:100});
  });
  await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',code=>reject(new Error('server exit '+code)));});
  await new Promise((resolve,reject)=>{
    const request=http.get('http://127.0.0.1:14174/large.mp4',response=>{
      response.once('data',()=>{response.destroy();request.destroy();resolve();});
    });
    request.once('error',error=>{if(error.code!=='ECONNRESET')reject(error);});
  });
  await new Promise(resolve=>setTimeout(resolve,200));
  await fs.rename(original,moved);
  assert.equal((await fs.stat(moved)).size,64*1024*1024);
});

test('comic geometry crops exact asymmetric gutters and safely falls back',()=>{
 const fallback=panelGeometry(undefined,3);assert.deepEqual(fallback,{aspectRatio:1,sizeX:200,sizeY:200,positionX:100,positionY:100});
 const g=panelGeometry({size:[1000,1000],normalized:[[0.01,0.02,0.49,0.48]]},0);assert.ok(Math.abs(g.aspectRatio-0.48/0.46)<1e-9);assert.ok(Math.abs(g.sizeY-100/0.46)<1e-9);assert.ok(Math.abs(g.positionX-100*0.01/0.52)<1e-9);
 assert.deepEqual(panelGeometry({normalized:[[0,0,-1,0]]},0),panelGeometry(undefined,0));
});

// Six-panel layouts must not accidentally reuse the old four-panel crop.
test('six-panel fallback uses three ordered rows',()=>{const last=panelGeometry(undefined,5,6);assert.equal(last.sizeX,200);assert.ok(Math.abs(last.sizeY-300)<1e-9);assert.equal(last.positionX,100);assert.ok(Math.abs(last.positionY-100)<1e-9);const six={...sample,panels:Array.from({length:6},()=>({}))};assert.equal(normalizeLessons([six])[0].panels.length,6);});
test('branch and scene filters intersect without losing query',()=>{const data=[{...sample,branches:['cognitive'],scenes:['school']}];assert.equal(filterLessons(data,{branch:'cognitive',scene:'school'}).length,1);assert.equal(filterLessons(data,{branch:'social'}).length,0);assert.match(exploreURL({branch:'cognitive',scene:'school'}),/branch=cognitive&scene=school/);});

test('portrait 1024×1536 six-panel sheet preserves actual geometry',async()=>{const {readFile}=await import('node:fs/promises');const {webpDimensions}=await import('../scripts/media-info.mjs');const pixels=Buffer.alloc(30);pixels.write('RIFF',0);pixels.writeUInt32LE(22,4);pixels.write('WEBP',8);pixels.write('VP8X',12);pixels.writeUInt32LE(10,16);pixels.writeUIntLE(1023,24,3);pixels.writeUIntLE(1535,27,3);assert.deepEqual(webpDimensions(pixels),[1024,1536]);const metadata={size:[1024,1536],normalized:[[10/1024,7/1536,504/1024,503/1536]]};const g=panelGeometry(metadata,0,6);assert.ok(Math.abs(g.aspectRatio-494/496)<1e-12);assert.ok(Math.abs(g.sizeX-1024/494*100)<1e-9);assert.ok(Math.abs(g.sizeY-1536/496*100)<1e-9);assert.ok(g.aspectRatio<1.01&&g.aspectRatio>0.99,'portrait source produces nearly square panel, not 1.5× stretched');assert.throws(()=>webpDimensions(Buffer.from('bad image')));});
