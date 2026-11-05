/* Direct render. Reviewed narrative precedes choreography. No workstation adapter. */
const WIDTH = 1920;
const HEIGHT = 1080;
const TAU = Math.PI * 2;
const BLUE = '#5eafff';
const GOLD = '#e3bf84';
const TEAL = '#70dfd4';
const INK = '#f3f7ff';
const MUTED = '#a7bbd5';
const BACK = '#080f1d';
const canvas = document.querySelector('#film');
const output = canvas.getContext('2d', {alpha: false});
const sceneA = document.createElement('canvas');
const sceneB = document.createElement('canvas');
for (const surface of [sceneA, sceneB]) {
  surface.width = WIDTH;
  surface.height = HEIGHT;
}
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const mix = (a, b, amount) => a + (b - a) * amount;
const ramp = (time, start, end) => clamp((time - start) / (end - start));
const ease = value => 1 - Math.pow(1 - clamp(value), 3);
const expo = value => value >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(value));
const smooth = value => value < .5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
const hash = seed => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const bezier = (a, b, c, d, t) => {
  const q = 1 - t;
  return [q ** 3 * a[0] + 3 * q * q * t * b[0] + 3 * q * t * t * c[0] + t ** 3 * d[0],
    q ** 3 * a[1] + 3 * q * q * t * b[1] + 3 * q * t * t * c[1] + t ** 3 * d[1]];
};
let episode;

let compositor;
let musicAnalysis;

function line(ctx, x1, y1, x2, y2, color = BLUE, width = 3, progress = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(mix(x1, x2, progress), mix(y1, y2, progress));
  ctx.stroke();
}

function glow(ctx, x, y, radius, color = BLUE, opacity = 1) {
  ctx.save();
  ctx.globalAlpha *= opacity;
  const fill = ctx.createRadialGradient(x, y, 0, x, y, radius);
  fill.addColorStop(0, color + '70');
  fill.addColorStop(.18, color + '25');
  fill.addColorStop(1, color + '00');
  ctx.fillStyle = fill;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function dot(ctx, x, y, radius = 5, color = BLUE) {
  glow(ctx, x, y, radius * 9, color);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

function ring(ctx, x, y, radius, color = BLUE, width = 3, progress = 1, rotation = -Math.PI / 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius), rotation, rotation + TAU * clamp(progress));
  ctx.stroke();
}

function panel(ctx, x, y, width, height, color = BLUE, opacity = 1, radius = 20) {
  ctx.save();
  ctx.globalAlpha *= opacity;
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, '#203751');
  gradient.addColorStop(.55, '#101d32');
  gradient.addColorStop(1, '#0b1426');
  ctx.fillStyle = gradient;
  ctx.strokeStyle = color + 'a0';
  ctx.lineWidth = 2;
  ctx.shadowColor = color + '40';
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.stroke();
  line(ctx, x + radius, y + 2, x + width - radius, y + 2, '#d4e8ff30', 1);
  ctx.restore();
}

function text(ctx, value, x, y, size = 40, color = INK, align = 'center', weight = 500, family = 'FilmSans') {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const resolvedFamily = family === 'Anton' && /[^\x00-\x7f]/.test(String(value)) ? 'FilmSans' : family;
  ctx.font = `${weight} ${size}px ${resolvedFamily}`;
  ctx.fillText(String(value), x, y);
}

function wrap(ctx, value, x, y, width, size = 42, color = INK, maxLines = 4) {
  ctx.font = `500 ${size}px FilmSans`;
  const lines = [];
  let current = '';
  for (const char of String(value)) {
    if (char === '\n' || ctx.measureText(current + char).width > width) {
      lines.push(current);
      current = char === '\n' ? '' : char;
    } else current += char;
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) throw new Error('Text requires another shot: ' + value);
  const top = y - (lines.length - 1) * size * .72;
  lines.forEach((value, index) => text(ctx, value, x, top + index * size * 1.44, size, color));
  return lines.length;
}

function arrow(ctx, from, to, progress, color = BLUE, width = 3) {
  line(ctx, ...from, ...to, color, width, progress);
  if (progress < .15) return;
  const x = mix(from[0], to[0], progress);
  const y = mix(from[1], to[1], progress);
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  line(ctx, x, y, x - 16 * Math.cos(a - .45), y - 16 * Math.sin(a - .45), color, width);
  line(ctx, x, y, x - 16 * Math.cos(a + .45), y - 16 * Math.sin(a + .45), color, width);
}

function tag(ctx, value, x, y, color = BLUE, width = 250) {
  panel(ctx, x - width / 2, y - 31, width, 62, color, 1, 10);
  text(ctx, value, x, y, value.length > 11 ? 25 : 30, color);
}

function node(ctx, value, x, y, radius = 84, color = BLUE, lit = 0) {
  glow(ctx, x, y, radius * 2.7, color, .25 + lit * .65);
  const fill = ctx.createRadialGradient(x - radius * .25, y - radius * .4, 0, x, y, radius);
  fill.addColorStop(0, '#2a4566');
  fill.addColorStop(1, '#0d192a');
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
  ring(ctx, x, y, radius, color + 'b0', 2 + lit * 2);
  wrap(ctx, value, x, y, radius * 1.6, value.length > 5 ? 27 : 34, lit > .5 ? INK : color, 3);
}

function person(ctx, x, y, size = 1, color = BLUE) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ring(ctx, 0, -88, 35, color, 4);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-76, 90);
  ctx.lineTo(-76, 7);
  ctx.bezierCurveTo(-76, -62, 76, -62, 76, 7);
  ctx.lineTo(76, 90);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function book(ctx, x, y, scale = 1, opening = 1, color = BLUE) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const span = 30 + opening * 130;
  ctx.fillStyle = '#142b43';
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -108);
    ctx.quadraticCurveTo(side * span * .55, -140, side * span, -108);
    ctx.lineTo(side * span, 120);
    ctx.quadraticCurveTo(side * span * .5, 86, 0, 120);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 5; i++) line(ctx, side * span * .18, -66 + i * 33, side * span * .82, -60 + i * 33, color + '77', 2);
  }
  line(ctx, 0, -108, 0, 120, GOLD, 3);
  ctx.restore();
}

function clock(ctx, x, y, radius, angle, color = GOLD) {
  ring(ctx, x, y, radius, color, 3);
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU;
    const inner = i % 5 ? .92 : .83;
    line(ctx, x + Math.cos(a) * radius * inner, y + Math.sin(a) * radius * inner,
      x + Math.cos(a) * radius, y + Math.sin(a) * radius, color + (i % 5 ? '55' : 'cc'), i % 5 ? 1 : 3);
  }
  line(ctx, x, y, x + Math.cos(angle) * radius * .72, y + Math.sin(angle) * radius * .72, color, 5);
  line(ctx, x, y, x + radius * .2, y - radius * .4, INK, 5);
  dot(ctx, x, y, 5, color);
}


async function makeCompositor() {
  const surface = document.createElement('canvas');surface.width = WIDTH;surface.height = HEIGHT;
  const gl = surface.getContext('webgl', {alpha: false, preserveDrawingBuffer: true, antialias: false});
  if (!gl) throw new Error('WebGL transition compositor unavailable');
  const vertex = 'attribute vec2 position; varying vec2 uv; void main(){uv=(position+1.0)*0.5;gl_Position=vec4(position,0.,1.);}';
  const header = 'precision highp float; varying vec2 uv; uniform sampler2D fromTex; uniform sampler2D toTex; uniform float progress; vec4 getFromColor(vec2 p){return texture2D(fromTex,vec2(p.x,1.-p.y));} vec4 getToColor(vec2 p){return texture2D(toTex,vec2(p.x,1.-p.y));}';
  const programs = {};
  function compile(type, source) {
    const shader = gl.createShader(type);gl.shaderSource(shader, source);gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  for (const name of ['DirectionalWipe', 'CircleOpen', 'Doorway', 'CrossZoom']) {
    const code = await (await fetch('reference/gl/' + name + '.glsl')).text();
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, header + '\n' + code + '\nvoid main(){gl_FragColor=transition(uv);}'));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    programs[name] = program;
  }
  const buffer = gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const textures = [gl.createTexture(), gl.createTexture()];
  textures.forEach(texture => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  });
  return function transition(from, to, name, progress) {
    const program = programs[name];gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'position');gl.bindBuffer(gl.ARRAY_BUFFER, buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    [from, to].forEach((source, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);gl.bindTexture(gl.TEXTURE_2D, textures[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    });
    gl.uniform1i(gl.getUniformLocation(program, 'fromTex'), 0);gl.uniform1i(gl.getUniformLocation(program, 'toTex'), 1);
    gl.uniform1f(gl.getUniformLocation(program, 'progress'), progress);
    gl.uniform2f(gl.getUniformLocation(program, 'direction'), 1, -1);
    gl.uniform1f(gl.getUniformLocation(program, 'smoothness'), .18);
    gl.uniform1i(gl.getUniformLocation(program, 'opening'), 1);
    gl.uniform1f(gl.getUniformLocation(program, 'reflection'), .22);
    gl.uniform1f(gl.getUniformLocation(program, 'perspective'), .45);
    gl.uniform1f(gl.getUniformLocation(program, 'depth'), 2.4);
    gl.uniform1f(gl.getUniformLocation(program, 'strength'), .15);
    gl.viewport(0, 0, WIDTH, HEIGHT);gl.drawArrays(gl.TRIANGLES, 0, 6);
    return surface;
  };
}

function backplate(ctx,time){
 const bg=ctx.createRadialGradient(950,420,40,950,500,1200);bg.addColorStop(0,'#0e1d34');bg.addColorStop(1,BACK);ctx.fillStyle=bg;ctx.fillRect(0,0,WIDTH,HEIGHT);
 ctx.strokeStyle='#26436225';ctx.lineWidth=1;
 for(let x=50;x<WIDTH;x+=130){ctx.beginPath();ctx.moveTo(x,170);ctx.lineTo(x,830);ctx.stroke();}
 for(let y=180;y<840;y+=130){ctx.beginPath();ctx.moveTo(100,y);ctx.lineTo(1820,y);ctx.stroke();}
 for(let j=0;j<76;j++){const x=(hash(j)*2100+time*(1+hash(j+7)*2))%2100-90;const y=(hash(j+80)*1220-time*(2+hash(j+30)*3)+2000)%1220-70;ctx.fillStyle=j%5?'#8bc3ff45':'#e3bf8455';ctx.beginPath();ctx.arc(x,y,1+hash(j+60)*1.2,0,TAU);ctx.fill();}
}
function englishLines(ctx,value,y,size=26){
 ctx.font=`400 ${size}px FilmSans`;const words=value.split(' '),lines=[];let current='';
 for(const word of words){if(ctx.measureText(current+' '+word).width>1660){lines.push(current);current=word;}else current+=(current?' ':'')+word;}if(current)lines.push(current);
 if(lines.length>2)throw Error('English overflow: '+value);
 lines.forEach((v,i)=>text(ctx,v,960,y+(i-(lines.length-1)/2)*34,size,GOLD));
}
function drawNarrative(surface,cue,time){
 const ctx=surface.getContext('2d',{alpha:false});const elapsed=Math.max(0,time-cue.start),p=clamp(elapsed/(cue.end-cue.start));
 backplate(ctx,time);
 ctx.save();enter(ctx,p);
 if(cue.index===0){
  const u=expo(clamp(elapsed/1.05));ctx.globalAlpha=u;
  ring(ctx,960,460,300,BLUE+'45',2,clamp(p*1.3));ring(ctx,960,460,330,GOLD+'35',2,p,-Math.PI*.8);
  wrap(ctx,cue.zh,960,425,1600,68,INK,3);line(ctx,480,600,1440,600,BLUE,3,u);
  englishLines(ctx,cue.en,674,29);episode.relatedLessons.forEach((v,i)=>capsule(ctx,v.title,960+(i-(episode.relatedLessons.length-1)/2)*465,770,420,i%2?GOLD:BLUE));
 }else filmDiagram(ctx,cue,p,time);
 ctx.restore();
 if(cue.index!==0){
  const g=ctx.createLinearGradient(0,820,0,1080);g.addColorStop(0,'#080f1d00');g.addColorStop(.2,'#080f1df2');g.addColorStop(1,BACK);ctx.fillStyle=g;ctx.fillRect(0,815,1920,265);
  ctx.save();ctx.globalAlpha=Math.min(ease(clamp(elapsed/.25)),ease(clamp((cue.end-time)/.18)));
  wrap(ctx,cue.zh,960,893,1700,49,INK,2);englishLines(ctx,cue.en,978,25);ctx.restore();
 }
 text(ctx,'心间漫游  /  '+episode.english,100,64,25,MUTED,'left');
 text(ctx,episode.title,100,132,36,INK,'left');
 text(ctx,String(cue.index+1).padStart(2,'0')+' / '+episode.cues.length,1820,64,25,GOLD,'right',400,'Anton');
 text(ctx,'图形为教学示意 · 完整出处与证据边界见课程',100,1044,22,MUTED,'left');
 text(ctx,'独立视频叙事',1820,1044,22,MUTED,'right');
 line(ctx,100,1016,1820,1016,BLUE+'35',2);line(ctx,100,1016,1820,1016,GOLD,2,time/episode.duration);
 if(time>episode.duration-.55){ctx.fillStyle=BACK;ctx.globalAlpha=ramp(time,episode.duration-.55,episode.duration);ctx.fillRect(0,0,WIDTH,HEIGHT);ctx.globalAlpha=1;}
}
window.render=function(time){
 time=clamp(time,0,episode.duration-.001);let index=episode.cues.findIndex(s=>s.start<=time&&time<s.end);if(index<0)index=episode.cues.length-1;
 let boundary=-1;if(index>0&&time<episode.cues[index].start+.18)boundary=index;
 else if(index<episode.cues.length-1&&time>episode.cues[index].end-.18)boundary=index+1;
 if(boundary>=0){const b=episode.cues[boundary].start;drawNarrative(sceneA,episode.cues[boundary-1],time);drawNarrative(sceneB,episode.cues[boundary],time);output.drawImage(compositor(sceneA,sceneB,episode.cues[boundary].transition,smooth(ramp(time,b-.18,b+.18))),0,0);}
 else {drawNarrative(sceneA,episode.cues[index],time);output.drawImage(sceneA,0,0);}
 return {cue:index,scene:episode.cues[index].scene,zh:episode.cues[index].zh};
};
window.ready=(async()=>{
 const id=new URLSearchParams(location.search).get('id')||'communication-gap';
 const films=await(await fetch('episodes.json')).json();episode=films.find(f=>f.id===id);if(!episode)throw Error('Unknown film '+id);
 await Promise.all([document.fonts.load('500 49px FilmSans'),document.fonts.load('700 68px FilmSans'),document.fonts.load('400 100px Anton')]);
 compositor=await makeCompositor();window.episode=episode;window.render(0);
 return {width:WIDTH,height:HEIGHT,duration:episode.duration,cues:episode.cues.length};
})();
