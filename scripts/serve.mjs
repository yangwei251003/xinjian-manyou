import http from 'node:http';
import {createReadStream,statSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve(process.env.SERVE_DIR||'.');
const port=Number(process.env.PORT||4173);const host=process.env.HOST||'127.0.0.1';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8','.woff2':'font/woff2','.md':'text/plain; charset=utf-8'};
function pipeFile(file,res,options){
  const input=createReadStream(file,options);
  const disconnected=()=>input.destroy();
  res.once('close',disconnected);
  input.once('close',()=>res.off('close',disconnected));
  input.once('error',()=>res.destroy());
  input.pipe(res);
}
http.createServer((req,res)=>{
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
  let file=resolve(root,'.'+name);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end('Forbidden');}
  try{if(statSync(file).isDirectory())file=resolve(file,'index.html');const st=statSync(file);if(!st.isFile())throw new Error();
    const headers={'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
    const match=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(match){const start=Number(match[1]);const end=match[2]?Math.min(Number(match[2]),st.size-1):st.size-1;if(start>end||start>=st.size){res.writeHead(416,{'Content-Range':`bytes */${st.size}`});return res.end();}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${st.size}`,'Content-Length':end-start+1});if(req.method==='HEAD')return res.end();pipeFile(file,res,{start,end});}
    else{res.writeHead(200,{...headers,'Content-Length':st.size});if(req.method==='HEAD')return res.end();pipeFile(file,res);}
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('未找到文件');}
}).listen(port,host,()=>console.log(`心间漫游 → http://${host}:${port} (root ${root})`));
