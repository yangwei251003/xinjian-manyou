import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL('C:/Users/yangwei/.agents/skills/personal-homepage-skill/node_modules/playwright/index.mjs').href);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const args=process.argv.slice(2),base=args.includes('--site')?'http://127.0.0.1:43184':'http://127.0.0.1:43182/watch.html';
const all=JSON.parse(await fs.readFile(path.join(import.meta.dirname,'lessons.json'),'utf8'));
const selected=args.includes('--all')?all:all.filter(e=>['attention','knowledge-curse','attribution','retrieval'].includes(e.id));
const report=[];
try{
 for(const width of [1366,390]){
  for(const episode of selected){
   const page=await browser.newPage({viewport:{width,height:900}});let mediaRequests=0;const ranges=[],errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('request',request=>{if(request.url().includes('.mp4')){mediaRequests++;ranges.push(request.headers().range||null);}});
   const isSite=args.includes('--site');
   await page.goto(isSite?`${base}/#/story/${episode.id}`:`${base}?id=${episode.id}`);
   await page.locator(isSite?'[data-film-start]':'#start').waitFor();
   if(mediaRequests)throw new Error('Film requested before explicit click');
   await page.evaluate(()=>{if(document.querySelector('video'))document.querySelector('video').muted=true;});
   await page.locator(isSite?'[data-film-start]':'#start').click();
   await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2,{timeout:20000});
   await page.evaluate(()=>{const v=document.querySelector('video');v.muted=true;v.pause();v.currentTime=65;});
   await page.waitForFunction(()=>Math.abs(document.querySelector('video').currentTime-65)<.1&&!document.querySelector('video').seeking,{timeout:20000});
   const info=await page.evaluate(isSite=>{
    const v=document.querySelector('video');const caption=document.querySelector(isSite?'.film-live':'#live');
    return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,currentTime:v.currentTime,caption:caption.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1,paused:v.paused};
   },isSite);
   if(info.width!==1920||info.height!==1080||Math.abs(info.duration-135.2)>.1||info.overflow||!info.caption)throw new Error(JSON.stringify(info));
   if(['attention','knowledge-curse'].includes(episode.id))await page.screenshot({path:path.join(import.meta.dirname,'review',`player-${episode.id}-${width}.png`)});
   report.push({id:episode.id,viewport:width,beforeClickRequests:0,mediaRequests,ranges,...info,errors});
   await page.close();
  }
 }
}finally{await browser.close();}
await fs.writeFile(path.join(import.meta.dirname,'review',args.includes('--site')?'site-player-check.json':'player-check.json'),JSON.stringify(report,null,2));
console.log('Native MP4 playback, seek, pause, captions and no overflow passed:',report.length);
if(report.some(r=>r.errors.length))process.exitCode=1;
