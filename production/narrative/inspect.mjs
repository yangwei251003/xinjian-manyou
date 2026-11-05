import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=import.meta.dirname;
const {chromium}=await import(pathToFileURL('C:/Users/yangwei/.agents/skills/personal-homepage-skill/node_modules/playwright/index.mjs').href);
const films=JSON.parse(await fs.readFile(path.join(root,'episodes.json'),'utf8'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];await fs.mkdir(path.join(root,'review/frames'),{recursive:true});
try{
 for(const film of films){
  const page=await browser.newPage({viewport:{width:1920,height:1080}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:43185/?capture=1&id='+film.id);await page.evaluate(()=>window.ready);
  const report=await page.evaluate(()=>{
   const rows=[];const small=document.createElement('canvas');small.width=480;small.height=270;const c=small.getContext('2d');
   for(const cue of window.episode.cues){
    window.render((cue.start+cue.end)/2);c.drawImage(document.querySelector('#film'),0,0,480,270);
    rows.push({index:cue.index,scene:cue.scene,start:cue.start,end:cue.end,image:small.toDataURL('image/jpeg',.78)});
    for(const t of [cue.start+.02,cue.end-.02])window.render(t);
   }
   return rows;
  });
  for(const row of report){await fs.writeFile(path.join(root,'review/frames',film.id+'-'+String(row.index).padStart(2,'0')+'.jpg'),Buffer.from(row.image.split(',')[1],'base64'));delete row.image;}
  const same=await page.evaluate(()=>{window.render(37.23);let a=document.querySelector('#film').toDataURL();window.render(7);window.render(37.23);return a===document.querySelector('#film').toDataURL();});
  results.push({id:film.id,cues:report.length,errors,deterministic:same});console.log(film.id,report.length,'cues',same?'deterministic':'NONDETERMINISTIC');
  await page.close();
 }
}finally{await browser.close();}
await fs.writeFile(path.join(root,'review/graphics-check.json'),JSON.stringify(results,null,2));
if(results.some(r=>r.errors.length||!r.deterministic))process.exitCode=1;
