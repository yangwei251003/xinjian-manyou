import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {createHash,randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const root=import.meta.dirname;
const args=process.argv.slice(2), opt=(n,d)=>args.includes(n)?args[args.indexOf(n)+1]:d;
const ids=opt('--ids','').split(',').filter(Boolean), limit=Number(opt('--seconds','0'));
const ffmpeg=opt('--ffmpeg','ffmpeg');
const ffprobe=opt('--ffprobe','ffprobe');
const playwrightModule=opt('--playwright','playwright');
const {chromium}=await import(path.isAbsolute(playwrightModule)?pathToFileURL(playwrightModule).href:playwrightModule);
const episodes=JSON.parse(await fs.readFile(path.join(root,'episodes.json'),'utf8'));
const first=['knowledge-curse','attention','retrieval','attribution'];
const selected=episodes.filter(e=>!ids.length||ids.includes(e.id)).sort((a,b)=>(first.includes(a.id)?first.indexOf(a.id):episodes.indexOf(a)+4)-(first.includes(b.id)?first.indexOf(b.id):episodes.indexOf(b)+4));
const key=randomBytes(24).toString('hex');
const cache=path.join(root,'.cache');await fs.mkdir(cache,{recursive:true});
const out=path.join(root,limit?'samples':'export');await fs.mkdir(out,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.aac':'audio/aac','.woff2':'font/woff2','.ttf':'font/ttf','.webp':'image/webp','.glsl':'text/plain'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname.startsWith('/save/')&&req.method==='POST'){
   const id=url.pathname.slice(6);if(req.headers['x-render-key']!==key||!episodes.some(e=>e.id===id)){res.writeHead(403);return res.end();}
   const stream=createWriteStream(path.join(cache,id+'.h264'));let bytes=0;
   try{for await(const chunk of req){bytes+=chunk.length;if(bytes>250*1024*1024)throw new Error('Unexpected capture size');if(!stream.write(chunk))await new Promise(resolve=>stream.once('drain',resolve));}await new Promise((resolve,reject)=>{stream.on('error',reject);stream.end(resolve);});}catch(error){stream.destroy();throw error;}
   return res.end('saved');
  }
  const target=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  const data=await fs.readFile(target);res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
  const range=/bytes=(\d+)-(\d*)/.exec(req.headers.range||'');
  if(range){const start=Number(range[1]),end=Math.min(data.length-1,range[2]?Number(range[2]):data.length-1);res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1,'Accept-Ranges':'bytes'});return res.end(data.subarray(start,end+1));}
  res.setHeader('Content-Length',data.length);res.end(data);
 }catch(error){res.writeHead(500);res.end(error.message);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({...(opt('--chrome','')?{executablePath:opt('--chrome','')}:{channel:'chrome'}),headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const command=(binary,params)=>new Promise((resolve,reject)=>{const child=spawn(binary,params,{windowsHide:true,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr=(stderr+d).slice(-7000));child.on('error',reject);child.on('exit',code=>code===0?resolve(stdout):reject(new Error(stderr)));});
const hash=async file=>createHash('sha256').update(await fs.readFile(file)).digest('hex');
const sharedHash=createHash('sha256');
for(const file of ['renderer.js','topic-scenes.js','episodes.json','assets/FilmSans.woff2','assets/user-music.aac'])sharedHash.update(await fs.readFile(path.join(root,file)));
const sourceHash=sharedHash.digest('hex');
async function renderEpisode(episode){
 const folder=path.join(out,episode.id);await fs.mkdir(folder,{recursive:true});
 const final=path.join(folder,'film.mp4'),technical=path.join(folder,'technical.json');
 try{const old=JSON.parse(await fs.readFile(technical,'utf8'));if(!args.includes('--force')&&old.sourceHash===sourceHash&&old.fileHash===await hash(final)){console.log('Verified existing',episode.id);return;}}catch{}
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
 try{
  await page.goto(`http://127.0.0.1:${port}/?capture=1&id=${episode.id}`);await page.evaluate(()=>window.ready);
  await page.evaluate(()=>window.render(1.25));await page.locator('#film').screenshot({path:path.join(folder,'poster.png')});
  await command(ffmpeg,['-v','error','-y','-i',path.join(folder,'poster.png'),'-vf','scale=1280:720','-c:v','libwebp','-quality','87',path.join(folder,'poster.webp')]);
  await fs.unlink(path.join(folder,'poster.png'));
  console.log('Encoding',episode.id);
  page.on('console',msg=>{if(msg.text().startsWith('capture-progress'))console.log(episode.id,msg.text());});
  const duration=limit||episode.duration;
  const report=await page.evaluate(async({id,duration,key})=>{
   const config={codec:'avc1.640028',width:1920,height:1080,bitrate:3200000,framerate:60,hardwareAcceleration:'prefer-software',latencyMode:'realtime',avc:{format:'annexb'}};
   if(!(await VideoEncoder.isConfigSupported(config)).supported)throw new Error('1080p60 encoder unsupported');
   const chunks=[];let failure;
   const encoder=new VideoEncoder({output:chunk=>{const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);chunks.push(data);},error:error=>failure=error.message});encoder.configure(config);
   const frames=Math.ceil(duration*60),start=performance.now();
   for(let frame=0;frame<frames;frame++){
    if(failure)throw new Error(failure);
    window.render(frame/60);
    const picture=new VideoFrame(document.querySelector('#film'),{timestamp:Math.round(frame*1e6/60),duration:Math.round(1e6/60)});
    encoder.encode(picture,{keyFrame:frame%120===0});picture.close();
    if(encoder.encodeQueueSize>10)await new Promise(resolve=>encoder.addEventListener('dequeue',resolve,{once:true}));
    if(frame>0&&frame%1800===0)console.log('capture-progress '+Math.round(frame/frames*100)+'%');
   }
   await encoder.flush();encoder.close();if(failure)throw new Error(failure);
   const data=new Blob(chunks,{type:'application/octet-stream'});
   const saved=await fetch('/save/'+id,{method:'POST',headers:{'x-render-key':key},body:data});if(!saved.ok)throw new Error('Cannot save encoded frames');
   return {frames,renderSeconds:(performance.now()-start)/1000,encodedBytes:data.size,width:1920,height:1080,frameRate:60};
  },{id:episode.id,duration,key});
  const temp=path.join(folder,'film.partial.mp4');
  await command(ffmpeg,['-v','error','-y','-r','60','-i',path.join(cache,episode.id+'.h264'),'-i',path.join(root,'assets/user-music.aac'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','copy','-bsf:a','aac_adtstoasc',...(limit?['-t',String(limit)]:[]),'-movflags','+faststart',temp]);
  const probe=JSON.parse(await command(ffprobe,['-v','error','-show_streams','-show_format','-of','json',temp]));
  await fs.rename(temp,final);
  const record={id:episode.id,...report,sourceHash,fileHash:await hash(final),bytes:(await fs.stat(final)).size,music:'user-supplied AAC, original audio packets copied without voice, substitute music, tempo or gain processing',musicSha256:episode.musicSha256,editorContract:'none',continuousVisualReview:false,fullListeningReview:false,exportedAt:new Date().toISOString(),probe};
  await fs.writeFile(technical,JSON.stringify(record,null,2));
  console.log('Rendered',episode.id,Math.round(report.renderSeconds)+'s',record.bytes+' bytes');
 }finally{await page.close();}
}
let index=0;const failures=[];
try{await Promise.all(Array.from({length:Math.min(2,Number(opt('--workers','2')))},async()=>{while(index<selected.length){const episode=selected[index++];try{await renderEpisode(episode);}catch(error){failures.push({id:episode.id,error:error.message});console.error('Failed',episode.id,error.message);}}}));}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
await fs.writeFile(path.join(out,'last-export.json'),JSON.stringify({sourceHash,selected:selected.map(e=>e.id),failures},null,2));
if(failures.length)process.exitCode=1;
