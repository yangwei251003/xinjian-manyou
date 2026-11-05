import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=import.meta.dirname;
const {chromium}=await import('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const episodes=JSON.parse(await fs.readFile(path.join(root,'episodes.json'),'utf8'));
const report=[];
await fs.mkdir(path.join(root,'review'),{recursive:true});
try{
 for(const episode of episodes){
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:43182/?capture=1&id=${episode.id}`);
  await page.evaluate(()=>window.ready);
  const failures=[];
  const start=Date.now();
  for(const shot of episode.shots){
   try{
    await page.evaluate(t=>window.render(t),(shot.start+shot.end)/2);
    if(true){
     const data=await page.evaluate(()=>{
      const small=document.createElement('canvas');small.width=480;small.height=270;
      small.getContext('2d').drawImage(document.querySelector('#film'),0,0,480,270);
      return small.toDataURL('image/jpeg',.86).split(',')[1];
     });
     await fs.writeFile(path.join(root,'review',`${episode.id}-${shot.index}.jpg`),Buffer.from(data,'base64'));
    }
   }catch(error){failures.push({shot:shot.index,error:error.message});}
  }
  for(const shot of episode.shots.slice(1)){
   for(const offset of [-.16,0,.16]){
    try{await page.evaluate(t=>window.render(t),shot.start+offset);}catch(error){failures.push({transition:shot.index,error:error.message});}
   }
  }
  report.push({id:episode.id,shots:42,transitionFrames:123,failures,errors,milliseconds:Date.now()-start});
  console.log(episode.id,'failures',failures.length,'pageErrors',errors.length);
  await page.close();
 }
}finally{await browser.close();}
await fs.writeFile(path.join(root,'review/frames.json'),JSON.stringify(report,null,2));
if(report.some(item=>item.failures.length||item.errors.length))process.exitCode=1;
