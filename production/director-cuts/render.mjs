import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { films } from './film-plan.mjs';

const root = import.meta.dirname;
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const wanted = option('--ids', '').split(',').filter(Boolean);
const stillOnly = args.includes('--stills');
const selection = films.filter(film => !wanted.length || wanted.includes(film.id));
if (!selection.length) throw Error('No film selected');
const workers = Math.min(2, Math.max(1, Number(option('--workers', '1'))));
const ffmpeg = process.env.FFMPEG ?? path.join(os.homedir(), 'AppData/Local/Programs/FFmpeg/8.1.2/ffmpeg-8.1.2-essentials_build/bin/ffmpeg.exe');
const ffprobe = path.join(path.dirname(ffmpeg), path.basename(ffmpeg).replace('ffmpeg','ffprobe'));
const chrome = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const playwright = process.env.PLAYWRIGHT_PATH ?? path.join(os.homedir(), '.agents/skills/personal-homepage-skill/node_modules/playwright/index.mjs');
const { chromium } = await import(pathToFileURL(playwright).href);

export function command(exe, parameters) {
  return new Promise((resolve,reject) => {
    const child = spawn(exe,parameters,{windowsHide:true,stdio:['ignore','pipe','pipe']});
    let stdout='', stderr='';
    child.stdout.on('data', data => stdout += data);
    child.stderr.on('data', data => stderr = (stderr+data).slice(-9000));
    child.on('error', reject);
    child.on('close', code => code===0 ? resolve(stdout) : reject(Error(`${path.basename(exe)}: ${stderr}`)));
  });
}

const cache = path.join(root,'.cache');
await fs.mkdir(cache,{recursive:true});
const key = randomBytes(24).toString('hex');
const server = http.createServer(async (request,response) => {
  try {
    const url = new URL(request.url,'http://localhost');
    if (request.method === 'POST' && url.pathname.startsWith('/save/')) {
      const id = url.pathname.slice(6);
      if (request.headers['x-key'] !== key || !selection.some(f => f.id === id)) {
        response.writeHead(403).end(); return;
      }
      const data = [];
      let bytes = 0;
      for await (const chunk of request) {
        bytes += chunk.length;
        if (bytes > 140_000_000) throw Error('Encoded film exceeds expected length');
        data.push(chunk);
      }
      await fs.writeFile(path.join(cache,id+'.h264'),Buffer.concat(data));
      response.end('ok'); return;
    }
    const urlPath = decodeURIComponent(url.pathname);
    const target = path.resolve(root,'.'+urlPath);
    if (request.method !== 'GET' || !target.startsWith(root+path.sep) || !/\.(html|mjs|woff2)$/.test(target)) {
      response.writeHead(404).end(); return;
    }
    const mime = {'.html':'text/html;charset=utf-8','.mjs':'text/javascript;charset=utf-8','.woff2':'font/woff2'};
    response.writeHead(200,{'Content-Type':mime[path.extname(target)],'Cache-Control':'no-store'});
    response.end(await fs.readFile(target));
  } catch (error) {
    if (!response.headersSent) response.writeHead(500);
    response.end(error.message);
  }
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const browser = await chromium.launch({headless:true,executablePath:chrome,args:['--disable-background-timer-throttling']});
const base = `http://127.0.0.1:${server.address().port}`;
const digest = data => createHash('sha256').update(data).digest('hex');
const common = ['capture.html','drawing.mjs','assets/sans.woff2','assets/serif.woff2','assets/play.woff2'];
const commonInput = Buffer.concat(await Promise.all(common.map(file => fs.readFile(path.join(root,file)))));
const output = path.join(root,'export');

async function renderFilm(film) {
  const folder = path.join(output,film.id);
  const review = path.join(root,'review',film.id);
  await Promise.all([fs.mkdir(folder,{recursive:true}),fs.mkdir(review,{recursive:true})]);
  const final = path.join(folder,'film.mp4');
  const audio = path.join(root,'mix',film.id+'.wav');
  const manifest = path.join(folder,'technical.json');
  const shotCode = await fs.readFile(path.join(root,'shots',film.id+'.mjs'));
  const sourceHash = digest(Buffer.concat([commonInput,shotCode,Buffer.from(JSON.stringify(film)),stillOnly?Buffer.alloc(0):await fs.readFile(audio)]));
  if (!args.includes('--force') && !stillOnly) {
    try {
      const old = JSON.parse(await fs.readFile(manifest,'utf8'));
      if (old.sourceHash===sourceHash && old.fileHash===digest(await fs.readFile(final))) {
        console.log('Verified existing',film.id); return;
      }
    } catch { /* Missing or stale renders are produced below. */ }
  }
  const page = await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.text().startsWith('ENCODE ')) console.log(film.id,message.text()); });
  try {
    await page.goto(`${base}/capture.html?id=${film.id}`);
    await page.evaluate(() => window.ready);
    await page.evaluate(time => window.render(time,{noCaption:true}),film.poster);
    const poster = await page.locator('#film').screenshot();
    const png = path.join(review,'cover.png');
    await fs.writeFile(png,poster);
    await command(ffmpeg,['-v','error','-y','-i',png,'-vf','scale=1280:720','-c:v','libwebp','-quality','88',path.join(folder,'poster.webp')]);
    for (const [index,scene] of film.shots.entries()) {
      const time = scene.start+scene.seconds*.64;
      await page.evaluate(time => window.render(time),time);
      await page.locator('#film').screenshot({path:path.join(review,`${index+1}-${scene.id}.png`)});
      await page.evaluate(time => window.render(time,{graphicsOnly:true}),time);
      await page.locator('#film').screenshot({path:path.join(review,`${index+1}-${scene.id}-graphics.png`)});
    }
    if (errors.length) throw Error(errors.join('\n'));
    if (stillOnly) { console.log('Stills ready',film.id); return; }
    const report = await page.evaluate(async ({id,duration,key}) => {
      const config = {codec:'avc1.640028',width:1920,height:1080,bitrate:2650000,framerate:30,hardwareAcceleration:'prefer-software',latencyMode:'realtime',avc:{format:'annexb'}};
      if (!(await VideoEncoder.isConfigSupported(config)).supported) throw Error('H.264 capture unavailable');
      const chunks = [];
      let error;
      const encoder = new VideoEncoder({output(chunk) {
        const bytes = new Uint8Array(chunk.byteLength);
        chunk.copyTo(bytes); chunks.push(bytes);
      },error: e => error=e});
      encoder.configure(config);
      const canvas = document.getElementById('film');
      const frameCount = duration*30;
      const started = performance.now();
      for (let frame=0; frame<frameCount; frame++) {
        if (error) throw error;
        window.render(frame/30);
        const videoFrame = new VideoFrame(canvas,{timestamp:Math.round(frame*1e6/30)});
        encoder.encode(videoFrame,{keyFrame:frame%60===0});
        videoFrame.close();
        if (encoder.encodeQueueSize>7) await new Promise(resolve=>encoder.addEventListener('dequeue',resolve,{once:true}));
        if (frame && frame%450===0) console.log(`ENCODE ${frame}/${frameCount}`);
      }
      await encoder.flush();
      encoder.close();
      if (error) throw error;
      if (chunks.length!==frameCount) throw Error(`Captured ${chunks.length} / ${frameCount} frames`);
      const saved = await fetch(`/save/${id}`,{method:'POST',headers:{'X-Key':key},body:new Blob(chunks)});
      if (!saved.ok) throw Error('Saving the encoded movie failed');
      return {frames:frameCount,fps:30,seconds:duration,renderSeconds:(performance.now()-started)/1000};
    },{id:film.id,duration:film.duration,key});
    const temp = path.join(folder,'film.partial.mp4');
    await command(ffmpeg,['-v','error','-y','-r','30','-i',path.join(cache,film.id+'.h264'),'-i',audio,
      '-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','160k','-movflags','+faststart',temp]);
    const probe = JSON.parse(await command(ffprobe,['-v','error','-show_streams','-show_format','-of','json',temp]));
    const video = probe.streams.find(stream => stream.codec_type==='video');
    if (Number(video.nb_frames)!==report.frames) throw Error('Output frame count mismatch');
    await fs.rename(temp,final);
    await fs.writeFile(manifest,JSON.stringify({...report,id:film.id,sourceHash,fileHash:digest(await fs.readFile(final)),probe},null,2)+'\n');
    console.log('Rendered',film.id,`${film.duration}s`,`${Math.round(report.renderSeconds)}s encode`);
  } finally { await page.close(); }
}

let next = 0;
const failures = [];
try {
  await Promise.all(Array.from({length:workers},async () => {
    while (next<selection.length) {
      const film = selection[next++];
      try { await renderFilm(film); }
      catch (error) { failures.push(film.id); console.error(film.id,error.stack); }
    }
  }));
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
if (failures.length) process.exitCode = 1;
