import path from 'node:path';
import fs from 'node:fs/promises';
import net from 'node:net';
import {spawn} from 'node:child_process';
// Installed into website/scripts by the local assembly step.
const root=path.resolve(import.meta.dirname,'..');
const edition=JSON.parse(await fs.readFile(path.join(root,'edition.json'),'utf8'));
async function sameEdition(port){
 try{const response=await fetch(`http://127.0.0.1:${port}/edition.json`,{signal:AbortSignal.timeout(500)});if(!response.ok)return false;return (await response.json()).sourceHash===edition.sourceHash;}catch{return false;}
}
function available(port){return new Promise(resolve=>{const probe=net.createServer();probe.once('error',()=>resolve(false));probe.listen(port,'127.0.0.1',()=>probe.close(()=>resolve(true)));});}
let chosen;
for(let port=43183;port<43190;port++){
 if(await sameEdition(port)){chosen=port;break;}
 if(!await available(port))continue;
 const child=spawn(process.execPath,[path.join(root,'scripts/serve.mjs')],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),SERVE_DIR:root},detached:true,windowsHide:true,stdio:'ignore'});child.unref();
 for(let i=0;i<30;i++){if(await sameEdition(port)){chosen=port;break;}await new Promise(resolve=>setTimeout(resolve,150));}
 if(chosen)break;
}
if(!chosen)throw new Error('The local preview could not start. Try node scripts/serve.mjs from this folder.');
const url=`http://127.0.0.1:${chosen}/films.html`;
console.log(url);
if(!process.argv.includes('--no-open')){
 const opener=process.platform==='win32'?spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',`Start-Process -FilePath '${url}'`],{windowsHide:true,detached:true,stdio:'ignore'}):spawn(process.platform==='darwin'?'open':'xdg-open',[url],{detached:true,stdio:'ignore'});opener.unref();
}
