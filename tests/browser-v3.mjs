import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const args=process.argv.slice(2);
const option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const modulePath=option('--playwright','playwright');
const {chromium}=await import(path.isAbsolute(modulePath)?pathToFileURL(modulePath).href:modulePath);
const base=option('--base','http://127.0.0.1:4173/').replace(/\/?$/,'/');
const draft=args.includes('--draft');
const [lessons,media]=await Promise.all(['content/lessons.json','assets/media.json'].map(async p=>(await fetch(base+p)).json()));
const browser=await chromium.launch({executablePath:option('--chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'),headless:true});
const report={base,checkedAt:new Date().toISOString(),widths:[],errors:[]};
try{
  for(const width of [1366,390]){
    const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
    const page=await context.newPage();
    page.setDefaultTimeout(10000);
    const requests=[];
    const errors=[];
    page.on('request',r=>{if(r.url().endsWith('.mp4'))requests.push(r.url());});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);
    await page.locator('.hero h1').waitFor();
    const results=[];
    for(const lesson of lessons){
      const id=lesson.id;
      const row={id};
      try{
        const before=requests.length;
        await page.evaluate(id=>location.hash='#/story/'+id,id);
        await page.locator('[data-save="'+id+'"]').waitFor();
        await page.locator('.comic-section img').evaluateAll(images=>Promise.all(images.map(async img=>{img.loading='eager';await img.decode();})));
        assert.equal(await page.locator('.comic-panel').count(),6);
        assert.equal(await page.locator('.reader-aside').isVisible(),true);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        const bubbles=await page.locator('.image-bubble').evaluateAll(nodes=>nodes.map(node=>{
          const a=node.getBoundingClientRect(),b=node.closest('.independent-frame').getBoundingClientRect();
          return {inside:a.left>=b.left-1&&a.right<=b.right+1&&a.top>=b.top-1&&a.bottom<=b.bottom+1,fontSize:parseFloat(getComputedStyle(node).fontSize)};
        }));
        assert.ok(bubbles.every(x=>x.inside&&x.fontSize>=12));
        assert.equal(requests.length,before,'reading must not request MP4');
        const film=media[id]?.video;
        if(!film?.src){assert.ok(draft,'missing film '+id);row.video='not published';results.push(row);continue;}
        await page.locator('[data-film-transcript] summary').click();
        await page.locator('.film-transcript-body ol li').first().waitFor();
        assert.equal(await page.locator('.film-transcript-body ol li').count(),18);
        assert.equal(requests.length,before,'opening script must not request MP4');
        await page.locator('[data-film-start]').click();
        const video=page.locator('.film-frame video');
        await video.waitFor();
        await video.evaluate(el=>{el.muted=true;});
        await page.waitForFunction(()=>{const v=document.querySelector('.film-frame video');return v?.readyState>=2&&v.currentTime>.2;});
        assert.ok(requests.length>before);
        await video.evaluate(el=>el.pause());
        const duration=await video.evaluate(el=>el.duration);
        assert.ok(duration>=60&&duration<=120);
        await video.evaluate(el=>{el.currentTime=44;});
        await page.waitForFunction(()=>{const v=document.querySelector('video');return !v.seeking&&Math.abs(v.currentTime-44)<.2;});
        await page.locator('.film-live [lang="zh-CN"]').filter({hasText:/\S/}).waitFor();
        if(id==='attention'){
          await page.locator('[data-film-fullscreen]').click();
          await page.waitForFunction(()=>document.fullscreenElement?.tagName==='VIDEO');
          await page.evaluate(()=>document.exitFullscreen());
        }
        row.video={duration,seek:await video.evaluate(el=>el.currentTime),caption:await page.locator('.film-live [lang="zh-CN"]').innerText()};
        row.result='pass';
      }catch(error){row.result=error.message;report.errors.push({width,id,error:error.message});}
      results.push(row);
    }
    // Use only isolated test records. The user's actual browser profile is untouched.
    await page.goto(base+'#/story/attribution');
    await page.locator('[data-save]').waitFor();await page.locator('[data-save]').click();
    await page.goto(base+'#/explore?saved=1');
    await page.locator('#search-input').waitFor();await page.locator('#search-input').fill('基本归因错误');await page.locator('#search-form button').click();
    await page.locator('.story-card').first().waitFor();
    assert.equal(await page.locator('.story-card').count(),1);
    assert.match(page.url(),/saved=1/);
    await page.locator('.filter-chips a').filter({hasText:'人与人'}).click();
    await page.locator('.filter-chips a[aria-current=true]').filter({hasText:'人与人'}).waitFor();
    assert.match(page.url(),/saved=1/);
    assert.equal(await page.locator('.story-card').count(),1);
    if(media.attention?.video){
      await page.goto(base+'#/story/attention');await page.locator('[data-film-start]').waitFor();
      await context.route('**/assets/videos/attention/film.mp4',route=>route.fulfill({status:404,body:'not found'}));
      await page.locator('[data-film-start]').click();
      await page.locator('.film-status').filter({hasText:'暂时无法播放'}).waitFor();
      assert.equal(await page.locator('.comic-panel').count(),6);
      await page.locator('[data-film-transcript] summary').click();
      await page.locator('.film-transcript-body ol li').first().waitFor();
      await context.unroute('**/assets/videos/attention/film.mp4');
      await page.locator('[data-film-start]').click();
      await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
    }
    report.widths.push({width,lessons:results,runtimeErrors:errors});
    assert.deepEqual(errors,[]);
    await context.close();
  }
}finally{await browser.close();}
const output=option('--out','');
if(output)await fs.writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({tested:lessons.length,widths:report.widths.map(r=>r.width),failures:report.errors},null,2));
if(report.errors.length)process.exitCode=1;
