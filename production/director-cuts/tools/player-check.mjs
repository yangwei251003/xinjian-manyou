import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const root=path.dirname(import.meta.dirname);
const site=path.join(root,'website');
const index=JSON.parse(await fs.readFile(path.join(site,'assets/film-collection.json'),'utf8'));
const lessons=index.flatMap(film=>film.relatedLessons.map(lesson=>({id:lesson.id,film})));
const launch=process.env.PLAYWRIGHT_PATH??path.join(os.homedir(),'.agents/skills/personal-homepage-skill/node_modules/playwright/index.mjs');
const {chromium}=await import(pathToFileURL(launch).href);

let server;
let base=process.argv[2];
if(!base){
  const probe=net.createServer();
  await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
  const port=probe.address().port;
  await new Promise(resolve=>probe.close(resolve));
  server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:site,env:{...process.env,PORT:String(port),SERVE_DIR:site},windowsHide:true,stdio:'pipe'});
  base=`http://127.0.0.1:${port}`;
  await new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.once('exit',code=>reject(Error(`Preview server exited ${code}`)));
    server.stdout.once('data',resolve);
  });
}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results=[];

async function play(page,film){
  const video=page.locator('.lesson-film video');
  await page.locator('.lesson-film [data-film-start]').click();
  await page.waitForFunction(()=>document.querySelector('.lesson-film video')?.currentTime>.06);
  const result=await video.evaluate(element=>{
    element.pause();
    return {duration:element.duration,w:element.videoWidth,h:element.videoHeight};
  });
  assert.equal(result.w,1920);assert.equal(result.h,1080);
  assert.ok(Math.abs(result.duration-film.duration)<.1);
  const script=JSON.parse(await fs.readFile(path.join(site,film.meta),'utf8'));
  const cue=script.cues[Math.floor(script.cues.length*.61)];
  const time=(cue.start+cue.end)/2;
  await video.evaluate((element,time)=>element.currentTime=time,time);
  await page.waitForFunction(({time,zh})=>{
    const video=document.querySelector('.lesson-film video');
    const text=document.querySelector('.film-live [lang="zh-CN"]')?.textContent;
    return !video.seeking&&Math.abs(video.currentTime-time)<.13&&text===zh;
  },{time,zh:cue.zh});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  return {played:true,seek:time,cue:cue.zh};
}

try{
  await Promise.all([1280,390].map(async width=>{
    const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
    let movies=0;
    page.on('request',request=>{if(request.url().includes('/film.mp4'))movies++;});
    await page.goto(base+'/films.html');
    await page.locator('.film-tile').last().waitFor();
    assert.equal(await page.locator('.film-tile').count(),14);
    assert.equal(movies,0);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:path.join(root,'review',`gallery-${width}.png`),fullPage:true});
    await page.locator('a[href="#watch-communication-gap"]').click();
    await play(page,index.find(f=>f.filmId==='communication-gap'));
    assert.ok(movies>0);
    await page.locator('a[href="#watch-framing-choice"]').click();
    assert.equal(await page.locator('.lesson-film video').count(),0);
    await page.locator('.film-transcript summary').click();
    await page.locator('.film-sources li').first().waitFor();
    assert.equal(await page.locator('.film-transcript-body ol li').count(),11);
    for(const lesson of lessons){
      movies=0;
      await page.goto(base+'/#/story/'+encodeURIComponent(lesson.id));
      await page.locator('.lesson-film [data-film-start]').waitFor();
      assert.equal(movies,0);
      results.push({lesson:lesson.id,film:lesson.film.filmId,width,...await play(page,lesson.film)});
    }
    console.log(`${width}px: ${lessons.length} lesson players and the collection passed`);
    await page.close();
  }));
  const retry=await browser.newPage({viewport:{width:390,height:844}});
  await retry.route('**/film.mp4',route=>route.abort());
  await retry.goto(base+'/films.html#watch-attention-limits');
  await retry.locator('[data-film-start]').click();
  await retry.waitForFunction(()=>document.querySelector('.film-status')?.textContent.includes('无法播放'));
  assert.equal(await retry.locator('video').count(),0);
  await retry.locator('.film-transcript summary').click();
  await retry.locator('.film-sources li').first().waitFor();
  await retry.unroute('**/film.mp4');
  await play(retry,index[0]);
  await fs.writeFile(path.join(root,'review','website-check.json'),JSON.stringify({base,courses:results,collection:14,retry:true,zeroPreload:true},null,2)+'\n');
  console.log('Blocked media recovered; transcript stayed accessible');
}finally{
  await browser.close();
  if(server)server.kill();
}
