import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';import {pathToFileURL} from 'node:url';
const root=path.join(import.meta.dirname,'review/portable-check/心间漫游-心理学叙事重制版');
const {chromium}=await import(pathToFileURL('C:/Users/yangwei/.agents/skills/personal-homepage-skill/node_modules/playwright/index.mjs').href);
const server=spawn(process.execPath,[path.join(root,'scripts/serve.mjs')],{cwd:root,env:{...process.env,PORT:'43187',HOST:'127.0.0.1',SERVE_DIR:root},windowsHide:true,stdio:['ignore','pipe','pipe']});
let browser;try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',c=>reject(Error('Portable server exited '+c)));});
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const p=await browser.newPage({viewport:{width:390,height:900}});await p.goto('http://127.0.0.1:43187/index.html#/story/retrieval');await p.locator('[data-film-start]').click();await p.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
 await p.evaluate(()=>{const v=document.querySelector('video');v.muted=true;v.pause();v.currentTime=75;});await p.waitForFunction(()=>!document.querySelector('video').seeking&&document.querySelector('.film-live')?.textContent.length>10);
 const report=await p.evaluate(()=>({videoWidth:document.querySelector('video').videoWidth,videoHeight:document.querySelector('video').videoHeight,duration:document.querySelector('video').duration,time:document.querySelector('video').currentTime,caption:document.querySelector('.film-live').textContent,overflow:document.documentElement.scrollWidth>innerWidth+1}));
 if(report.videoWidth!==1920||report.videoHeight!==1080||report.overflow)throw Error('Portable playback failed');
 await fs.writeFile(path.join(import.meta.dirname,'review/portable-check.json'),JSON.stringify({extractedFromDeliveredZip:true,...report},null,2));console.log('Delivered ZIP extracted and played independently:',JSON.stringify(report));
}finally{await browser?.close();server.kill();}
