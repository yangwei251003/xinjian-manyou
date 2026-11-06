import { W,H,PI,mix,phase,clamp,saved,fill,rect,round,poly,line,ellipse,clip,gradient,grain,rng,arrow,T,withAlpha } from '../drawing.mjs';

const blue = '#12679a', coral = '#ca4f35', ink = '#123044', gold = '#ffcb49';
const floor = new OffscreenCanvas(W,H);
const f = floor.getContext('2d');
fill(f, '#173241');
rect(f, 100, 97, 1400, 655, '#cf945f');
const wood = rng(3307);
for (let row = 0; row < 23; row++) for (let i = -1; i < 7; i++) {
  const x = 101 + i * 236 + (row % 3) * 67;
  clip(f,100,97,1400,655, () => rect(f, x, 98 + row * 29, 234, 27, `hsl(30 52% ${55 + wood() * 16}%)`));
}
rect(f, 155, 213, 251, 419, '#ad6546');
rect(f, 1194, 213, 251, 419, '#ad6546');
round(f, 150, 142, 1300, 565, 0, null, '#fff0c8', 5);
line(f,[[800,142],[800,707]],'#fff0c8',4);
ellipse(f,800,423,91,91,null,'#fff0c8',4);
ellipse(f,401,423,98,98,null,'#fff0c8',4);
ellipse(f,1199,423,98,98,null,'#fff0c8',4);
for (const x of [137,1463]) { line(f,[[x,382],[x,464]],'#254452',10); ellipse(f,x<500?181:1419,423,27,27,null,'#ffe2b7',5); }
grain(f,8,.55);

function player(c,x,y,shirt,a,number) {
  saved(c,()=>{
    c.translate(x,y); c.rotate(a);
    ellipse(c,10,10,42,22,'#593c3860');
    line(c,[[-30,9],[-37,35]],'#f5d3a6',11);
    line(c,[[30,9],[37,35]],'#f5d3a6',11);
    ellipse(c,0,0,35,26,shirt,'#f8f1d3',3);
    ellipse(c,0,-11,16,17,'#f4c19e');
    ellipse(c,0,-17,16,11,'#302d30');
    T(c,number,0,16,18,'#fff7db',{align:'center',weight:850});
  });
}
const initial = [[350,265],[660,540],[1010,299],[524,360],[855,607],[1240,420]];
const passes = [0,1,2,0,2,1,0];
const times = [0,1.1,2.8,4.4,6.4,8.1,10.2];
function position(i,t) {
  const [x,y] = initial[i];
  return [x + Math.sin(t*.64+i*1.57)*64, y + Math.sin(t*.81+i*2.06)*65];
}
function ball(c,x,y,flight=0,color='#e68235') {
  ellipse(c,x+8,y+10,14+flight*4,8,'#51312164');
  ellipse(c,x,y,12+flight*3,12+flight*3,color,'#683d31',2.5);
  line(c,[[x-9,y-5],[x-3,y+2],[x+8,y+6]],'#834731',2);
}
function visitor(c,x,y,s=1) {
  saved(c,()=>{
    c.translate(x,y); c.scale(s,s);
    ellipse(c,10,16,43,29,'#2b27264b');
    line(c,[[0,4],[21,41]],'#403031',6);
    ellipse(c,0,0,39,39,gold,'#6a4d32',3);
    for(let k=0;k<8;k++)line(c,[[0,0],[36*Math.cos(k*PI/4),36*Math.sin(k*PI/4)]],'#ba8527',2);
    ellipse(c,0,0,6,6,'#fcf0ba');
  });
}
function game(c,t) {
  c.drawImage(floor,0,0);
  initial.forEach((_,i)=>{
    const [x,y]=position(i,t);
    player(c,x,y,i<3?blue:coral,Math.sin(t+i)*.9,i%3+1);
  });
  const i = Math.max(0,times.findLastIndex(v=>v<=t));
  const target = position(passes[i],t);
  const source = position(passes[Math.max(0,i-1)],t);
  const p = clamp((t-times[i])/.46);
  ball(c,mix(source[0],target[0],p)+20,mix(source[1],target[1],p)-18-Math.sin(p*PI)*40,Math.sin(p*PI));
  const a = position(3+Math.floor(t/2.4)%3,t), b = position(3+(Math.floor(t/2.4)+1)%3,t);
  const q = clamp((t%2.4)/.5);
  ball(c,mix(a[0],b[0],q)-18,mix(a[1],b[1],q)+23,0,'#fff1d3');
  if(t>4.1&&t<9.1)visitor(c,765+45*Math.sin(t),mix(112,731,(t-4.1)/5),.88);
}
export const shots = {
  tipoff(c,p) {
    game(c,0);
    rect(c,0,0,W,97,ink);
    T(c,'心间漫游 / 观察挑战',91,67,29,'#f7c765',{weight:750});
    T(c,'球场上的第七位',800,404,88,'#fff6d9',{align:'center',weight:900});
    rect(c,505,434,590*phase(p,0,.48),8,gold);
    rect(c,508,471,584,94,ink);
    T(c,'蓝队传球，自己计数',800,531,44,'#fff8e7',{align:'center'});
  },
  passing(c,p,t) {
    game(c,t);
    T(c,'蓝队',140,68,30,'#b9e6fb',{weight:850});
    T(c,'观察中',1440,67,30,'#f7e8be',{align:'right'});
    rect(c,104,765,1392*p,8,gold);
  },
  reveal(c,p) {
    fill(c,'#eed0a2');
    saved(c,()=>{c.translate(165,125); c.scale(.72,.72); c.drawImage(floor,0,0);});
    const travel=phase(p,.04,.72);
    const x=mix(713,747,travel), y=mix(247,593,travel);
    line(c,[[713,234],[x,y]],blue,6,[11,15]);
    visitor(c,x,y,1.38);
    ellipse(c,x,y,79+8*Math.sin(p*PI),80,null,'#fff2c1',4);
    arrow(c,1092,254,x+82,y-27,ink,5);
    T(c,'画面里的另一条路线',1120,250,34,ink,{max:410});
    T(c,'6',1430,571,205,blue,{align:'right',weight:900});
    T(c,'次蓝队传球',1440,623,32,ink,{align:'right'});
  },
  aperture(c,p) {
    c.drawImage(floor,0,0);
    const x = mix(350,1030,phase(p,.08,.8));
    for(let i=0;i<6;i++)player(c,...position(i,p*6),i<3?blue:coral,0,i%3+1);
    visitor(c,808,530,1.04);
    rect(c,0,0,W,H,'#09283bbb');
    saved(c,()=>{
      c.beginPath();c.arc(x,399,207,0,2*PI);c.clip();
      c.drawImage(floor,0,0);
      for(let i=0;i<6;i++)player(c,...position(i,p*6),i<3?blue:coral,0,i%3+1);
      visitor(c,808,530,1.04);
    });
    ellipse(c,x,399,207,207,null,'#fff1a3',5);
    T(c,'注意的聚光灯',99,106,56,'#fff8d9');
  },
  study(c,p) {
    fill(c,'#e7e4ce');
    T(c,'1999',84,414,180,'#b65d42',{weight:900});
    T(c,'传球计数实验',103,486,53,ink);
    T(c,'Simons & Chabris',106,539,31,ink,{weight:540});
    clip(c,674,160,799,547,()=>{
      rect(c,674,160,799,547,'#1a3c48');
      for(let i=0;i<6;i++)player(c,778+i%3*245,320+Math.floor(i/3)*202,i<3?'#e4e2b6':'#497b89',0,i%3+1);
      const x=mix(686,1455,phase(p,.08,.87));
      ellipse(c,x,421,54,74,'#b28049');
      ellipse(c,x,346,29,30,'#b28049');
      line(c,[[x-53,412],[x-86,465]],'#b28049',25);
    });
    T(c,'实验示意 · 人物与画面重新绘制',1473,748,28,ink,{align:'right'});
    grain(c,10,.65);
  },
  transfer(c,p) {
    fill(c,ink);
    saved(c,()=>{c.translate(62,118);c.scale(.76,.76);c.drawImage(floor,0,0);});
    const y=mix(236,668,phase(p,.06,.81));
    arrow(c,667,223,667,y,gold,7);
    visitor(c,667,y,.86);
    T(c,'同一个球场',1280,290,52,'#eaf7eb',{align:'center'});
    T(c,'换一个\n观察任务',1280,406,75,'#ffce53',{align:'center',weight:900,max:460});
    T(c,'选择性注意',1280,650,32,'#d3e8df',{align:'center'});
  },
};
