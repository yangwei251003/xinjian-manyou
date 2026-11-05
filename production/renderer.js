/* Original, frame-driven teaching graphics for 心间漫游. No external footage. */
const W=1920,H=1080;
const BLUE='#4a9eff',GOLD='#c9a96e',WHITE='#eef5ff',MUTED='#92a6c8',TEAL='#73d4d0';
const canvas=document.querySelector('#picture');
const ctx=canvas.getContext('2d',{alpha:false});
const spec=JSON.parse(document.querySelector('#film-data').textContent);
const artImage=new Image();artImage.src=spec.artData;
const artReady=artImage.decode();
const clamp=x=>Math.min(1,Math.max(0,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
const lerp=(a,b,p)=>a+(b-a)*p;
function seeded(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
const random=seeded(spec.seed);
const particles=Array.from({length:64},()=>({x:random()*W,y:random()*H,r:.6+random()*1.2,s:3+random()*5,a:.15+random()*.35}));
const background=document.createElement('canvas');background.width=W;background.height=H;
const bg=background.getContext('2d');
const gradient=bg.createRadialGradient(990,440,70,960,540,1080);
gradient.addColorStop(0,'#101b35');gradient.addColorStop(.52,'#0d1427');gradient.addColorStop(1,'#0a0e1a');
bg.fillStyle=gradient;bg.fillRect(0,0,W,H);
bg.strokeStyle='#7b9dcb0b';bg.lineWidth=1;
for(let x=0;x<W;x+=80){bg.beginPath();bg.moveTo(x,0);bg.lineTo(x,H);bg.stroke();}
for(let y=0;y<H;y+=80){bg.beginPath();bg.moveTo(0,y);bg.lineTo(W,y);bg.stroke();}
const cues=[...document.querySelectorAll('.cue-zh')];
const english=[...document.querySelectorAll('.cue-en')];
const headings=[...document.querySelectorAll('.scene-heading')];
const source=document.querySelector('#source');
const title=document.querySelector('#title');
const stamp=document.querySelector('#stamp');

function stroke(color=BLUE,width=2.3){
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.shadowColor=color;ctx.shadowBlur=5;
}
function line(x1,y1,x2,y2,p=1,color=BLUE,width=2.3){
  stroke(color,width);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(lerp(x1,x2,p),lerp(y1,y2,p));ctx.stroke();
}
function circle(x,y,r,color=BLUE,fill='#0c1830'){
  ctx.fillStyle=fill;stroke(color);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
}
function rect(x,y,w,h,color=BLUE,fill='#0d1a30',r=18){
  ctx.fillStyle=fill;stroke(color);ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();ctx.stroke();
}
function text(value,x,y,size=30,color=WHITE,align='center'){
  ctx.shadowBlur=0;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.font='500 '+size+'px FilmSans';ctx.fillText(value,x,y);
}
function arrow(x1,y1,x2,y2,p=1,color=BLUE){
  const x=lerp(x1,x2,p),y=lerp(y1,y2,p),angle=Math.atan2(y2-y1,x2-x1);
  line(x1,y1,x,y,1,color);
  if(p>.05){line(x,y,x-13*Math.cos(angle-.45),y-13*Math.sin(angle-.45),1,color);line(x,y,x-13*Math.cos(angle+.45),y-13*Math.sin(angle+.45),1,color);}
}
function glowDot(x,y,r=5,color=BLUE){
  const g=ctx.createRadialGradient(x,y,0,x,y,r*5);
  g.addColorStop(0,color+'b0');g.addColorStop(1,color+'00');ctx.fillStyle=g;
  ctx.beginPath();ctx.arc(x,y,r*5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
}
function node(x,y,label,color=BLUE,r=50){circle(x,y,r,color);if(label)text(label,x,y,26,color);}
function person(x,y,s=1,color=BLUE){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  circle(0,-53,25,color);stroke(color,2.4);ctx.beginPath();ctx.arc(0,14,55,Math.PI,0);ctx.lineTo(55,57);ctx.lineTo(-55,57);ctx.closePath();ctx.stroke();ctx.restore();
}
function book(x,y,s=1,open=false){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  if(open){ctx.fillStyle='#132540';ctx.beginPath();ctx.moveTo(0,-65);ctx.quadraticCurveTo(-55,-94,-120,-63);ctx.lineTo(-120,70);ctx.quadraticCurveTo(-60,41,0,72);ctx.quadraticCurveTo(60,41,120,70);ctx.lineTo(120,-63);ctx.quadraticCurveTo(55,-94,0,-65);ctx.fill();stroke(BLUE);ctx.stroke();line(0,-65,0,72);for(let i=0;i<4;i++){line(-97,-40+i*23,-27,-47+i*23,1,MUTED,1.3);line(27,-47+i*23,97,-40+i*23,1,MUTED,1.3);}}
  else{rect(-86,-105,172,210);line(-59,-105,-59,105);line(-35,-50,55,-50,1,GOLD);line(-35,-24,36,-24,1,MUTED);}
  ctx.restore();
}
function phone(x,y,label=''){
  rect(x-80,y-144,160,288);line(x-25,y-127,x+25,y-127,1,MUTED);
  rect(x-58,y-60,116,78,GOLD,'#15253d',12);text(label||'…',x,y-20,27,GOLD);
  for(let i=0;i<3;i++)glowDot(x-18+i*18,y+90,2.4,MUTED);
}
function clock(x,y,r,hand,color=GOLD){
  circle(x,y,r,color);for(let i=0;i<12;i++){const a=i*Math.PI/6;line(x+Math.sin(a)*r*.83,y-Math.cos(a)*r*.83,x+Math.sin(a)*r*.92,y-Math.cos(a)*r*.92,1,color,1.5);}
  line(x,y,x+Math.sin(hand)*r*.66,y-Math.cos(hand)*r*.66,1,color,4);
  line(x,y,x-r*.33,y-r*.17,1,color,4);glowDot(x,y,4,color);
}
function pulsePath(points,t,color=BLUE,progress=1){
  for(let i=0;i<points.length-1;i++)line(...points[i],...points[i+1],clamp(progress*(points.length-1)-i),color);
  const f=((t*.34)%1)*(points.length-1),i=Math.floor(f),p=f-i;
  if(points[i+1])glowDot(lerp(points[i][0],points[i+1][0],p),lerp(points[i][1],points[i+1][1],p),4,color);
}
function callout(x,y,label,color=GOLD,w=205){rect(x-w/2,y-24,w,48,color,'#11213b',9);text(label,x,y,24,color);}
function paper(x,y,label,color=BLUE){rect(x-70,y-78,140,156,color);text(label,x,y,30,color);}
function cloud(x,y,s=1,color=BLUE){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);stroke(color);
  ctx.beginPath();ctx.moveTo(-90,35);ctx.bezierCurveTo(-140,20,-115,-44,-70,-34);ctx.bezierCurveTo(-62,-108,42,-115,57,-47);ctx.bezierCurveTo(135,-73,150,40,85,43);ctx.closePath();ctx.stroke();ctx.restore();
}
function graphAxes(){arrow(-360,150,370,150,1,MUTED);arrow(-360,150,-360,-175,1,MUTED);}
function bars(values,t,colors=[BLUE,GOLD]){
  graphAxes();values.forEach((v,i)=>{const h=v*ease(t);rect(-245+i*220,150-h,120,h+1,colors[i%colors.length],'#142845',4);});
}
function matrix(n,cols,x,y,gap,t,colorFn){
  const alpha=ctx.globalAlpha;
  for(let i=0;i<n;i++){const xx=x+(i%cols)*gap,yy=y+Math.floor(i/cols)*gap;ctx.globalAlpha=alpha*clamp(t*2-i/n);circle(xx,yy,7,colorFn(i),colorFn(i)+'45');}
  ctx.globalAlpha=alpha;
}
function route(t,phase=0){
  const pts=[[-330,105],[-170,-100],[0,70],[185,-100],[340,70]];
  pulsePath(pts,t,phase>2?GOLD:BLUE);
  pts.forEach((p,i)=>{circle(...p,14,i<phase+1?GOLD:BLUE);});
}
function fieldIcons(t,search){
  const types=['○','△','□'];for(let i=0;i<24;i++){const x=-350+(i%8)*100,y=-110+Math.floor(i/8)*110;const target=i%3===search;
    text(types[i%3],x,y+Math.sin(t+i)*3,60,target?GOLD:MUTED);}
}
function splitLabel(left,right){text(left,-245,205,27,BLUE);text(right,245,205,27,GOLD);}

const visuals={
 attention({t,p,phase}){
   fieldIcons(t,phase>3?1:0);
   const x=phase<3?-300+Math.sin(t*.4)*220:180+Math.sin(t*.38)*120;
   const beam=ctx.createRadialGradient(x,0,20,x,0,180);beam.addColorStop(0,'#4a9eff30');beam.addColorStop(1,'#4a9eff00');
   ctx.fillStyle=beam;ctx.fillRect(-550,-300,1100,600);stroke(BLUE+'99',1.5);ctx.beginPath();ctx.ellipse(x,0,172,208,0,0,Math.PI*2);ctx.stroke();
   if(phase>=2){const a=ease(p);ctx.save();ctx.globalAlpha=a;node(365,-25,'？',GOLD,44);ctx.restore();}
   callout(0,280,phase<3?'目标选择信息':phase<5?'任务不同，看到的不同':'再观察一次',GOLD,300);
 },
 attribution({t,p,phase}){
   person(-355,65,1.2);phone(-100,0,'未回复');
   arrow(0,0,165,-105,ease(p),BLUE);arrow(0,0,165,105,ease(p),GOLD);
   callout(320,-105,phase>2?'个人倾向？':'他不在乎？',BLUE,220);
   callout(320,105,phase>1?'手机不在身边？':'还缺少背景',GOLD,260);
   if(phase>=3){line(120,-190,120,195,1,MUTED,1);text('观察',-100,205,28,BLUE);text('候选解释',320,205,28,GOLD);}
   pulsePath([[-290,20],[-200,20]],t);if(phase>3)callout(0,285,'补信息，再谈下一次',TEAL,360);
 },
 retrieval({t,p,phase}){
   book(-270,0,1.15,phase<2);book(265,0,1.15,phase<3);
   arrow(-125,-10,110,-10,ease(p),GOLD);const points=[[-270,-190],[-80,-240],[100,-230],[265,-190]];pulsePath(points,t,GOLD,ease(p));
   splitLabel('重复阅读','主动提取');
   if(phase===3){callout(-250,-225,'5 分钟：再读较好',BLUE,300);callout(250,-225,'2 天 / 1 周：提取较好',GOLD,370);}
   else if(phase>=4){callout(0,-230,'提取 → 核对反馈',GOLD,350);}
   else for(let i=0;i<5;i++){const u=(t*.2+i*.19)%1;glowDot(lerp(-100,100,u),-12+Math.sin(u*Math.PI)*50,3+i%2);}
 },
 robot({t,p,phase}){
   person(-400,45,1.2);person(400,45,1.2,GOLD);
   rect(-115,-90,230,170,BLUE,'#142640',24);circle(-63,92,23);circle(63,92,23);circle(-42,-30,8,GOLD);text('△',42,-30,35,BLUE);
   pulsePath([[-345,-80],[-220,-150],[-110,-150]],t,BLUE,ease(p));pulsePath([[110,-150],[220,-150],[345,-80]],t,GOLD,ease(p));
   if(phase<3){callout(-380,-175,'已有地图',BLUE,190);callout(380,-175,'只见按钮',GOLD,190);}
   else{callout(-380,-175,'按三角',BLUE,170);callout(380,-175,'等黄灯',GOLD,170);glowDot(0,-61,8,GOLD);}
   const end=phase>3?ease(p):.35;line(-210,205,210,205,end,GOLD,3);text('把省略的步骤说出来',0,275,28,GOLD);
 },
 memory({t,p,phase}){
   for(let i=0;i<9;i++){const x=(i%3-1)*122,y=(Math.floor(i/3)-1)*104;const offset=phase<2?(1-ease(p))*120:Math.sin(t*.45+i)*5;rect(x-49+offset,y-39,98,78,i===4?GOLD:BLUE,'#152440',8);}
   if(phase>=2){arrow(300,-165,145,-65,ease(p),GOLD);paper(390,-180,'后来信息',GOLD);}
   if(phase>=3){callout(0,240,'确信 ≠ 准确保证',GOLD,330);circle(0,0,185,BLUE+'80');}
   else callout(0,240,'经历 + 后续信息 + 推断',GOLD,420);
   glowDot(Math.cos(t*.4)*170,Math.sin(t*.4)*170,5,BLUE);
 },
 calibration({t,p,phase}){
   graphAxes();text('实际尝试 →',270,195,26,MUTED);
   for(let i=0;i<5;i++){const x=-250+i*120,y=90-i*50;circle(x,y,14,BLUE);line(x,150,x,y,ease(p),BLUE+'88',1);}
   stroke(GOLD,3);ctx.beginPath();ctx.arc(20,-40,145,-Math.PI*.85,-Math.PI*.85+ease(p)*Math.PI*1.65);ctx.stroke();
   if(phase>=3){callout(0,-240,'预期与表现对照',GOLD,320);callout(0,265,'具体缺口 → 下一次练习',BLUE,430);}
   else{callout(-190,-210,'感觉熟悉',BLUE,190);callout(240,-200,'实际解释',GOLD,190);}
   glowDot(-250+((t*.1)%1)*480,90-((t*.1)%1)*200,5,GOLD);
 },
 sleep({t,p,phase}){
   circle(-285,-35,110,GOLD,'#e9c78f20');circle(-245,-64,95,'#0e172c','#0e172c');clock(270,-30,100,t*.2);
   const pts=[[-180,130],[-50,90],[70,130],[180,90],[280,130]];pulsePath(pts,t,BLUE,ease(p));
   for(let i=0;i<7;i++)glowDot(-150+i*50,-140+Math.sin(t*.6+i)*22,2,GOLD);
   callout(0,250,phase<3?'学习与睡眠相互配合':'先学习，再给休息留时间',GOLD,450);
 },
 load({t,p,phase}){
   const tilt=phase<3?Math.sin(t*.5)*.03:0;ctx.save();ctx.rotate(tilt);
   person(0,100,1.45);for(let i=0;i<3;i++){rect(-240+i*160,-220,135,80,i===2?GOLD:BLUE);text(['任务','时间','资源'][i],-173+i*160,-180,27);}
   line(-170,-140,0,-35,ease(p));line(150,-140,0,-35,ease(p),GOLD);ctx.restore();
   if(phase>2){arrow(-60,110,-335,110,ease(p),TEAL);arrow(60,110,335,110,ease(p),GOLD);callout(-365,200,'分工',TEAL,150);callout(365,200,'支持',GOLD,150);}
   callout(0,290,phase<3?'把负荷拆成可讨论的事':'改变条件，也是应对',GOLD,430);
 },
 network({t,p,phase}){
   const points=Array.from({length:11},(_,i)=>[Math.cos(i*2.399)*Math.sqrt(i+1)*90,Math.sin(i*2.399)*Math.sqrt(i+1)*68]);
   for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)if((i+j)%3===0)line(...points[i],...points[j],ease(p),BLUE+'55',1.4);
   points.forEach((pt,i)=>{circle(...pt,15+(i%3)*5,i===phase?GOLD:BLUE);if((i+phase)%4===0)glowDot(...pt,5,GOLD);});
   pulsePath(points.slice(0,6),t,GOLD,ease(p));
   callout(0,280,phase>2?'任务 + 比较 + 更多证据':'网络示意，不是医学影像',GOLD,430);
 },
 weather({t,p,phase}){
   cloud(-285,-80,1.1);circle(285,-85,67,GOLD);
   for(let i=0;i<12;i++){const a=i*Math.PI/6;line(285+Math.cos(a)*90,-85+Math.sin(a)*90,285+Math.cos(a)*110,-85+Math.sin(a)*110,1,GOLD);}
   for(let i=0;i<6;i++){const y=-25+((t*55+i*31)%150);line(-355+i*30,y,-366+i*30,y+25,1,BLUE+'b0');}
   node(0,80,'心跳',TEAL,65);arrow(-210,-40,-60,60,ease(p));arrow(210,-40,60,60,ease(p),GOLD);
   callout(0,250,phase>2?'身体 · 情境 · 解释':'同一信号，多种可能',GOLD,390);
 },
 reframe({t,p,phase}){
   rect(-370,-185,740,360,BLUE,'#0d172b',8);cloud(-150,-55,1.1);
   for(let i=0;i<6;i++){const y=15+(t*45+i*24)%95;line(-225+i*27,y,-231+i*27,y+20,1,BLUE+'90');}
   line(0,-185,0,175,1,GOLD,2);rect(65,-65,210,135,GOLD,'#142437',4);text('展览',170,2,42,GOLD);
   if(phase>=2){arrow(15,-120,145,-120,ease(p),GOLD);callout(0,260,'事实不变，比较行动',GOLD,380);}
   else callout(0,260,'一场雨，还剩哪些可能？',GOLD,390);
 },
 habit({t,p,phase}){
   const pts=[[-360,70],[-180,70],[-60,-90],[130,-90],[330,70]];
   pulsePath(pts,t,BLUE,ease(p));pts.forEach((pt,i)=>node(...pt,['线索','','动作','','情境'][i],i===2?GOLD:BLUE,39));
   if(phase>2){line(-180,70,130,-90,ease(p),GOLD,4);callout(0,-235,'减少开始前的准备',GOLD,360);}
   for(let i=0;i<4;i++){const u=(t*.12+i*.25)%1;glowDot(-350+u*680,160+Math.sin(u*Math.PI)*10,3,TEAL);}
   callout(0,275,phase>3?'从一个小动作开始':'没有统一的养成倒计时',GOLD,400);
 },
 trait({t,p,phase}){
   const names=['社交活跃','条理','探索','合作','情绪体验'];
   names.forEach((name,i)=>{const y=-185+i*83;line(-185,y,345,y,1,BLUE+'66',5);text(name,-230,y,26,MUTED,'right');const value=.25+(.5+.5*Math.sin(t*.2+i))*.5;glowDot(-185+value*530,y,8,i===phase%5?GOLD:BLUE);});
   text('虚构角色的特质示意，无测量分数',0,285,25,GOLD);
 },
 comparison({t,p,phase}){
   rect(-390,-195,260,360,BLUE,'#11203a',22);rect(130,-195,260,360,GOLD,'#162238',22);
   for(let i=0;i<4;i++){const h=40+i*29;rect(-350+i*40,115-h,25,h,BLUE,'#19375c',2);}
   for(let i=0;i<4;i++){const h=40+(3-i)*29;rect(170+i*40,115-h,25,h,GOLD,'#493f32',2);}
   text('自己看见的过程',-260,225,27,BLUE);text('别人展示的结果',260,225,27,GOLD);
   pulsePath([[-110,-60],[0,-115],[110,-60]],t,TEAL,ease(p));
   if(phase>2)callout(0,-245,'比较的维度，也可以改变',GOLD,430);
 },
 harbor({t,p,phase}){
   line(-400,130,400,130,1,BLUE+'60');rect(-340,-90,100,220,BLUE);stroke(GOLD);ctx.beginPath();ctx.moveTo(-360,-90);ctx.lineTo(-290,-155);ctx.lineTo(-220,-90);ctx.stroke();
   const x=lerp(-130,310,.5+.5*Math.sin(t*.12));paper(x,15,'探索',GOLD);pulsePath([[-240,-60],[-90,-140],[120,-125],[x,-65]],t,GOLD,ease(p));
   text('可找到的支持',-290,215,28,BLUE);text('向外探索',220,215,28,GOLD);
   if(phase>=3)callout(0,290,'靠近与远行，可以同在',TEAL,400);
 },
 crowd({t,p,phase}){
   for(let i=0;i<5;i++)person(-360+i*180,80,.9,i===4?GOLD:BLUE);
   const lengths=[94,170,94];for(let i=0;i<3;i++){const x=-205+i*205;line(x,-210,x,-210+lengths[i],ease(p),i===1?GOLD:BLUE,5);text(['A','B','C'][i],x,-250,27);}
   if(phase>2){callout(0,245,'先独立判断，再共同讨论',GOLD,450);}
   else{callout(0,245,'信息影响 / 合群压力',GOLD,390);}
   glowDot(Math.sin(t*.45)*390,155,4,GOLD);
 },
 listening({t,p,phase}){
   person(-300,80,1.3);person(300,80,1.3,GOLD);
   rect(-145,-155,290,130,BLUE,'#11223b',30);text(phase<2?'我很失落':'你想说说吗？',0,-90,35,phase<2?WHITE:GOLD);
   for(let i=0;i<5;i++){const h=14+Math.sin(t*2+i)*9;line(-70+i*35,80-h,-70+i*35,80+h,1,i%2?GOLD:BLUE,4);}
   if(phase>2)callout(0,265,'倾听 → 核对 → 询问需要',TEAL,440);
   else{pulsePath([[-240,-10],[-130,-30]],t);pulsePath([[130,-30],[240,-10]],t,GOLD);}
 },
 framing({t,p,phase}){
   matrix(100,10,-150,-160,32,ease(p),i=>i<90?BLUE:GOLD);
   text(phase<3?'90 / 100 得到':'10 / 100 未得到',0,220,38,phase<3?BLUE:GOLD);
   callout(-390,0,'90',BLUE,130);callout(390,0,'10',GOLD,130);
   if(phase>2){arrow(-300,260,300,260,1,GOLD);text('同一分母 · 同一规则',0,315,25,GOLD);}
   const i=Math.floor(t*.8)%100;glowDot(-150+(i%10)*32,-160+Math.floor(i/10)*32,4,i<90?BLUE:GOLD);
 },
 investment({t,p,phase}){
   arrow(-440,75,440,75,1,MUTED);line(-35,-185,-35,190,1,GOLD);
   text('已无法收回',-270,150,28,MUTED);text('仍能选择',230,150,28,GOLD);
   for(let i=0;i<5;i++)rect(-410+i*68,10-i*22,48,65+i*22,BLUE+'90','#12223b',2);
   arrow(25,35,300,-145,ease(p),GOLD);arrow(25,100,300,180,ease(p),TEAL);
   clock(-265,-165,62,t*.2,BLUE);callout(285,-190,'继续',GOLD,130);callout(285,235,'改变',TEAL,130);
 },
 care({t,p,phase}){
   person(-360,30,1.25);node(0,-100,'成人',GOLD,70);node(330,70,'专业支持',TEAL,82);
   pulsePath([[-285,-20],[-170,-110],[-80,-110]],t,GOLD,ease(p));pulsePath([[75,-90],[170,-35],[255,32]],t,TEAL,ease(p));
   callout(-300,210,'发生什么？',BLUE,200);callout(40,230,'影响了什么？',GOLD,230);
   if(phase>2)callout(0,-240,'可以询问，也可以说明顾虑',GOLD,470);
 },
 boundary({t,p,phase}){
   rect(-105,-180,210,360,BLUE,'#0e192d',5);line(-10,-180,-10,180,1,GOLD,3);glowDot(63,20,6,GOLD);
   person(-335,70,1.2);person(335,70,1.2,GOLD);
   callout(-340,-160,'能做的',BLUE,185);callout(340,-160,'做不到的',GOLD,185);
   if(phase>2){arrow(-230,155,230,155,ease(p),TEAL);callout(0,270,'明确限度，讨论可行安排',TEAL,450);}
   else text('清楚而尊重',0,260,30,GOLD);
 },
 support({t,p,phase}){
   const pts=[[-320,0],[-145,-175],[155,-175],[330,0],[140,165],[-150,165]];
   const center=[0,0];
   for(let i=0;i<pts.length;i++){pulsePath([pts[i],center],t+i*.7,i%2?BLUE:GOLD,ease(p));person(...pts[i],.6,i%2?BLUE:GOLD);}
   node(0,0,'支持',TEAL,55);callout(0,285,'倾听 · 实际帮助 · 合适转介',GOLD,480);
 },
 causal({t,p,phase}){
   node(-300,60,'冰淇淋',BLUE,88);node(300,60,'树荫',GOLD,88);
   if(phase<2){arrow(-205,60,205,60,ease(p),MUTED);text('？',0,10,52,GOLD);}
   else{node(0,-165,'天气？',TEAL,70);arrow(-65,-120,-230,0,ease(p),TEAL);arrow(65,-120,230,0,ease(p),TEAL);line(-200,100,200,100,1,MUTED+'66',1);}
   if(phase>2)callout(0,285,'候选原因，还需要证据',GOLD,420);
   else callout(0,285,'共同变化，先留下问号',GOLD,420);
   glowDot(Math.sin(t*.3)*160,62,5,BLUE);
 },
 sample({t,p,phase}){
   for(let i=0;i<40;i++){const x=-380+(i%10)*82,y=-150+Math.floor(i/10)*89;circle(x,y,12,i<20?BLUE:TEAL);}
   const x=phase<3?-390:-205,wide=phase<3?390:660;stroke(GOLD,3);ctx.setLineDash([9,9]);ctx.lineDashOffset=-t*16;ctx.strokeRect(x,-195,wide,370);ctx.setLineDash([]);
   callout(0,255,phase<3?'先问：谁有机会被选中？':'再问：谁没有回应？',GOLD,480);
   if(phase>2)text('覆盖更广 ≠ 自动代表总体',0,-255,28,GOLD);
 },
 replication({t,p,phase}){
   const pts=[[-360,100],[-180,-40],[0,100],[180,-40],[360,100]];
   pulsePath(pts,t,BLUE,ease(p));
   pts.forEach((pt,i)=>{rect(pt[0]-52,pt[1]-76,104,152,i===phase%5?GOLD:BLUE);text(String(i+1),pt[0],pt[1],36,i===phase%5?GOLD:BLUE);});
   callout(0,-200,'方法 · 记录 · 条件 · 比较',GOLD,460);
   text(phase>2?'单次差异，需要继续解释':'持续检验，逐渐累积',0,285,30,GOLD);
 },
 rule({t,p,phase}){
   const a=phase<3?['2','4','6']:['3','5','7'];
   a.forEach((v,i)=>paper(-225+i*225,-35,v,i===phase%3?GOLD:BLUE));
   const labels=phase<3?['都是偶数','依次增大']:['偶数规则：不通过','递增规则：通过'];
   callout(-250,205,labels[0],BLUE,350);callout(250,205,labels[1],GOLD,350);
   arrow(-150,80,-250,160,ease(p));arrow(150,80,250,160,ease(p),GOLD);
   if(phase>2)text('选择让两种预测不同的例子',0,-245,30,GOLD);
   glowDot(-225+((t*.14)%1)*450,-140,4,GOLD);
 },
 ruler({t,p,phase}){
   clock(-280,-10,108,t*.3,BLUE);
   ctx.save();ctx.translate(270,-5);ctx.rotate(Math.sin(t*.2)*.06);
   rect(-150,-45,300,90,GOLD,'#3b322522',8);for(let i=0;i<16;i++)line(-140+i*18,-45,-140+i*18,i%5===0?0:-20,1,GOLD,1.4);ctx.restore();
   splitLabel('用时','距离');arrow(-135,-90,120,-90,ease(p),MUTED);text('？',0,-140,46,GOLD);
   callout(0,280,phase<3?'稳定的读数，回答什么问题？':'解释与用途，都需要证据',GOLD,480);
 },
 journal({t,p,phase}){
   book(0,0,2.2,true);cloud(-150,-45,.44,BLUE);
   const rain=(t*25)%65;for(let i=0;i<4;i++)line(-195+i*22,20+rain,-200+i*22,35+rain,1,BLUE);
   stroke(GOLD,3);ctx.beginPath();ctx.arc(150,-25,65,Math.PI,Math.PI*2);ctx.lineTo(85,-25);ctx.stroke();line(150,-25,150,80,1,GOLD,3);ctx.beginPath();ctx.arc(135,80,15,0,Math.PI);ctx.stroke();
   callout(0,280,phase>2?'困难与支持，可以在同一页':'如实记录，不必强行开心',GOLD,470);
 }
};


function drawAnchor(t,p){
  rect(-470,-195,500,390,BLUE,'#12213a',12);
  text('研究资料',-220,-135,27,MUTED);
  text(spec.anchor.year,-220,-35,68,GOLD);
  const authorSize=Math.max(23,Math.min(28,430/(spec.anchor.author.length*.65)));
  text(spec.anchor.author,-220,70,authorSize,WHITE);
  line(-420,123,-20,123,ease(p),BLUE+'aa',1.5);
  text('原始语境 · 对象 · 条件',-220,160,23,MUTED);
  const labels=['问题','比较','边界'];
  const notes=['先问研究或资料谈什么','再看怎样获得证据','最后看结论适用到哪里'];
  for(let i=0;i<3;i++){
    const y=-130+i*130;
    node(160,y,labels[i],i===Math.floor(t/(240/spec.bpm))%3?GOLD:BLUE,45);
    text(notes[i],235,y,25,i===2?GOLD:WHITE,'left');
    if(i<2)arrow(160,y+52,160,y+78,clamp(p*2-i*.3),BLUE);
  }
}
function drawLife(t,p){
  ctx.save();ctx.translate(-320,0);ctx.scale(.62,.62);
  visuals[spec.motif]({t,phase:4,p,elapsed:t-spec.stages[4].start});ctx.restore();
  text('回到生活',-320,-238,28,BLUE);
  const x=205,y=-225,size=450;
  ctx.save();ctx.beginPath();ctx.roundRect(x,y,size,size,22);ctx.clip();
  const zoom=1.015+.018*Math.sin(t*.18);
  const crop=(artImage.width-artImage.width/zoom)/2;
  ctx.globalAlpha=.94;
  ctx.drawImage(artImage,crop,crop,artImage.width-2*crop,artImage.height-2*crop,x,y,size,size);
  ctx.restore();
  stroke(BLUE,2.5);ctx.beginPath();ctx.roundRect(x,y,size,size,22);ctx.stroke();
  text('原创故事 · 生活情境',x+size/2,265,24,GOLD);
  pulsePath([[-25,-35],[60,-35],[118,5],[185,5]],t,GOLD,ease(p));
}
function drawClosing(t,p){
  stroke(BLUE+'77',1.6);ctx.beginPath();ctx.ellipse(0,-75,220+Math.sin(t*.4)*7,90,0,0,Math.PI*2);ctx.stroke();
  const x=-230+(t-spec.stages[5].start)/(spec.stages[5].end-spec.stages[5].start)*460;
  line(-230,-75,230,-75,1,BLUE+'55',1.4);glowDot(x,-75,6,GOLD);
}

function drawOverlay(t,stage,cue){
  text(title.textContent,112,60,26,MUTED,'left');
  text('VIBE STUDIES  /  '+String(spec.seed-99).padStart(2,'0'),1808,60,24,GOLD,'right');
  text(headings[stage].textContent,960,159,54,WHITE);
  text('0'+(stage+1)+'  /  图形为教学示意',112,1030,23,MUTED,'left');
  text(source.textContent,1808,1030,23,MUTED,'right');
  const a=Math.min(ease((t-spec.cues[cue].start)/.35),ease((spec.cues[cue].end-t)/.25));
  ctx.save();ctx.globalAlpha=a;
  text(cues[cue].textContent,960,stage===0?395:stage===5?565:886,stage===0?64:stage===5?54:42,WHITE);
  text(english[cue].textContent,960,stage===0?480:stage===5?636:946,stage===0||stage===5?26:23,GOLD);
  ctx.restore();
}
window.render=function(t,exportFrame=false){
  ctx.resetTransform();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.setLineDash([]);ctx.lineDashOffset=0;
  t=Math.max(0,Math.min(spec.duration-1/120,t));
  const stage=spec.stages.findIndex(s=>t>=s.start&&t<s.end);
  const s=spec.stages[stage];const elapsed=t-s.start;const p=clamp(elapsed/(stage===2?12:2));
  const cue=Math.max(0,spec.cues.findIndex(c=>t>=c.start&&t<c.end));
  ctx.drawImage(background,0,0);
  particles.forEach(pt=>{ctx.fillStyle='rgba(144,180,234,'+pt.a+')';ctx.beginPath();ctx.arc((pt.x+Math.sin(t*.03+pt.y)*8)%W,(pt.y-t*pt.s+H*20)%H,pt.r,0,Math.PI*2);ctx.fill();});
  stroke('#4a9eff35',1);ctx.beginPath();ctx.ellipse(960,505,570,288,0,0,Math.PI*2);ctx.stroke();
  ctx.save();ctx.translate(960,505+Math.sin(t*.5)*3);
  ctx.globalAlpha=Math.min(ease(elapsed/.45),ease((s.end-t)/.3));
  if(stage===0){
    ctx.translate(0,180);ctx.scale(.54,.54);visuals[spec.motif]({t,phase:stage,p,elapsed});
  }else if(stage===1){
    drawAnchor(t,p);
  }else if(stage===3){
    ctx.save();ctx.translate(90,0);ctx.scale(.9,.9);visuals[spec.motif]({t,phase:stage,p,elapsed});ctx.restore();
    text('等等',-665,-20,54,GOLD);line(-690,35,-490,35,ease(p),GOLD,3);
  }else if(stage===4){
    drawLife(t,p);
  }else if(stage===5){
    drawClosing(t,p);
  }else{
    visuals[spec.motif]({t,phase:stage,p,elapsed});
  }
  ctx.restore();
  line(112,985,1808,985,1,'#2a3a54',2);line(112,985,1808,985,t/spec.duration,GOLD,2.5);
  const beat=t/(60/spec.bpm);glowDot(112+(t/spec.duration)*1696,985,3,GOLD);
  if(exportFrame)drawOverlay(t,stage,cue);
  document.body.classList.toggle('capture',exportFrame);
  headings.forEach((el,i)=>{el.style.opacity=i===stage?'1':'0';el.style.pointerEvents=i===stage?'auto':'none';});
  for(let i=0;i<cues.length;i++){
    const active=i===cue;
    const a=active?Math.min(ease((t-spec.cues[i].start)/.35),ease((spec.cues[i].end-t)/.25)):0;
    cues[i].style.opacity=String(a);english[i].style.opacity=String(a);
    cues[i].style.top=(stage===0?352:stage===5?526:853)+'px';
    cues[i].style.fontSize=(stage===0?64:stage===5?54:42)+'px';
    cues[i].style.lineHeight=(stage===0?86:stage===5?78:66)+'px';
    english[i].style.top=(stage===0?458:stage===5?614:925)+'px';
    english[i].style.fontSize=(stage===0||stage===5?26:23)+'px';
    english[i].style.lineHeight=(stage===0||stage===5?44:42)+'px';
    cues[i].style.pointerEvents=active?'auto':'none';english[i].style.pointerEvents=active?'auto':'none';
  }
  stamp.textContent='0'+(stage+1)+'  /  图形为教学示意';
  document.querySelector('#progress').style.width=(t/spec.duration*100)+'%';
  return {stage,cue,beat};
};
window.ready=Promise.all([document.fonts.load('500 42px FilmSans'),document.fonts.load('400 23px FilmSans'),artReady]).then(()=>window.render(0));
window.film={width:W,height:H,duration:spec.duration,ready:window.ready,frame:t=>window.render(t,false)};
if(!window.filmHost&&!new URLSearchParams(location.search).has('capture')){
  window.ready.then(()=>{
    const started=performance.now();
    function preview(now){
      const t=(now-started)/1000;
      window.render(Math.min(t,spec.duration-1/120));
      if(t<spec.duration)requestAnimationFrame(preview);
    }
    requestAnimationFrame(preview);
  });
}
