import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium}=await import('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const episodes=JSON.parse(await fs.readFile(new URL('episodes.json',import.meta.url),'utf8'));
const results=[];
try{const page=await browser.newPage({viewport:{width:1920,height:1080}});
 for(const episode of episodes){
  await page.goto('http://127.0.0.1:43182/?capture=1&id='+episode.id);await page.evaluate(()=>window.ready);
  const result=await page.evaluate(async()=>{
   async function fingerprint(t){window.render(t);const data=await new Promise(resolve=>document.querySelector('#film').toBlob(resolve));const hash=await crypto.subtle.digest('SHA-256',await data.arrayBuffer());return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');}
   const times=[1.3,window.episode.shots[18].start,73.1,113.4];
   const first=[];for(const t of times)first.push(await fingerprint(t));
   window.render(131.8);window.render(0);
   const second=[];for(const t of times)second.push(await fingerprint(t));
   return {times,first,second,pass:first.every((v,i)=>v===second[i])};
  });
  results.push({id:episode.id,...result});
 }
}finally{await browser.close();}
await fs.writeFile(new URL('review/determinism.json',import.meta.url),JSON.stringify(results,null,2));
console.log('Random-seek rendering reproducible:',results.filter(r=>r.pass).length+'/'+results.length);
if(results.some(r=>!r.pass))process.exitCode=1;
