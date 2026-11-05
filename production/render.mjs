import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import {randomBytes,createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const args=process.argv.slice(2);
const option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const root=path.resolve(import.meta.dirname,'..');
const projects=path.resolve(option('--projects',path.join(process.env.USERPROFILE||process.env.HOME,'Documents/VideoCreation/Projects/xinjian-manyou-v3')));
const modulePath=option('--playwright','playwright');
const {chromium}=await import(path.isAbsolute(modulePath)?pathToFileURL(modulePath).href:modulePath);
const films=JSON.parse(await fs.readFile(path.join(root,'production/films.json'),'utf8'));
const requested=option('--ids','').split(',').filter(Boolean);
const selected=films.filter(f=>!requested.length||requested.includes(f.id));
const firstBatch=['attention','attribution','retrieval','knowledge-curse'];
selected.sort((a,b)=>(firstBatch.includes(a.id)?firstBatch.indexOf(a.id):films.indexOf(a)+4)-(firstBatch.includes(b.id)?firstBatch.indexOf(b.id):films.indexOf(b)+4));
const force=args.includes('--force');
const workers=Math.max(1,Math.min(3,Number(option('--workers','2'))));
const key=randomBytes(20).toString('hex');
const known=new Map(films.map(f=>[f.id,f]));
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    const [action,id]=url.pathname.split('/').filter(Boolean);
    if(!known.has(id)){res.writeHead(404);return res.end();}
    if(action==='film'){
      res.setHeader('Content-Type','text/html; charset=utf-8');
      return res.end(await fs.readFile(path.join(projects,id,'pages/episode.html')));
    }
    if(action==='save'&&req.method==='POST'&&req.headers['x-render-key']===key){
      const output=path.join(projects,id,'.film/director.h264');
      await fs.mkdir(path.dirname(output),{recursive:true});
      const chunks=[];
      let size=0;
      for await(const chunk of req){size+=chunk.length;if(size>150*1024*1024)throw new Error('Encoded film too large');chunks.push(chunk);}
      await fs.writeFile(output,Buffer.concat(chunks));
      return res.end('saved');
    }
    res.writeHead(403);res.end();
  }catch(error){res.writeHead(500);res.end(String(error.message));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({
  ...(option('--chrome','')?{executablePath:option('--chrome','')}:{channel:'chrome'}),
  headless:true,
  args:['--autoplay-policy=no-user-gesture-required'],
});
const ffmpeg=option('--ffmpeg','ffmpeg');
function command(binary,params){
  return new Promise((resolve,reject)=>{
    const child=spawn(binary,params,{windowsHide:true,stdio:['ignore','ignore','pipe']});
    let output='';
    child.stderr.on('data',data=>{output=(output+data).slice(-7000);});
    child.on('error',reject);
    child.on('exit',code=>code===0?resolve(output):reject(new Error(binary+' failed: '+output)));
  });
}
async function exists(file){try{return (await fs.stat(file)).size>0;}catch{return false;}}
async function fileHash(file){return createHash('sha256').update(await fs.readFile(file)).digest('hex');}
async function renderFilm(film){
  const folder=path.join(projects,film.id);
  for(const [file,marker]of [['pages/episode.html','.director-source-sha256'],['film.html','.director-timeline-sha256']]){
    const expected=await fs.readFile(path.join(folder,marker),'utf8');
    const actual=createHash('sha256').update(await fs.readFile(path.join(folder,file))).digest('hex');
    if(actual!==expected.trim())throw new Error('Manual edits preserved in '+file+'. Export the current timeline with OpenFilm.');
  }
  const inputHash=createHash('sha256');
  for(const file of ['pages/episode.html','film.html','audio/mix.wav'])inputHash.update(await fs.readFile(path.join(folder,file)));
  const contentHash=inputHash.digest('hex');
  const target=path.join(root,'assets/videos',film.id);
  await fs.mkdir(target,{recursive:true});
  const final=path.join(target,'film.mp4');
  const temporary=path.join(target,'film.partial.mp4');
  const technical=path.join(projects,film.id,'render-technical.json');
  const pending=technical+'.pending';
  if(!force&&await exists(pending)){
    const ready=JSON.parse(await fs.readFile(pending,'utf8'));
    const prepared=await exists(temporary)?temporary:final;
    if(ready.contentHash===contentHash&&await exists(prepared)&&await fileHash(prepared)===ready.fileHash){
      if(prepared!==final)await fs.rename(prepared,final);
      await fs.rename(pending,technical);
      console.log('Committed verified pending render',film.id);
      return;
    }
  }
  if(!force&&await exists(final)&&await exists(technical)){
    const previous=JSON.parse(await fs.readFile(technical,'utf8'));
    if(previous.contentHash===contentHash&&previous.fileHash===await fileHash(final)){console.log('Already rendered',film.id);return;}
  }
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  try{
    await page.addInitScript(()=>{window.filmHost={version:'0.1',name:'DirectorExport'};});
    await page.goto('http://127.0.0.1:'+port+'/film/'+film.id);
    await page.evaluate(()=>window.ready);
    await page.evaluate(()=>window.render(.9,true));
    await page.locator('#picture').screenshot({path:path.join(target,'poster.png')});
    await command(ffmpeg,['-y','-hide_banner','-loglevel','error','-i',path.join(target,'poster.png'),'-vf','scale=1280:720','-c:v','libwebp','-quality','88',path.join(target,'poster.webp')]);
    await fs.unlink(path.join(target,'poster.png'));
    console.log('Encoding',film.id);
    const report=await page.evaluate(async({duration,port,key,id})=>{
      const canvas=document.querySelector('#picture');
      const config={codec:'avc1.640028',width:1920,height:1080,bitrate:2400000,framerate:60,hardwareAcceleration:'prefer-software',latencyMode:'realtime',avc:{format:'annexb'}};
      const support=await VideoEncoder.isConfigSupported(config);
      if(!support.supported)throw new Error('1080p60 H264 encoder unavailable');
      const chunks=[];let encoderError;
      const encoder=new VideoEncoder({
        output:chunk=>{const bytes=new Uint8Array(chunk.byteLength);chunk.copyTo(bytes);chunks.push(bytes);},
        error:error=>{encoderError=String(error);},
      });
      encoder.configure(config);
      const frames=Math.ceil(duration*60);
      const start=performance.now();
      for(let frame=0;frame<frames;frame++){
        if(encoderError)throw new Error(encoderError);
        window.render(frame/60,true);
        const picture=new VideoFrame(canvas,{timestamp:Math.round(frame*1e6/60),duration:Math.round(1e6/60)});
        encoder.encode(picture,{keyFrame:frame%120===0});picture.close();
        if(encoder.encodeQueueSize>14)await new Promise(resolve=>encoder.addEventListener('dequeue',resolve,{once:true}));
      }
      await encoder.flush();encoder.close();
      if(encoderError)throw new Error(encoderError);
      const payload=new Blob(chunks,{type:'application/octet-stream'});
      const response=await fetch('http://127.0.0.1:'+port+'/save/'+id,{method:'POST',headers:{'x-render-key':key},body:payload});
      if(!response.ok)throw new Error('Could not save encoded frames');
      return {frames,seconds:(performance.now()-start)/1000,encodedBytes:payload.size,frameRate:60,frameDriven:true,codec:'H264',render:'Chromium Canvas + WebCodecs',timeline:'OpenFilm film.html, six native linked scenes'};
    },{duration:film.duration,port,key,id:film.id});
    const raw=path.join(projects,film.id,'.film/director.h264');
    await command(ffmpeg,['-y','-hide_banner','-loglevel','error','-r','60','-i',raw,'-i',path.join(projects,film.id,'audio/mix.wav'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','144k','-ar','48000','-t',String(film.duration),'-movflags','+faststart',temporary]);
    const data={...report,id:film.id,contentHash,fileHash:await fileHash(temporary),fileBytes:(await fs.stat(temporary)).size,exportedAt:new Date().toISOString(),timelineReviewed:false,continuousVisualReview:false,fullListeningReview:false};
    await fs.writeFile(pending,JSON.stringify(data,null,2)+'\n');
    await fs.rename(temporary,final);
    await fs.rename(pending,technical);
    console.log('Rendered',film.id,report.frames+' frames',Math.round(report.seconds)+'s',data.fileBytes+' bytes');
  }finally{await page.close();}
}
let index=0;
const failures=[];
try{
  await Promise.all(Array.from({length:workers},async()=>{
    while(index<selected.length){
      const film=selected[index++];
      try{await renderFilm(film);}catch(error){failures.push({id:film.id,error:error.message});console.error(film.id,error.message);}
    }
  }));
}finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
await fs.writeFile(path.join(projects,'last-render-report.json'),JSON.stringify({failures,selected:selected.map(f=>f.id)},null,2)+'\n');
if(failures.length)process.exitCode=1;
