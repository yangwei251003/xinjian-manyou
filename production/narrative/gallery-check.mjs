import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL('C:/Users/yangwei/.agents/skills/personal-homepage-skill/node_modules/playwright/index.mjs').href);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const rows=[];
try{for(const width of [1366,390]){
 const page=await browser.newPage({viewport:{width,height:900}});let requests=0;const errors=[];
 page.on('request',r=>{if(r.url().includes('.mp4'))requests++;});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:43184/films.html#watch-communication-gap');await page.locator('#collection article').last().waitFor();
 if(await page.locator('#collection article').count()!==14)throw Error('Expected 14 film cards');
 if(requests)throw Error('MP4 requested before play');
 const section=page.locator('#watch-communication-gap');if(await section.locator('.film-connections').count()!==1)throw Error('Duplicate connection explanation');await section.locator('[data-film-start]').click();
 await page.waitForFunction(()=>document.querySelector('#watch-communication-gap video')?.readyState>=2);
 await section.locator('video').evaluate(v=>{v.muted=true;v.pause();v.currentTime=96.975;});
 await page.waitForFunction(()=>!document.querySelector('#watch-communication-gap video').seeking);
 await section.locator('.film-live').getByText('例如：“先按三角，再等黄灯亮起。”',{exact:true}).waitFor();
 const typography=await section.locator('.film-live [lang="zh-CN"]').evaluate(el=>({font:getComputedStyle(el).fontSize,width:el.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth+1}));
 if(typography.overflow||parseInt(typography.font)<18)throw Error('Unreadable caption or viewport overflow');
 await section.locator('[data-film-transcript] summary').click();await page.waitForFunction(()=>document.querySelectorAll('#watch-communication-gap .film-transcript li time').length===24);
 await section.locator('[data-film-fullscreen]').click();await page.waitForFunction(()=>document.fullscreenElement?.tagName==='VIDEO');await page.evaluate(()=>document.exitFullscreen());
 await section.locator('.film-frame').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(import.meta.dirname,'review',`gallery-${width}.png`)});
 rows.push({width,filmCards:14,beforeClickMp4Requests:0,synchronizedCaption:true,transcriptCues:24,fullscreen:true,typography,errors});await page.close();
}}finally{await browser.close();}
await fs.writeFile(path.join(import.meta.dirname,'review/gallery-check.json'),JSON.stringify(rows,null,2));console.log('Gallery playback, captions, transcript, fullscreen and deep link passed:',rows.length);
