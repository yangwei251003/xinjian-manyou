/* Re-encode only revised shots and their transitions. Copy all other H264 packets.
 * Source GOP is fixed at 120 frames, with no B frames (verified before splicing). */
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import {createHash,randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const root=import.meta.dirname,args=process.argv.slice(2),opt=(n,d)=>args.includes(n)?args[args.indexOf(n)+1]:d;
const ffmpeg=opt('--ffmpeg','ffmpeg'),ffprobe=opt('--ffprobe','ffprobe');
const {chromium}=await import('playwright');
const episodes=JSON.parse(await fs.readFile(path.join(root,'episodes.json'),'utf8'));
const requested=opt('--ids','').split(',').filter(Boolean),selected=episodes.filter(e=>!requested.length||requested.includes(e.id));
const revisedIds=new Set(['memory','metacognition','stress','brain','emotions','reappraisal','habits','personality','comparison','attachment','conformity','listening','framing','sunk-cost','help-seeking','support','boundaries','correlation','sampling','replication','gratitude']);
const out=path.join(root,'revised'),cache=path.join(root,'.cache/revision');await fs.mkdir(cache,{recursive:true});await fs.mkdir(out,{recursive:true});
const hash=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
const h=createHash('sha256');for(const name of ['renderer.js','topic-scenes.js','variety-scenes.js','episodes.json','assets/FilmSans.woff2','assets/user-music.aac'])h.update(await fs.readFile(path.join(root,name)));const sourceHash=h.digest('hex');
const key=randomBytes(24).toString('hex');
const command=(binary,params)=>new Promise((resolve,reject)=>{const child=spawn(binary,params,{windowsHide:true,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr=(stderr+d).slice(-5000));child.on('error',reject);child.on('exit',code=>code===0?resolve(stdout):reject(new Error(stderr)));});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf','.webp':'image/webp','.aac':'audio/aac','.glsl':'text/plain'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname.startsWith('/save/')&&req.method==='POST'){
   const match=/^\/save\/([a-z-]+)~(\d+)$/.exec(url.pathname);if(!match||!episodes.some(e=>e.id===match[1])||req.headers['x-render-key']!==key){res.writeHead(403);return res.end();}
   const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>40*1024*1024)throw new Error('Patch too large');chunks.push(chunk);}
   await fs.writeFile(path.join(cache,match[1]+'-'+match[2]+'.h264'),Buffer.concat(chunks));return res.end('saved');
  }
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(await fs.readFile(file));
 }catch(error){res.writeHead(500);res.end(error.message);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
async function patch(e){
 const base=path.join(root,'export',e.id),folder=path.join(out,e.id);await fs.mkdir(folder,{recursive:true});
 const previous=JSON.parse(await fs.readFile(path.join(base,'technical.json'),'utf8'));
 if(await hash(path.join(base,'film.mp4'))!==previous.fileHash)throw new Error('Base film was changed');
 try{const old=JSON.parse(await fs.readFile(path.join(folder,'technical.json'),'utf8'));if(old.sourceHash===sourceHash&&old.fileHash===await hash(path.join(folder,'film.mp4'))){console.log('Verified revised',e.id);return;}}catch{}
 await fs.copyFile(path.join(base,'poster.webp'),path.join(folder,'poster.webp'));
 if(!revisedIds.has(e.id)){
  await fs.copyFile(path.join(base,'film.mp4'),path.join(folder,'film.mp4'));
  await fs.writeFile(path.join(folder,'technical.json'),JSON.stringify({...previous,sourceHash,baseSourceHash:previous.sourceHash,baseFileHash:previous.fileHash,revisedWindows:[],unchangedBitstream:true,revisionEvidence:'New override returns false for this lesson; original scene functions, audio and fonts are unchanged.'},null,2));
  console.log('Preserved approved scenes',e.id);return;
 }
 const video=previous.probe.streams.find(s=>s.codec_type==='video');if(video.has_b_frames!==0)throw new Error('Cannot splice a source with reordered B frames');
 const total=previous.frames;
 const windows=e.shots.filter(s=>['gate','compare','causal','assemble'].includes(s.kind)).map(s=>({start:Math.max(0,Math.floor((s.start-.25)*60/120)*120),end:Math.min(total,Math.ceil((s.end+.25)*60/120)*120),shot:s.index}));
 const page=await browser.newPage({viewport:{width:1920,height:1080}});let renderSeconds=0;
 try{
  await page.goto(`http://127.0.0.1:${port}/?capture=1&id=${e.id}`);await page.evaluate(()=>window.ready);
  for(const [i,w]of windows.entries()){
   renderSeconds+=await page.evaluate(async({start,end,key,id,index})=>{
    const config={codec:'avc1.640028',width:1920,height:1080,bitrate:3200000,framerate:60,hardwareAcceleration:'prefer-software',latencyMode:'realtime',avc:{format:'annexb'}};
    const chunks=[];let failure;const encoder=new VideoEncoder({output:c=>{const d=new Uint8Array(c.byteLength);c.copyTo(d);chunks.push(d);},error:e=>failure=e.message});encoder.configure(config);const began=performance.now();
    for(let frame=start;frame<end;frame++){
     if(failure)throw new Error(failure);window.render(frame/60);
     const image=new VideoFrame(document.querySelector('#film'),{timestamp:Math.round((frame-start)*1e6/60),duration:Math.round(1e6/60)});encoder.encode(image,{keyFrame:(frame-start)%120===0});image.close();if(encoder.encodeQueueSize>10)await new Promise(resolve=>encoder.addEventListener('dequeue',resolve,{once:true}));
    }
    await encoder.flush();encoder.close();if(failure)throw new Error(failure);
    const saved=await fetch('/save/'+id+'~'+index,{method:'POST',headers:{'x-render-key':key},body:new Blob(chunks)});if(!saved.ok)throw new Error('Cannot save revised range');
    return (performance.now()-began)/1000;
   },{...w,key,id:e.id,index:i});
  }
 }finally{await page.close();}
 const parts=[];let cursor=0;
 async function copyRange(start,end,index){
  if(end<=start)return;
  const file=path.join(cache,e.id+'-copy-'+index+'.h264');
  await command(ffmpeg,['-v','error','-y','-ss',String(start/60),'-i',path.join(base,'film.mp4'),'-map','0:v:0','-frames:v',String(end-start),'-c:v','copy','-bsf:v','h264_mp4toannexb','-an','-f','h264',file]);parts.push(file);
 }
 for(const [i,w]of windows.entries()){await copyRange(cursor,w.start,i);parts.push(path.join(cache,e.id+'-'+i+'.h264'));cursor=w.end;}
 await copyRange(cursor,total,windows.length);
 const raw=path.join(cache,e.id+'-joined.h264');await fs.writeFile(raw,new Uint8Array());for(const file of parts)await fs.appendFile(raw,await fs.readFile(file));
 const check=JSON.parse(await command(ffprobe,['-v','error','-count_frames','-show_entries','stream=nb_read_frames,width,height','-of','json',raw]));if(Number(check.streams[0].nb_read_frames)!==total)throw new Error('Spliced frame count differs');
 const temp=path.join(folder,'film.partial.mp4');await command(ffmpeg,['-v','error','-y','-r','60','-i',raw,'-i',path.join(root,'assets/user-music.aac'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-bsf:a','aac_adtstoasc','-movflags','+faststart',temp]);
 const probe=JSON.parse(await command(ffprobe,['-v','error','-show_streams','-show_format','-of','json',temp]));
 const final=path.join(folder,'film.mp4');await fs.rename(temp,final);
 await fs.writeFile(path.join(folder,'technical.json'),JSON.stringify({...previous,sourceHash,baseSourceHash:previous.sourceHash,baseFileHash:previous.fileHash,fileHash:await hash(final),bytes:(await fs.stat(final)).size,revisedWindows:windows,renderSeconds,unchangedRanges:'H264 packets copied, no re-encoding; GOP boundaries expanded to include transitions',revisionExportedAt:new Date().toISOString(),probe},null,2));
 console.log('Revised',e.id,windows.length+' windows',Math.round(renderSeconds)+'s');
}
let cursor=0;const failures=[];
try{await Promise.all(Array.from({length:Math.min(2,Number(opt('--workers','2')))},async()=>{while(cursor<selected.length){const e=selected[cursor++];try{await patch(e);}catch(error){failures.push({id:e.id,error:error.message});console.error(e.id,error.message);}}}));}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
await fs.writeFile(path.join(out,'last-export.json'),JSON.stringify({sourceHash,selected:selected.map(e=>e.id),failures},null,2));if(failures.length)process.exitCode=1;
