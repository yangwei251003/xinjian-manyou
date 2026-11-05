/* Original explanatory diagrams. No comic assets or recycled footage.
 * Entrance hierarchy / comparison timing: kinetic-tech 0.2.7, MIT.
 * Arrival-followed-by-emphasis: OrbFlylineRelay, Apache-2.0 (reference/).
 * Every cue changes the state of the example or adds a new inference.
 */
const CORAL='#ef968b';
function pathLine(c,pts,color=BLUE,width=3,progress=1,dash=false){
 c.save();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';if(dash)c.setLineDash([12,10]);
 c.beginPath();const n=Math.max(1,Math.ceil((pts.length-1)*progress));c.moveTo(...pts[0]);
 for(let j=1;j<=Math.min(n,pts.length-1);j++)c.lineTo(...pts[j]);c.stroke();c.restore();
}
function label(c,v,x,y,color=INK,size=32){wrap(c,v,x,y,550,size,color,3);}
function capsule(c,v,x,y,w=400,color=BLUE){panel(c,x-w/2,y-46,w,92,color);label(c,v,x,y,color,30);}
function card(c,v,x,y,w=440,h=230,color=BLUE){panel(c,x-w/2,y-h/2,w,h,color);label(c,v,x,y,color,36);}
function enter(c,p,x=960,y=500){const s=mix(.94,1,expo(clamp(p*3)));c.translate(x,y+mix(22,0,ease(clamp(p*4))));c.scale(s,s);c.translate(-x,-y);}
function marker(c,v,x,y,color=GOLD){dot(c,x,y,8,color);text(c,v,x,y+48,26,color);}
function flow(c,items,p,y=500){
 const xs=items.map((_,i)=>mix(270,1650,i/(items.length-1||1)));
 items.forEach((v,i)=>{let u=ease(clamp(p*1.35-i*.13));c.save();c.globalAlpha=Math.min(1,u*3);node(c,v,xs[i],y,items.length>3?94:114,i%2?GOLD:BLUE,u);c.restore();if(i)arrow(c,[xs[i-1]+120,y],[xs[i]-120,y],u,BLUE);});
 if(items.length>1){const u=clamp(p*1.1),x=mix(xs[0],xs.at(-1),u);dot(c,x,y,6,TEAL);}
}
function compare(c,left,right,p,details=[]){
 const a=expo(clamp(p*4)),b=expo(clamp(p*4-.32));
 c.save();c.globalAlpha=a;card(c,left,530,470,650,310,BLUE);c.restore();
 c.save();c.globalAlpha=b;card(c,right,1390,470,650,310,GOLD);c.restore();
 line(c,960,300,960,720,MUTED+'66',2);details.forEach((v,i)=>label(c,v,530+i*860,705,MUTED,27));
}
function paper(c,x,y,w,h,lines=5,color=BLUE){panel(c,x,y,w,h,color,1,10);for(let j=0;j<lines;j++)line(c,x+30,y+45+j*(h-80)/Math.max(1,lines-1),x+w-40-(j%3)*26,y+45+j*(h-80)/Math.max(1,lines-1),color+'55',3);}
function checkmark(c,x,y,p=1,color=TEAL){pathLine(c,[[x-22,y],[x-4,y+20],[x+35,y-26]],color,6,p);}
function triangle(c,x,y,r=35,color=BLUE,p=1){pathLine(c,[[x,y-r],[x+r*.9,y+r*.65],[x-r*.9,y+r*.65],[x,y-r]],color,4,p);}
function control(c,x,y,p,pressed='',feedback=false){
 panel(c,x-260,y-170,520,340);ring(c,x-105,y,48,pressed==='circle'?GOLD:BLUE,4);triangle(c,x+100,y,53,pressed==='triangle'?GOLD:BLUE);
 label(c,'操作面板',x,y-110,MUTED,28);
 if(pressed){const tx=x+(pressed==='circle'?-105:100);ring(c,tx,y,62,GOLD,3,ease(clamp(p*1.3)));const q=ease(clamp(p/.42));dot(c,mix(x+280,tx,q),mix(y+220,y,q),9,INK);if(pressed==='triangle'){const q2=clamp((p-.45)/.5);pathLine(c,[[tx,y-55],[tx,y-110],[x+180,y-110]],GOLD,3,q2);}}
 dot(c,x+195,y-110,12,feedback?GOLD:'#394357');label(c,feedback?'黄灯亮起':'等待反馈',x,y+115,feedback?GOLD:MUTED,26);
}
function clockFace(c,x,y,angle,color=GOLD){clock(c,x,y,90,angle,color);}
function gridDots(c,x,y,cols,rows,r,p,selected=0){
 for(let j=0;j<cols*rows;j++){const u=ease(clamp(p*4-j/(cols*rows)*.7));c.save();c.globalAlpha=u;dot(c,x+(j%cols)*r*3,y+Math.floor(j/cols)*r*3,r,j<selected?GOLD:BLUE);c.restore();}
}
function heading(c,v,y=240){label(c,v,960,y,INK,44);}
function switchRail(c,items,active,p){items.forEach((v,i)=>{const x=340+i*620;capsule(c,v,x,725,480,i===active?TEAL:MUTED);if(i<items.length-1)line(c,x+245,725,x+375,725,MUTED+'66',2);});}

function drawAttention(c,s,p,t){
 const i=s.index;
 if(i===4){flow(c,['当前目标','优先处理','选中信息'],p);return;}
 if(i===6){compare(c,'被选中的细节\n更容易报告','其他细节\n可能没有报告',p);return;}
 if(i<=2||i===4||i===5||i===6||i===12||i===15||i===18||i===20||i===21){
  panel(c,260,275,1400,410);const focus=i===20||i===21?'triangle':'dots';
  for(let j=0;j<12;j++){const a=j*2.39+i*.21;const x=960+Math.cos(a+p*.65)*520;const y=475+Math.sin(a*1.3+p*.35)*140;
   dot(c,x,y,12,j%3===0?INK:BLUE);if(j%3===0&&focus==='dots')ring(c,x,y,24,GOLD,2);}
  const x=mix(330,1500,p),y=520-Math.sin(p*Math.PI)*120;triangle(c,x,y,38,TEAL);
  if(focus==='triangle')ring(c,x,y,65,GOLD,3);
  capsule(c,focus==='dots'?'当前目标：白色圆点':'新目标：三角形',960,760,720,GOLD);
  if(i===6)text(c,'其他变化可能未进入报告',960,220,36,MUTED);
  if(i===12)text(c,'视野中存在 ≠ 被注意到',960,220,42,INK);
  if(i===15)text(c,'当时的观察目标是什么？',960,220,42,INK);
 }else if(i===3||i===7){flow(c,['进入视野','获得注意','进入报告'],p);label(c,'三个不同环节',960,745,MUTED,32);}
 else if(i>=8&&i<=11){
  text(c,'Simons & Chabris · 1999',960,230,44,GOLD);
  for(let j=0;j<6;j++)person(c,430+j*210,550,1.1,j%2?BLUE:INK);
  const u=ease(p);dot(c,mix(450,1270,u),mix(465,410,Math.sin(p*Math.PI)),18,GOLD);
  if(i>=10){person(c,mix(1750,320,p),470,1.5,TEAL);capsule(c,'意外角色（示意）',960,740,650,TEAL);}
  else capsule(c,i===8?'实验情境重绘':'任务：数指定队伍的传球',960,740,720);
  if(i===11)label(c,'不注意盲视',960,190,INK,48);
 }else if(i===13){flow(c,['任务','对象','观看条件'],p);}
 else if(i===14){person(c,600,500,2);card(c,'一次遗漏',1300,450);pathLine(c,[[1110,365],[1490,535]],CORAL,5,ease(p));label(c,'不能概括一个完整的人',960,750,GOLD,38);}
 else if(i===16){panel(c,300,290,850,380);for(let j=0;j<5;j++)line(c,360,350+j*48,1000-j*36,350+j*48,BLUE,3);person(c,1430,520,1.8);line(c,1430,500,1330,360,GOLD,5);book(c,650,705,1.1);label(c,'板书 / 手势',960,210,MUTED,36);}
 else if(i===17){for(let j=0;j<9;j++)person(c,330+j*155,520,1.1,j===6?GOLD:BLUE);ring(c,1260,500,90,GOLD,3,p);label(c,'按衣服颜色寻找',960,735,INK,38);}
 else if(i===19){flow(c,['说清目标','检查细节'],p);}
 else if(i===22){compare(c,'选择使目标突出','选择之外可能遗漏',p);}
 else conclusion(c,s,p,['当时的目标','再次核对']);
}

function puzzle(c,x,y,p,extra=false){
 for(let j=0;j<9;j++){if(j===4&&!extra)continue;const tx=x+(j%3)*110,ty=y+Math.floor(j/3)*100;const u=expo(clamp(p*2-j*.04));panel(c,tx+mix((j%2?1:-1)*160,0,u),ty+mix(-90,0,u),96,86,j===4?GOLD:BLUE,u,10);}
}
function drawMemory(c,s,p){
 const i=s.index;
 if(i<=7){
  if(i===1){paper(c,320,290,490,370,5);pathLine(c,[[360,310],[770,630]],CORAL,5,p);puzzle(c,1130,340,p);}
  else if(i===2){flow(c,['注意','理解','已有知识'],p);}
  else if(i===3){puzzle(c,800,330,p);label(c,'最初线索并不完整',960,735,GOLD,36);}
  else if(i===4||i===7){puzzle(c,520,320,p);arrow(c,[900,450],[1110,450],ease(p));paper(c,1210,300,360,360);label(c,'重新组织',960,730,TEAL,38);}
  else {paper(c,360,300,360,340);paper(c,1180,300,360,340,4,GOLD);arrow(c,[760,470],[1140,470],ease(p),GOLD);capsule(c,i===5?'后来听到 / 看到的信息':'经历与后来信息可能混合',960,740,880,TEAL);}
 }else if(i===8||i===9){
  text(c,'Loftus & Palmer · 1974',960,225,42,GOLD);
  [510,1280].forEach((x,j)=>{panel(c,x-180,430,360,110,j?GOLD:BLUE);ring(c,x-100,550,26);ring(c,x+100,550,26);});
  if(i===8){line(c,690,490,1100,490,BLUE,4,p);label(c,'同一事故影片',960,710,INK,36);}
  else {capsule(c,'较弱动词',520,335,390);capsule(c,'更强碰撞动词',1370,335,510,GOLD);arrow(c,[520,600],[520,690],ease(p));arrow(c,[1370,600],[1370,710],ease(p),GOLD);label(c,'速度估计更高（无虚构数值）',960,770,MUTED,28);}
 }else if(i===10){compare(c,'另一项实验\n原影片无碎玻璃','一周后\n部分人报告碎玻璃',p);}
 else if(i===11){compare(c,'后来信息可以影响回忆','不等于每段记忆都虚假',p);}
 else if(i===12||i===13){puzzle(c,480,340,p);ring(c,1300,470,145,GOLD,4,ease(p));text(c,'？',1300,470,120,GOLD);capsule(c,'判断自己的认知：元认知',960,750,930,TEAL);}
 else if(i===14||i===15||i===20){compare(c,'清晰、熟悉的感觉','与事实核对的结果',p);text(c,i===15?'≠':'需要依据',960,470,i===15?90:27,TEAL);}
 else if(i===16){paper(c,600,320,720,310);label(c,'“我确信他说过……”',960,470,INK,40);text(c,'原话在哪里？',960,725,40,GOLD);}
 else if(i===17){compare(c,'记得的内容','自己的推断',p);}
 else if(i===18||i===21){paper(c,330,300,480,380);paper(c,1100,300,480,380,5,GOLD);line(c,810,500,1100,500,TEAL,3,p);label(c,i===18?'有记录就核对；无记录保留不确定':'共同记录比确信的语气更可核对',960,760,TEAL,34);}
 else if(i===19){flow(c,['原先信心','核对反馈','校准判断'],p);}
 else if(i===22){compare(c,'记忆重建\n内容怎样形成','元认知\n怎样判断它',p);}
 else conclusion(c,s,p,['认真记得','容许修正']);
}

function studyTimeline(c,p,delayed){
 text(c,'Roediger & Karpicke · 2006',960,225,39,GOLD);
 line(c,340,500,1590,500,MUTED,3);const xs=[420,920,1460];['5分钟','2天','1周'].forEach((v,j)=>marker(c,v,xs[j],500,j===0?BLUE:GOLD));
 const z=delayed?2:0;ring(c,xs[z],500,65,TEAL,4,ease(p));
 label(c,delayed?'延迟测验：先前提取保持更好':'即时测验：再学习表现更好',960,340,INK,42);
 const x=delayed?1320:480;arrow(c,[x,640],[x,580],ease(p),TEAL);label(c,'相对结果示意 · 不代表原始分数',960,730,MUTED,27);
}
function drawLearning(c,s,p){
 const i=s.index;
 if(i<=4||i===11||i===21){book(c,560,490,2,i===2||i===4||i===11||i===21?1-ease(p):1);paper(c,1140,300,440,350);if(i>=3){text(c,'？',1360,465,100,GOLD);label(c,'先独立回答',1360,730,TEAL,36);}else label(c,i===1?'借助眼前材料':'离开材料还能想起吗',960,740,INK,38);}
 else if(i===5||i===6){compare(c,'再读短文','尝试回忆',p,['再学习条件','记忆测验条件']);text(c,'研究中的不同安排',960,220,38,GOLD);}
 else if(i===7){flow(c,['学完','等待不同时间','最终测验'],p);}
 else if(i===8||i===9){studyTimeline(c,p,i===9);}
 else if(i===10){compare(c,'此刻顺利跟上','一段时间后保持',p);text(c,'不直接等同',960,230,42,GOLD);}
 else if(i===12){flow(c,['独立解释','核对缺口','有针对地补充'],p);}
 else if(i===13){compare(c,'知道方法','实际开始',p);}
 else if(i===14||i===15){clockFace(c,470,460,.5+p*.4);book(c,960,470,1.5);paper(c,1370,330,300,290);line(c,580,460,760,460,BLUE,4,p);line(c,1160,460,1330,460,TEAL,4,p);capsule(c,'固定的学习收尾 → 简短自测',960,740,1020,TEAL);}
 else if(i===16){card(c,'安排练习的建议',960,470,940,300,GOLD);label(c,'与前面的实验条件分开',960,735,MUTED,34);}
 else if(i===17||i===18){
  c.fillStyle=GOLD;c.beginPath();c.arc(1300,440,100,0,TAU);c.fill();c.fillStyle=BACK;c.beginPath();c.arc(1345,415,94,0,TAU);c.fill();
  book(c,530,490,1.8);line(c,940,300,940,720,MUTED+'66',2);label(c,'清醒学习',530,720,BLUE,34);label(c,'睡眠与休息',1320,720,GOLD,34);
 }else if(i===19||i===20||i===23){flow(c,['怎样练','怎样开始','怎样休息'],p);if(i>=20)label(c,i===23?'各司其职':'按任务与自身情况调整',960,750,TEAL,36);}
 else if(i===22){clockFace(c,500,470,.1+p);paper(c,1130,310,420,350);text(c,'过一段时间',500,720,34,GOLD);text(c,'还能解释吗？',1340,720,34,TEAL);}
}

function heart(c,x,y,p,color=CORAL){
 const pts=[];for(let j=0;j<=80;j++){const a=j/80*TAU;pts.push([x+Math.pow(Math.sin(a),3)*130,y-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*8]);}pathLine(c,pts,color,4,Math.min(1,p*2));
 const beat=[[x-230,y+170],[x-80,y+170],[x-45,y+142],[x-20,y+199],[x+8,y+114],[x+35,y+183],[x+60,y+170],[x+230,y+170]];pathLine(c,beat,color,3,p);
}
function loadScale(c,p,balanced=false){
 const a=balanced?mix(.18,.01,p):.14;line(c,960,420,960,665,BLUE,5);triangle(c,960,710,50,BLUE);
 c.save();c.translate(960,450);c.rotate(a);line(c,-430,0,430,0,GOLD,5);[-360,360].forEach(x=>{line(c,x,0,x,115,BLUE,3);pathLine(c,[[x-115,115],[x-90,170],[x+90,170],[x+115,115]],BLUE,3);});c.restore();
 label(c,'任务要求',550,300,CORAL,38);label(c,'可用资源',1360,300,TEAL,38);
}
function drawEmotion(c,s,p){const i=s.index;
 if(i<=5||i===11){heart(c,960,420,p);if(i>=2){capsule(c,'身体信号',390,370,420,CORAL);capsule(c,'情境与解释',1510,370,460,GOLD);}
  label(c,i===3?'同在台前：展示机会 / 被评价':'心跳只是一条线索',960,750,MUTED,34);
 }else if(i===6||i===7||i===8||i===9||i===17){loadScale(c,p,i===17);if(i===7||i===17)['时间','准备','协作','支持'].forEach((v,j)=>capsule(c,v,390+j*380,760,300,j%2?TEAL:BLUE));}
 else if(i===10||i===12||i===13||i===14){
  compare(c,'心跳快 → 一定失败？','紧张中仍可按步骤开始',p);
  if(i===13)label(c,'效果依情境而异',960,760,MUTED,34);if(i===14)label(c,'不是万能开关，也不强迫说成好事',960,760,MUTED,32);
 }else if(i===15||i===16||i===18){
  node(c,'眼前困难',960,330,95,INK);arrow(c,[890,400],[530,550],ease(p),BLUE);arrow(c,[1030,400],[1390,550],ease(p),GOLD);
  card(c,'核对理解与解释',530,650,600,180,BLUE);card(c,'调整负荷与资源',1390,650,600,180,GOLD);
 }else if(i===19){flow(c,['核对事实','重新安排','找人商量'],p);}
 else if(i===20){person(c,570,490,2,BLUE);person(c,1340,490,2,TEAL);line(c,730,510,1180,510,TEAL,4,p);label(c,'持续影响生活 → 可靠成人与专业支持',960,750,TEAL,32);}
 else if(i===21){person(c,960,490,2);ring(c,960,470,230,BLUE+'55',2,p);label(c,'一次体验不能概括完整的人',960,760,INK,36);}
 else {flow(c,['身体','解释','资源'],p);label(c,i===23?'辨认需要帮助的环节':'分开看，再一起理解',960,760,TEAL,36);}
}

function traitLines(c,p){['表达倾向','计划倾向','情绪体验'].forEach((v,j)=>{let y=340+j*150;text(c,v,350,y,32,MUTED);line(c,620,y,1550,y,BLUE+'77',4,ease(p));dot(c,620+(480+j*110)*ease(p),y,12,j%2?GOLD:TEAL);});text(c,'连续维度示意 · 并非个人测试结果',960,790,27,MUTED);}
function drawComparison(c,s,p){const i=s.index;
 if(i<=3||i===6||i===13){
  panel(c,330,290,500,380,GOLD);ring(c,580,440,80,GOLD,4,p);triangle(c,580,440,42,GOLD);label(c,'一个获奖结果',580,740,GOLD,34);
  for(let j=0;j<6;j++)paper(c,1100+(j%3)*150,310+Math.floor(j/3)*190,130,160,3,j%2?BLUE:CORAL);
  label(c,'自己的全部经历',1320,740,BLUE,34);if(i===3)text(c,'信息范围不同',960,230,42,INK);
 }else if(i===4||i===5){flow(c,['比较对象','比较维度','差距的解释'],p);}
 else if(i===7||i===8||i===9){traitLines(c,p);if(i===9)label(c,'不是互不相通的分类盒子',960,225,GOLD,38);}
 else if(i===10||i===11){
  ['课堂','熟悉朋友','陌生环境'].forEach((v,j)=>{person(c,430+j*530,500,1.6,j===1?TEAL:BLUE);capsule(c,v,430+j*530,720,400,j===1?TEAL:BLUE);});
  label(c,'多次观察，也交代情境',960,230,INK,40);
 }else if(i===12){compare(c,'比较一项表现','理解相对稳定的倾向',p);}
 else if(i===14){flow(c,['我在比较什么','证据涉及哪一项'],p);}
 else if(i===15||i===16){['练习','时间','机会','支持'].forEach((v,j)=>{capsule(c,v,430+j%2*1040,370+Math.floor(j/2)*260,580,j<2?BLUE:TEAL);});}
 else if(i>=17&&i<=19){paper(c,350,300,470,350);book(c,1320,470,1.7);arrow(c,[860,470],[1110,470],ease(p),TEAL);label(c,['从别人那里找可尝试的方法','准备一次具体发言','观察自己的具体行为变化'][i-17],960,755,TEAL,36);}
 else if(i===20||i===21){compare(c,'比较的范围','证据能说明的范围',p);label(c,i===20?'不保证总舒服；特质仍可有意义':'让两者保持一致',960,760,MUTED,33);}
 else if(i===22){compare(c,'看清一项差异','判定完整的人',p);}
 else conclusion(c,s,p,['一种可用方法','一次具体尝试']);
}

function drawSupport(c,s,p){const i=s.index;
 if(i<=2||i===21||i===22){
  person(c,550,500,1.8,TEAL);person(c,1300,500,1.8,BLUE);arrow(c,[700,430],[1140,430],ease(p),TEAL);line(c,1200,620,1570,620,GOLD,4,p);label(c,'支持提供资源',550,730,TEAL,34);label(c,'自己仍能行动与选择',1300,730,GOLD,34);
 }else if(i>=3&&i<=7){
  person(c,520,490,2,TEAL);person(c,mix(780,1430,p),560,.9,BLUE);line(c,650,665,1530,665,BLUE+'77',3,p);ring(c,520,500,190,TEAL+'77',3,ease(p));
  label(c,'婴幼儿情境：安全基地与探索',960,230,INK,40);
  if(i===7)label(c,'不能直接给青少年关系分型',960,760,GOLD,36);else label(c,'概念情境示意',960,760,MUTED,28);
 }else if(i===8||i===9){
  heading(c,'切换资料：青少年支持性环境');flow(c,['家庭','学校','社区'],p,540);text(c,'WHO · Adolescent mental health',960,770,28,GOLD);
 }else if(i===10||i===11||i===19){compare(c,'同伴\n倾听与陪伴','成人 / 专业人员\n更多合适资源',p);if(i>=11)label(c,'支持职责不同，不压在一个人身上',960,770,TEAL,33);}
 else if(i===12||i===13){paper(c,560,300,800,390);['发生了什么','怎样影响日常','希望得到什么帮助'].forEach((v,j)=>text(c,v,960,390+j*105,35,j===1?GOLD:INK));}
 else if(i===14||i===15){
  person(c,390,500,1.7);[0,1,2].forEach(j=>{const y=310+j*190;person(c,1440,y,.9,j===1?TEAL:MUTED);pathLine(c,[[540,500],[980,500],[1330,y]],j===1?TEAL:MUTED,3,ease(clamp(p*2-j*.2)),j!==1);});
  label(c,i===14?'寻找可信任、能回应的成人':'一条不适合，继续找可靠路径',960,760,TEAL,35);
 }else if(i===16||i===17){flow(c,i===16?['先问需求','倾听 / 陪伴 / 帮忙']:['能力范围','一件具体的事'],p);}
 else if(i===18){flow(c,['持续困扰 / 安全问题','连接更多帮助'],p);}
 else if(i===20){compare(c,'婴幼儿依恋研究','青少年求助建议',p,['不同研究对象','不同材料来源']);}
 else conclusion(c,s,p,['可以选择求助','仍然参与自己的生活']);
}

function drawCommunication(c,s,p){const i=s.index;
 if(i<=2||i===8||i===10||i===16||i===17||i===18){
  control(c,960,480,p,i===2?'circle':i>=17?'triangle':'',i>=17&&p>.45);
  if(i===2){label(c,'观察：按圆形后未回到起点',960,750,CORAL,34);}
  if(i===8){capsule(c,'熟悉者：知道含义',400,250,550,TEAL);capsule(c,'新手：只看到符号',1490,250,560,GOLD);}
  if(i===10)label(c,'哪些步骤在说明里被省略？',960,750,GOLD,38);
  if(i===16)label(c,'一个动作 + 一个可观察反馈',960,750,TEAL,36);
  if(i===17)label(c,'按三角 → 等黄灯',960,750,GOLD,44);
  if(i===18)label(c,'试一次 / 复述一次，核对是否接上',960,750,TEAL,34);
 }else if(i===3){compare(c,'按圆形后未回到起点','“他不认真”',p,['观察到的事实','尚待检验的解释']);}
 else if(i===4||i===5){node(c,'这个行为',960,320,100);['个人因素','说明与界面','现场情境'].forEach((v,j)=>{let x=400+j*560;arrow(c,[960,430],[x,570],ease(clamp(p*2-j*.15)),j===0?GOLD:BLUE);capsule(c,v,x,680,450,j===0?GOLD:BLUE);});}
 else if(i===6||i===7||i===9){
  paper(c,300,300,510,390);paper(c,1120,300,510,390,2,GOLD);label(c,'已有信息较多',555,750,TEAL,34);label(c,'已有信息较少',1375,750,GOLD,34);
  if(i===9)text(c,'知识诅咒：已有信息可能影响预测',960,220,37,INK);else arrow(c,[830,480],[1080,480],ease(p),TEAL);
 }else if(i===11){compare(c,'信息差是一种可能','仍需检查其他原因',p);}
 else if(i>=12&&i<=15){
  person(c,430,530,1.6,TEAL);person(c,1480,530,1.6,BLUE);
  const items=['核对对方看到什么','你认为符号代表什么？','用自己的话复述','让对方确认理解'];
  card(c,items[i-12],960,415,780,210,i===14?GOLD:BLUE);
  arrow(c,i===13||i===14?[1350,620]:[565,620],i===13||i===14?[565,620]:[1350,620],ease(p),TEAL);
 }else if(i===19){flow(c,['语言','任务难度','实际条件'],p);}
 else if(i===20){compare(c,'更完整的信息','更有依据的责任讨论',p);}
 else if(i===21||i===22){flow(c,['归因：提出解释','知识差：一种可能','倾听：核对理解'],p);}
 else conclusion(c,s,p,['我说了什么','我们理解了什么']);
}

function conclusion(c,s,p,items){
 const ys=[385,620];items.forEach((v,j)=>{const q=expo(clamp(p*2-j*.2));c.save();c.globalAlpha=q;ring(c,480,ys[j],30,j?TEAL:GOLD,3,q);line(c,540,ys[j],1600,ys[j],j?TEAL:BLUE,2,q);label(c,v,1030,ys[j]-45,j?TEAL:INK,46);c.restore();});
}

function triple(c,values,x,y,p,color=BLUE){
 values.forEach((v,j)=>{const u=expo(clamp(p*3-j*.12));panel(c,x+j*138-61,y-66+mix(55,0,u),122,132,color,u,12);text(c,String(v),x+j*138,y,54,color,'center',400,'Anton');});
}
function rules(c,p,values=['3','5','7'],feedback=true){
 triple(c,values,430,460,p);line(c,790,460,950,460,BLUE,3,p);
 card(c,'偶数递增',1280,340,580,145,BLUE);card(c,'任意递增',1280,590,580,145,GOLD);
 if(feedback){text(c,'不接受',1640,340,29,CORAL);checkmark(c,1640,590,ease(p));}
 text(c,'本片示例规则：任意递增',960,765,31,MUTED);
}
function drawEvidence(c,s,p){const i=s.index;
 if(i<=2){
  triple(c,['2','4','6'],820,355,p);for(let j=0;j<5;j++){person(c,430+j*260,610,.8,BLUE);text(c,'赞同',430+j*260,745,27,GOLD);}
  if(i===2)text(c,'同一个例子没有产生新的检验',960,230,37,INK);
 }else if(i===3||i===16||i===17||i===18){compare(c,'多少人赞成','哪种解释经得住检验',p);text(c,'不同问题，不能互相代替',960,225,38,TEAL);}
 else if(i>=4&&i<=7){
  panel(c,300,285,500,400);line(c,550,350,550,600,INK,6,p);
  panel(c,1020,285,600,400,GOLD);[185,250,305].forEach((h,j)=>{const x=1150+j*170;line(c,x,620-h,x,620,j===1?GOLD:BLUE,6,p);text(c,String.fromCharCode(65+j),x,730,33,MUTED);});
  text(c,'经典线段任务 · 情境示意',960,225,36,GOLD);
  if(i===6)text(c,'多数与少数，均须核对证据',960,785,32,TEAL);
 }else if(i===8||i===9){rules(c,p,['8','10','12'],false);checkmark(c,1640,340,ease(p));checkmark(c,1640,590,ease(p));}
 else if(i>=10&&i<=12){rules(c,p);if(i===12)label(c,'偶数限制被这一例子排除',960,225,TEAL,39);}
 else if(i===13){text(c,'Wason · 1960',960,225,48,GOLD);flow(c,['提出例子','得到反馈','修正猜想'],p);}
 else if(i===14){paper(c,330,300,470,370);paper(c,1110,300,470,370,4,GOLD);ring(c,565,470,170,GOLD,3,p);label(c,'偏爱符合已有猜想的信息',960,760,INK,37);}
 else if(i===15||i===20){rules(c,p);text(c,'检验能否区分竞争解释？',960,225,40,TEAL);}
 else if(i===19){[0,1,2].forEach(j=>{paper(c,330+j*470,330,320,330,4,j%2?GOLD:BLUE);text(c,'各自写下猜想与理由',490+j*470,750,26,MUTED);});}
 else if(i===21||i===22){flow(c,['作出预测','看到反馈','允许修正'],p);}
 else conclusion(c,s,p,['大家觉得呢？','什么证据能区分？']);
}

function ratioGrid(c,p,highlight='both'){
 const x=470,y=295,d=50;
 for(let j=0;j<100;j++){const selected=highlight==='both'||(highlight==='gain'?j<90:j>=90);c.save();c.globalAlpha=selected?1:.18;dot(c,x+j%20*d,y+Math.floor(j/20)*d,11,j<90?BLUE:GOLD);c.restore();}
 label(c,'90 个得到',620,670,BLUE,45);label(c,'10 个未得到',1310,670,GOLD,45);text(c,'教学圆点：同一组 100 个',960,760,29,MUTED);
 const q=ease(p);line(c,480,570,480+950*q,570,TEAL,3);
}
function drawFraming(c,s,p){const i=s.index;
 if(i<=4||i===16||i===17||i===19){ratioGrid(c,p,i===2?'gain':i===3?'loss':'both');if(i===4)text(c,'措辞改变；这组圆点未改变',960,230,38,INK);}
 else if(i===5||i===6){compare(c,'同一属性的表达 A','互补表达 B',p);text(c,'属性框架',960,230,48,GOLD);}
 else if(i>=7&&i<=10){
  text(c,'Levin & Gaeth · 1988',960,225,41,GOLD);
  [550,1370].forEach((x,j)=>{ring(c,x,475,140,j?GOLD:BLUE,4,ease(p));for(let k=0;k<8;k++)line(c,x-80,410+k*18,x+80-k%3*25,410+k*18,j?GOLD:BLUE,2,p);});
  label(c,'75% 瘦肉',550,695,BLUE,44);label(c,'25% 脂肪',1370,695,GOLD,44);
  if(i===9)label(c,'75% 瘦肉表述得到更正面评价',960,775,TEAL,29);
  if(i===10)label(c,'品尝之后：表述效应减小',960,775,TEAL,33);
 }else if(i===11||i===22){flow(c,['同一组','同一分母','互补结果'],p);}
 else if(i===12||i===13){
  compare(c,'报名者中的比例','获选者中的比例',p);gridDots(c,350,340,8,4,10,p,0);gridDots(c,1190,340,5,3,10,p,0);label(c,'分母变了，不能直接互换',960,760,CORAL,38);
 }else if(i===14||i===15){compare(c,'属性框架\n同一属性换措辞','风险选择框架\n确定与有风险的选项',p);text(c,'不同任务，不混为一个实验',960,230,38,GOLD);}
 else if(i===18){flow(c,['时间','条件','对象'],p);text(c,'还缺哪些信息？',960,225,44,TEAL);}
 else if(i===20||i===21){compare(c,'更完整的信息','个人仍可能不同选择',p);}
 else conclusion(c,s,p,['听起来怎样？','完整说法是什么？']);
}

function pastFuture(c,p,mode='both'){
 line(c,270,470,1660,470,BLUE,4,p);arrow(c,[1590,470],[1680,470],1,TEAL);marker(c,'现在',960,470,INK);
 if(mode!=='future'){paper(c,330,290,390,280,3,MUTED);label(c,'已付出 · 无法收回',525,700,MUTED,33);}
 if(mode!=='past'){[0,1].forEach(j=>{const y=320+j*300;pathLine(c,[[1000,470],[1270,y],[1530,y]],j?GOLD:TEAL,4,p);label(c,j?'换一条路':'继续',1520,y-70,j?GOLD:TEAL,38);});}
}
function drawFuture(c,s,p){const i=s.index;
 if(i===1){card(c,'不可退款的活动名额',960,460,930,320,GOLD);label(c,'去了以后发现不合适',960,735,CORAL,36);}
 else if(i===2||i===3||i===4){compare(c,'接下来仍有价值','以前的钱不能白花',p,['面向未来','回看已付出']);}
 else if(i>=5&&i<=7){pastFuture(c,p,i===7?'future':'past');text(c,i===7?'未来仍会随选择变化':'沉没成本：已付出且无法收回',960,225,41,GOLD);}
 else if(i===8||i===9){text(c,'Arkes & Blumer · 1985',960,230,43,GOLD);pastFuture(c,p);label(c,'已有投入可能影响后续选择',960,775,INK,34);}
 else if(i===10||i===11){flow(c,['技能与承诺','转换成本','后续价值'],p);label(c,'仍可能影响未来的因素',960,760,TEAL,36);}
 else if(i>=12&&i<=15){
  compare(c,'过去：已无法收回','未来：仍会改变',p);if(i===14)label(c,'可退回的钱 → 不属于沉没成本',960,760,TEAL,37);if(i===15)label(c,'退出新增责任 / 损失 → 未来一栏',960,760,GOLD,35);
 }else if(i===16||i===17||i===18||i===19){pastFuture(c,p,'future');text(c,i===16?'继续：未来收益与代价':i===17?'换路：未来收益与代价':'两个选择都使用面向未来的理由',960,225,40,INK);}
 else if(i===20||i===21){compare(c,'珍惜过去的努力','调整未来的方向',p);label(c,'停下或坚持，均须结合仍有效的理由',960,760,TEAL,32);}
 else if(i===22){pastFuture(c,p);}
 else conclusion(c,s,p,['以前花了多少','接下来值得吗']);
}

function brainMap(c,x,y,p){
 c.save();c.translate(x,y);c.strokeStyle=BLUE;c.lineWidth=3;c.beginPath();
 c.moveTo(0,-150);c.bezierCurveTo(-180,-205,-240,-20,-150,110);c.bezierCurveTo(-85,170,-25,120,0,145);c.bezierCurveTo(90,185,225,90,180,-60);c.bezierCurveTo(170,-160,50,-185,0,-150);c.stroke();
 pathLine(c,[[0,-140],[-10,0],[0,130]],BLUE,2,p);
 [[-100,-70],[-130,20],[75,-80],[130,25],[65,90]].forEach(([a,b],j)=>{ring(c,a,b,30,BLUE+'88',2,p);glow(c,a,b,55,j===2?GOLD:BLUE,.4);});
 dot(c,75,-80,12,GOLD);c.restore();
}
function ruler(c,x,y,p){line(c,x,y,x+550,y,TEAL,6,p);for(let j=0;j<=10;j++)line(c,x+j*55,y,x+j*55,y-(j%5?24:48),TEAL,3,p);}
function drawMeasurement(c,s,p){const i=s.index;
 if(i<=3||i===17||i===22){flow(c,['工具与条件','观察结果','解释与用途'],p);if(i>=17)label(c,'连接处需要对应的证据',960,760,TEAL,37);}
 else if(i===4||i===5){[0,1,2].forEach(j=>{clockFace(c,470+j*480,460,1.1);text(c,'重复读数接近',470+j*480,720,30,j%2?GOLD:BLUE);});text(c,'一致性与误差：信度的一部分',960,225,41,INK);}
 else if(i===6||i===7){clockFace(c,510,450,1.1+p*.1);ruler(c,1110,515,p);label(c,'稳定的时钟',510,720,GOLD,38);label(c,'量距离需要适合的工具',1360,720,TEAL,34);}
 else if(i===8||i===9||i===10){
  paper(c,350,300,500,380);card(c,'这个用途\n有证据支持吗？',1340,480,590,310,GOLD);arrow(c,[890,480],[1010,480],ease(p),TEAL);
  text(c,i===9?'Standards for Educational and Psychological Testing · 2014':'效度：分数解释与使用的证据',960,225,i===9?27:40,INK);
 }else if(i>=11&&i<=16){
  brainMap(c,550,470,p);paper(c,1100,300,490,360,4,GOLD);
  label(c,'任务与比较条件',1345,385,GOLD,31);label(c,'测量方法',1345,510,GOLD,31);
  if(i===13){pathLine(c,[[650,420],[960,300],[1100,360]],GOLD,3,p,true);pathLine(c,[[650,490],[940,650],[1100,560]],GOLD,3,p,true);}
  if(i===14)label(c,'不能凭一个亮点读出完整想法或性格',960,755,CORAL,34);
  if(i===15)label(c,'Poldrack · 2006：反向推断的条件与困难',960,755,GOLD,32);
  if(i===16)label(c,'工具有用；解释仍需要相应证据',960,755,TEAL,34);
 }else if(i===18||i===19||i===20){
  ['准备测什么','研究对象与误差','适用人群与用途'].forEach((v,j)=>capsule(c,v,960,310+j*200,1130,j===2?GOLD:BLUE));
  if(i===20)label(c,'换年龄 / 语言 / 用途 → 重新核对证据',960,805,TEAL,28);
 }else if(i===21){brainMap(c,550,480,p);paper(c,1120,320,450,330);text(c,'图形示意',1345,470,41,GOLD);capsule(c,'未对你实施任何量表或扫描',960,760,1100,GOLD);}
 else conclusion(c,s,p,['这项观察能说明什么','再决定它意味着什么']);
}

const DAYS=[[1,2],[2,1.6],[3,3.3],[4,3.1],[5,5.1],[6,4.5],[7,6.7]];
function scatter(c,x,y,w,h,p,variant=0){
 line(c,x,y+h,x+w,y+h,BLUE,3);line(c,x,y+h,x,y,BLUE,3);
 DAYS.forEach(([a,b],j)=>{const u=ease(clamp(p*1.55-j*.085));c.save();c.globalAlpha=u;dot(c,x+35+a/8*(w-60),y+h-28-(b+(variant?Math.sin(j*2)*.5:0))/8*(h-40),8,GOLD);c.restore();});
 text(c,'冰淇淋销量',x+w/2,y+h+48,26,MUTED);text(c,'树荫人数',x+w/2,y-35,26,MUTED);
}
function campus(c,p,all=false){
 const locs=['教室','操场','球场','图书馆','校门','食堂'];locs.forEach((v,j)=>{const x=500+j%3*440,y=340+Math.floor(j/3)*260;panel(c,x-165,y-80,330,160,j===2?GOLD:BLUE,all?1:j===2?1:.25);text(c,v,x,y,36,j===2?GOLD:MUTED);});
 ring(c,1380,340,190,GOLD,3,ease(p));label(c,'仅午后球场旁的记录',960,775,GOLD,35);
}
function drawResearch(c,s,p){const i=s.index;
 if(i<=6){campus(c,p,i===4);if(i===2)text(c,'本片虚构例子 · 非真实调查数据',960,225,36,TEAL);if(i===5)label(c,'增加同地点次数 ≠ 自动覆盖其他场景',960,225,TEAL,36);}
 else if(i>=7&&i<=9||i===12||i===18){scatter(c,470,315,980,360,p);label(c,'每一个点 = 同一地点记录的一天 · 虚构数据',960,800,TEAL,27);if(i===9)label(c,'一起变化 ≠ 已知原因与方向',960,235,INK,39);if(i===12)label(c,'日期层面关系 ≠ 每个人的行为',960,235,INK,38);if(i===18)label(c,'重复相关：关系是否稳健',960,235,INK,39);}
 else if(i===10||i===11){
  node(c,'更热的天气？',960,310,115,GOLD);card(c,'冰淇淋销量',490,655,550,180,BLUE);card(c,'树荫人数',1430,655,550,180,TEAL);
  pathLine(c,[[880,400],[680,480],[490,560]],GOLD,3,ease(p),true);pathLine(c,[[1040,400],[1240,480],[1430,560]],GOLD,3,ease(p),true);
  label(c,'虚线：候选解释，尚需检验',960,800,MUTED,28);
 }else if(i>=13&&i<=17){
  scatter(c,280,340,560,300,p,0);scatter(c,1080,340,560,300,p,1);text(c,'原日期 / 地点',560,260,33,BLUE);text(c,'其他日期 / 地点',1360,260,33,GOLD);
  label(c,i===15?'交代相同方法与改变条件':i===16?'相异结果也要检查并报告':i===17?'相近结果仍不是因果证明':'同一记录规则，再次观察',960,800,TEAL,32);
 }else if(i===19){flow(c,['候选解释 A','能区分的设计','候选解释 B'],p);label(c,'因果判断需要排查竞争解释',960,760,GOLD,35);}
 else if(i===20||i===21||i===22){flow(c,['记录覆盖谁','关系怎样解释','能否再次观察'],p);label(c,'不同问题约束结论的不同部分',960,760,TEAL,33);}
 else conclusion(c,s,p,['看到结论','沿方法与出处继续追问']);
}

function taskScope(c,p,limited=false){
 for(let j=0;j<8;j++){const x=430+j%4*310,y=350+Math.floor(j/4)*230;paper(c,x,y,220,170,3,limited&&j>1?MUTED:BLUE);if(limited&&j<2)checkmark(c,x+110,y+90,ease(p));}
 capsule(c,limited?'可承担：检查这一部分':'请求：承担整组任务',960,250,1040,limited?TEAL:GOLD);
}
function drawBoundaries(c,s,p){const i=s.index;
 if(i<=3||i===6||i===7||i===14){taskScope(c,p,i>=6);if(i===2||i===3)clockFace(c,1650,330,.5+p*.2);if(i===14)label(c,'协商不是把全部任务换个说法接下',960,800,CORAL,32);}
 else if(i===4||i===5||i===22){flow(c,['自己的需求','现实限度','可行安排'],p);}
 else if(i===8||i===9){
  line(c,400,500,1520,500,BLUE,4,p);['一味退让','尊重且清楚表达','攻击控制'].forEach((v,j)=>{marker(c,v,400+j*560,500,j===1?TEAL:MUTED);});ring(c,960,500,90,TEAL,3,ease(p));
 }else if(i===10||i===11){compare(c,'可协商的安排','做不到的限度',p);label(c,'表达清楚 ≠ 保证对方同意',960,240,GOLD,39);}
 else if(i===12||i===13){flow(c,i===12?['安全','现实','双方愿意']:['重新分工','调整时间','寻找资源'],p);}
 else if(i===15){compare(c,'说明自己的行动与范围','要求别人必须服从',p);pathLine(c,[[1100,330],[1670,600]],CORAL,5,p);}
 else if(i===16||i===17){person(c,400,500,1.7);person(c,1520,500,1.7,TEAL);paper(c,730,320,460,330);arrow(c,[550,570],[690,570],ease(p));arrow(c,[1370,570],[1230,570],ease(p),TEAL);label(c,'核对双方是否理解同一安排',960,780,TEAL,34);}
 else if(i===18){flow(c,['条件发生变化','重新商量约定'],p);}
 else if(i===19||i===20){flow(c,['安全 / 威胁 / 明显不对等','合适支持'],p);label(c,'不必只靠一句沟通技巧',960,760,GOLD,36);}
 else if(i===21){compare(c,'可以清楚表达限度','也可以讨论可行安排',p);}
 else conclusion(c,s,p,['有合作意愿','也诚实说明可承担的范围']);
}

function journal(c,p,both=true,specific=false){
 paper(c,280,280,650,460,6,BLUE);label(c,'困难',605,340,BLUE,38);label(c,specific?'失误还没解决':'今天确实不容易',605,485,INK,36);
 if(both){paper(c,990,280,650,460,6,GOLD);label(c,'得到的支持',1315,340,GOLD,38);label(c,specific?'有人陪我整理材料':'谁做了什么？怎样帮到我？',1315,485,INK,32);checkmark(c,1315,655,ease(p));}
}
function drawGratitude(c,s,p){const i=s.index;
 if(i<=6||i===13||i===14||i===15||i===16||i===23){journal(c,p,i!==1,i===4||i===5||i===14||i===16);if(i===3)text(c,'增加观察，不改写事实',960,220,41,TEAL);}
 else if(i===7){card(c,'不强迫自己“应该开心”',960,490,1120,340,GOLD);}
 else if(i===8||i===9){text(c,'Emmons & McCullough · 2003',960,225,39,GOLD);['感恩记录','烦恼记录','普通事件等'].forEach((v,j)=>{paper(c,280+j*520,330,360,350,4,j===0?GOLD:BLUE);label(c,v,460+j*520,750,j===0?GOLD:MUTED,32);});}
 else if(i===10||i===11){compare(c,'群体平均\n部分福祉指标更好','个人是否受益\n仍需观察',p);text(c,'不是每项指标、每个人都保证改善',960,230,35,TEAL);}
 else if(i===12){card(c,'下面是可选的生活练习',960,430,1150,250,GOLD);label(c,'“困难与支持同页”未由原研究检验',960,700,MUTED,34);}
 else if(i===17||i===18){flow(c,i===17?['记录之后','观察对自己是否有帮助']:['勉强 / 增加负担 / 无帮助','调整或暂停'],p);}
 else if(i===19){compare(c,'不用感谢伤害','不用否认合理的难受',p);}
 else if(i===20||i===21){compare(c,'日记中的观察','生活里的行动与支持',p);label(c,'记录不能代替必要的行动与支持',960,760,TEAL,35);}
 else if(i===22){journal(c,p,true);label(c,'邀请多看一条线索，不规定感受',960,220,TEAL,36);}
}

const DRAWERS={
 'attention-limits':drawAttention,'memory-calibration':drawMemory,'learning-loop':drawLearning,
 'emotion-context':drawEmotion,'comparison-personality':drawComparison,'support-exploration':drawSupport,
 'communication-gap':drawCommunication,'evidence-agreement':drawEvidence,'framing-choice':drawFraming,
 'future-cost':drawFuture,'measurement-inference':drawMeasurement,'research-chain':drawResearch,
 'clear-boundaries':drawBoundaries,'gratitude-both':drawGratitude,
};
function filmDiagram(c,s,p,t){if(!DRAWERS[episode.id])throw Error('No diagram for '+episode.id);DRAWERS[episode.id](c,s,p,t);}
