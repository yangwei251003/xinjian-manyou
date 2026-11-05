/* Second visual pass: change the information structure, not only its labels.
 * Only the five mechanism inserts are affected; other scene functions stay intact. */
const baseTopicScene = topicScene;
function variedTopicScene(ctx, shot, p) {
  const stage={field:0,gate:1,compare:2,causal:3,assemble:4}[shot.kind];
  if(stage===undefined||stage===0)return false;
  const q=smooth(p),a=ease(ramp(p,0,.7)),b=ease(ramp(p,.25,1));
  const id=episode.id;
  const say=(s,x=960,y=755,z=42,c=TEAL)=>text(ctx,s,x,y,z,c);
  const box=(s,x,y,w=400,h=160,c=BLUE,u=1)=>{panel(ctx,x-w/2,y-h/2,w,h,c,u,15);wrap(ctx,s,x,y,w-60,Math.min(45,w/8),INK,3);};
  const connect=(x1,y1,x2,y2,t=a,c=BLUE)=>arrow(ctx,[x1,y1],[x2,y2],t,c,4);
  const table=(x=960,y=640,w=1100)=>{line(ctx,x-w/2,y,x+w/2,y,BLUE,5);line(ctx,x-w*.42,y,x-w*.42,y+100,BLUE,4);line(ctx,x+w*.42,y,x+w*.42,y+100,BLUE,4);};
  const note=(s,x,y,c=BLUE,u=a)=>{ctx.save();ctx.translate(x,y+(1-u)*120);ctx.rotate((1-u)*.2);panel(ctx,-170,-135,340,270,c,u,6);wrap(ctx,s,0,-30,280,43,INK,3);for(let i=0;i<2;i++)line(ctx,-110,60+i*45,110,60+i*45,c+'60',2,b);ctx.restore();};
  const column=(s,x,y,c=BLUE)=>{text(ctx,s,x,y,51,c);line(ctx,x-250,y+65,x+250,y+65,c,3,a);};
  const routes=(names)=>{person(ctx,360,520,1.3,BLUE);names.forEach((s,i)=>{const y=270+i*230;connect(520,520,1190,y,ease(ramp(p,i*.1,.5+i*.1)),i%2?GOLD:BLUE);box(s,1450,y,470,140,i%2?GOLD:BLUE);});};
  const cards=(names)=>names.forEach((s,i)=>note(s,440+i*530,460,i===2?GOLD:BLUE,ease(ramp(p,i*.1,.45+i*.1))));
  const subject=(s,x=960,y=460)=>{person(ctx,x,y,1.25,BLUE);box(s,x,y-220,570,130,GOLD);};
  const rows=(names)=>names.forEach((s,i)=>{const u=ease(ramp(p,i*.12,.5+i*.12));box(s,mix(i%2?2300:-400,960,u),280+i*200,1100,145,i===2?GOLD:BLUE);text(ctx,'0'+(i+1),480,280+i*200,50,GOLD,'center',400,'Anton');});
  switch(id){
    case 'memory':
      if(stage===1){column('亲眼经历',500,250,BLUE);column('后来听说',1420,250,GOLD);for(let i=0;i<6;i++){const x=mix(1270+i%2*210,410+i%2*210,a),y=400+Math.floor(i/2)*110;panel(ctx,x-70,y-40,140,80,i%2?GOLD:BLUE);text(ctx,i%2?'听说':'看到',x,y,29,INK);}say('不同来源，可能在回忆时混在一起');}
      if(stage===2){person(ctx,420,550,1.4,BLUE);for(let i=0;i<12;i++){const x=1050+i%4*155,y=350+Math.floor(i/4)*145;const fromX=hash(i)*1600+150,fromY=hash(i+11)*500+240;panel(ctx,mix(fromX,x,q)-60,mix(fromY,y,q)-50,120,100,i%3?BLUE:GOLD); }say('回忆时，碎片被重新组织');}
      if(stage===3){box('我很确定',560,410,600,330,GOLD);box('记录怎么说？',1380,550,600,330,BLUE,b);text(ctx,'≠',960,500,125,GOLD);say('确信的感觉，需要与记录核对');}
      if(stage===4){table();book(ctx,560,490,1.0,1,BLUE);note('核对来源',1330,460,GOLD,b);connect(770,490,1110,490,b,TEAL);say('给回忆留一个可以修正的位置');}
      break;
    case 'metacognition':
      if(stage===1){book(ctx,500,490,1.35,1-a,BLUE);note('不看答案\n独立解释',1340,450,GOLD,b);connect(750,490,1080,490,b,TEAL);}
      if(stage===2){column('我的预测',480,260,BLUE);column('实际尝试',1430,260,GOLD);text(ctx,'应该会',480,470,100,BLUE);text(ctx,'这一步？',1430,470,100,GOLD);line(ctx,960,230,960,740,MUTED+'55',2);say('比较预测和表现，找到具体缺口');}
      if(stage===3){panel(ctx,440,260,1040,440,BLUE);for(let i=0;i<6;i++){const x=560+i%3*330,y=380+Math.floor(i/3)*210;box(i===4?'还不会':'已解释',x,y,240,120,i===4?GOLD:BLUE);}ring(ctx,mix(600,890,q),590,110,GOLD,4);say('反馈不是一个标签，而是一处线索');}
      if(stage===4){note('原来的问题',450,460,BLUE);note('换一个情境',1450,460,GOLD,b);connect(690,460,1190,460,b,TEAL);text(ctx,'能迁移吗？',960,300,65,TEAL);}
      break;
    case 'stress':
      if(stage===1){person(ctx,960,520,2.05,BLUE);for(let i=0;i<4;i++){const y=300+i*110;line(ctx,620,y,1300,y,GOLD+'55',2,a);dot(ctx,mix(620,1300,q),y,5,GOLD);}say('反应提醒我们查看当前的负荷');}
      if(stage===2){column('任务要求',490,250,BLUE);column('可用资源',1430,250,GOLD);['作业','比赛','责任'].forEach((s,i)=>box(s,490,390+i*130,470,95,BLUE));['时间','分工','支持'].forEach((s,i)=>box(s,1430,390+i*130,470,95,GOLD,ease(ramp(p,i*.12,.5+i*.12))));say('不要只数任务，也要看资源');}
      if(stage===3){routes(['可以减少','可以协商','可以求助']);}
      if(stage===4){table();note('现在的一小步',700,450,GOLD);clock(ctx,1440,465,140,-1+q*.8,BLUE);say('把调整落到具体的行动与时间');}
      break;
    case 'brain': {
      const network=(cx,cy,w,h,n,highlight)=>{const pts=Array.from({length:n},(_,i)=>[cx+Math.cos(i*2.399)*Math.sqrt((i+1)/n)*w,cy+Math.sin(i*2.399)*Math.sqrt((i+1)/n)*h]);pts.forEach(([x,y],i)=>{if(i)line(ctx,...pts[Math.floor((i-1)/2)],x,y,(i%3===highlight?GOLD:BLUE)+'90',2,ease(ramp(p,i*.012,.5+i*.012)));dot(ctx,x,y,6,i%3===highlight?GOLD:BLUE);});};
      if(stage===1){network(500,480,280,220,12,0);network(1420,480,280,220,12,1);connect(810,480,1110,480,b,TEAL);say('多个过程，通过连接共同参与');}
      if(stage===2){panel(ctx,220,260,680,440,BLUE);panel(ctx,1020,260,680,440,GOLD);network(560,480,250,160,15,0);network(1360,480,250,160,15,2);text(ctx,'任务 A',560,310,42,BLUE);text(ctx,'任务 B',1360,310,42,GOLD);say('比较任务，才能讨论活动差异');}
      if(stage===3){note('研究条件',450,465,BLUE);network(1070,470,240,180,16,1);box('还需要\n其他证据',1560,465,400,270,GOLD,b);connect(650,465,790,465,a,TEAL);say('成像不是直接读取一个人的全部想法');}
      if(stage===4){const names=['任务','比较','方法','证据'];names.forEach((s,i)=>{const a0=i/4*TAU,rr=mix(700,430,a);node(ctx,s,960+Math.cos(a0)*rr,470+Math.sin(a0)*rr*.55,85,i%2?GOLD:BLUE,b);});network(960,470,160,100,11,2);say('把亮点放回研究的问题里');}
      break;
    }
    case 'emotions':
      if(stage===1){subject('心跳变快');routes(['比赛前','被催促','期待见面']);}
      if(stage===2){person(ctx,960,525,1.6,BLUE);node(ctx,'身体',470,350,110,BLUE,a);node(ctx,'情境',1450,350,110,GOLD,a);box('目标',960,720,330,100,TEAL,b);connect(590,390,820,480,a);connect(1330,390,1100,480,b,GOLD);}
      if(stage===3){column('观察到的信号',490,260,BLUE);column('我给它的解释',1430,260,GOLD);note('身体在变化',490,500,BLUE);note('还可以怎样理解',1430,500,GOLD,b);text(ctx,'？',960,470,140,TEAL);}
      if(stage===4){routes(['准备一下','休息一下','找人聊聊']);say('需要什么，让行动有一个方向');}
      break;
    case 'reappraisal':
      if(stage===1){person(ctx,500,550,1.2,BLUE);panel(ctx,1030,260,660,380,GOLD,b);wrap(ctx,'他没回应\n也许没听见',1360,445,600,62,INK,3);connect(720,510,970,450,b,TEAL);}
      if(stage===2){node(ctx,'眼前事实',960,300,125,TEAL,a);node(ctx,'最初解释',460,650,120,BLUE,b);node(ctx,'另一解释',1460,650,120,GOLD,b);connect(860,390,550,550,a);connect(1060,390,1370,550,b,GOLD);}
      if(stage===3){note('需要核对的事',440,460,BLUE);person(ctx,1030,530,1.4,BLUE);panel(ctx,1380,260,220,450,GOLD,b);line(ctx,1390,270,mix(1590,1460,q),720,GOLD,4);say('换一种解释后，仍检查需要采取的行动');}
      if(stage===4){rows(['核对事实','保留另一种解释','采取可行行动']);}
      break;
    case 'habits':
      if(stage===1){table();book(ctx,450,470,1.0,0,BLUE);for(let i=0;i<3;i++)panel(ctx,800+i*240,400,130,230,GOLD,.7);person(ctx,mix(300,720,q),540,.65,BLUE);say('准备成本，可能让开始变难');}
      if(stage===2){for(let i=0;i<12;i++){const x=430+i%6*220,y=330+Math.floor(i/6)*230;panel(ctx,x-85,y-75,170,150,BLUE);if(i<Math.floor(p*13)){line(ctx,x-35,y,x-5,y+30,GOLD,4);line(ctx,x-5,y+30,x+45,y-35,GOLD,4);}}say('重复要与稳定情境一起理解，不是神奇天数');}
      if(stage===3){table();book(ctx,mix(350,960,q),500,1.2,1,BLUE);box('提前摆好',1430,350,400,130,GOLD,b);say('把线索放到更容易看见的位置');}
      if(stage===4){note('只做起步动作',960,455,GOLD);const x=mix(560,1230,q);line(ctx,560,650,x,650,BLUE,7);dot(ctx,x,650,8,GOLD);say('让现在的一步，小到能够开始');}
      break;
    case 'personality':
      if(stage===1){person(ctx,960,545,1.4,BLUE);box('课堂',480,315,420,150,BLUE);box('熟悉的朋友',1450,315,500,150,GOLD,b);connect(650,370,840,475,a);connect(1270,370,1080,475,b,GOLD);say('不同情境，具体表现可以不同');}
      if(stage===2){for(let i=0;i<9;i++){const x=530+i%3*430,y=300+Math.floor(i/3)*180;panel(ctx,x-155,y-65,310,130,i%3===1?GOLD:BLUE,ease(ramp(p,i*.04,.6+i*.04)));person(ctx,x-65,y+15,.25,BLUE);text(ctx,['观察','场合','行为'][i%3],x+45,y,32,INK);}say('把多次行为放在一起，而不是只看一天');}
      if(stage===3){subject('一个人 ≠ 一个标签');['情境','目标','倾向'].forEach((s,i)=>{const x=mix(960,[440,960,1480][i],a),y=mix(500,720,b);box(s,x,y,320,110,i%2?GOLD:BLUE);});}
      if(stage===4){table();note('具体行为',600,450,BLUE);note('新的观察',1330,450,GOLD,b);connect(820,455,1100,455,b,TEAL);say('用更多观察，更新对一个人的理解');}
      break;
    case 'comparison':
      if(stage===1){panel(ctx,580,280,760,420,BLUE);person(ctx,960,490,1.3,BLUE);['练习','失败','时间','支持'].forEach((s,i)=>{const x=960+(i%2?1:-1)*mix(230,640,a),y=340+Math.floor(i/2)*280;box(s,x,y,300,110,i%2?GOLD:BLUE,b);});say('展示之外，还有没有被看见的条件');}
      if(stage===2){column('比较什么',480,250,BLUE);column('条件是否相同',1420,250,GOLD);note('同一维度？',480,490,BLUE);note('同一过程？',1420,490,GOLD,b);text(ctx,'？',960,480,140,TEAL);}
      if(stage===3){for(let i=0;i<3;i++){note(['排名','自我怀疑','可学的方法'][i],430+i*530,460,i===2?GOLD:BLUE);if(i<2){ctx.strokeStyle=BLUE+'55';line(ctx,330+i*530,610,550+i*530,340,BLUE+'55',3,a);}}say('把注意转向一种能借鉴的方法');}
      if(stage===4){rows(['选一种适合的方法','放进自己的练习','再观察自己的变化']);}
      break;
    case 'attachment':
      if(stage===1){person(ctx,600,520,1.65,GOLD);person(ctx,mix(1380,970,q),600,.85,BLUE);panel(ctx,700,250,680,150,GOLD,b);text(ctx,'我在这里',1040,325,65,INK);say('可靠回应，让需要被接住');}
      if(stage===2){person(ctx,360,540,1.2,GOLD);person(ctx,mix(700,1470,q),575,.7,BLUE);for(let i=0;i<4;i++)panel(ctx,970+i*180,270+i%2*100,110,100,BLUE,a);connect(500,600,mix(700,1370,q),600,a,TEAL);say('得到支持，可以帮助继续探索');}
      if(stage===3){phone(ctx,500,490,.95,1);note('需要时\n怎样联系？',1330,460,GOLD,b);connect(710,490,1090,490,b,TEAL);say('连接也可以落实为一个清楚的约定');}
      if(stage===4){node(ctx,'可靠回应',450,500,140,GOLD,a);const pts=[[1020,310],[1500,470],[1020,690]];pts.forEach(([x,y],i)=>{box(['支持','探索','再联系'][i],x,y,340,120,i===1?GOLD:BLUE,b);connect(i?pts[i-1][0]+40:610,i?pts[i-1][1]:500,x-160,y,b,TEAL);});}
      break;
    case 'conformity':
      if(stage===1){for(let i=0;i<5;i++){person(ctx,400+i*280,550,1.0,BLUE);box('C',400+i*280,310,170,130,GOLD,ease(ramp(p,i*.08,.4+i*.08)));}say('人数增加，也可能带来合群压力');}
      if(stage===2){person(ctx,960,600,1.4,BLUE);node(ctx,'信息',470,300,140,BLUE,a);node(ctx,'合群',1450,300,140,GOLD,b);connect(850,510,570,390,a);connect(1070,510,1350,390,b,GOLD);say('影响判断的理由，需要被拆开讨论');}
      if(stage===3){table();note('先独立写下答案',600,450,BLUE);note('再交换理由',1330,450,GOLD,b);connect(820,450,1100,450,b,TEAL);}
      if(stage===4){line(ctx,600,650,600,320,INK,8);line(ctx,mix(1450,650,q),650,mix(1450,650,q),320,GOLD,8);text(ctx,'重新核对观察',1130,300,70,GOLD);text(ctx,'理由，不只是人数',1130,550,60,INK);}
      break;
    case 'listening':
      if(stage===1){person(ctx,450,590,1.5,BLUE);panel(ctx,740,250,850,350,GOLD,b);wrap(ctx,'我理解的是……\n这样对吗？',1165,425,760,65,INK,3);connect(1460,700,650,700,b,TEAL);}
      if(stage===2){note('我以为的意思',470,460,BLUE);note('对方补充的信息',1450,460,GOLD,b);connect(700,460,1200,460,b,TEAL);text(ctx,'允许修正',960,260,70,GOLD);}
      if(stage===3){routes(['先听一会儿','一起想办法','找更多支持']);say('需要哪一种帮助，让对方参与回答');}
      if(stage===4){table();person(ctx,460,520,.9,BLUE);person(ctx,1460,520,.9,GOLD);box('理解以后\n共同商量下一步',960,410,650,300,TEAL,b);}
      break;
    case 'framing':
      if(stage===1)return false; // Controlled complementary description: retain identical objects.
      if(stage===2){const r0=180;ring(ctx,500,475,r0,BLUE,24);ring(ctx,500,475,r0,GOLD,24,.9,-Math.PI/2);text(ctx,'同一个整体',500,475,50,INK);box('90 得到',1390,355,520,150,GOLD);box('10 未得到',1390,600,520,150,BLUE,b);connect(740,475,1080,475,b,TEAL);say('把两种互补描述，放回同一个分母');}
      if(stage===3){column('属性框架',480,240,BLUE);column('风险选项框架',1420,240,GOLD);box('同一属性的\n互补措辞',480,500,600,360,BLUE);box('确定选项与\n有风险的选项',1420,500,600,360,GOLD,b);say('问题不同，不能把研究条件混为一谈');}
      if(stage===4){rows(['统一分母','核对条件','补全两种结果']);}
      break;
    case 'sunk-cost':
      if(stage===1){for(let i=0;i<6;i++)panel(ctx,320+i%3*160,350+Math.floor(i/3)*180,115,115,BLUE,1-b*.6,6);line(ctx,870,220,870,760,GOLD,4,a);text(ctx,'已经发生',510,260,55,BLUE);text(ctx,'接下来',1350,260,70,GOLD);person(ctx,mix(1020,1450,q),540,1.4,GOLD);say('不可收回的投入，和未来理由要分开');}
      if(stage===2){routes(['未来的成本','未来的收益','转换的代价']);}
      if(stage===3){column('继续的理由',490,250,BLUE);column('改变的理由',1430,250,GOLD);note('从现在开始\n还有什么收益？',490,500,BLUE);note('从现在开始\n需要什么代价？',1430,500,GOLD,b);}
      if(stage===4){person(ctx,mix(400,1500,q),520,1.15,GOLD);line(ctx,260,690,1660,690,BLUE,4,a);text(ctx,'过去',350,760,40,MUTED);text(ctx,'未来的理由',1450,300,75,GOLD);box('重新比较',1280,480,600,180,BLUE,b);}
      break;
    case 'help-seeking':
    case 'support':
      if(stage===1){table();note(id==='support'?'先问需要':'具体困扰',560,450,BLUE);note(id==='support'?'能做什么':'日常影响',1350,450,GOLD,b);connect(800,450,1100,450,b,TEAL);}
      if(stage===2){person(ctx,430,600,1.05,BLUE);person(ctx,1480,520,1.65,GOLD);panel(ctx,560,260,820,190,BLUE,a);text(ctx,id==='support'?'我能陪你一起去':'我想找你聊一件事',970,355,54,INK);connect(650,600,1220,600,b,TEAL);}
      if(stage===3){node(ctx,'自己',960,485,110,BLUE,a);['成人','同伴','合适服务','专业支持'].forEach((s,i)=>{const angle=i/4*TAU;const x=960+Math.cos(angle)*570,y=485+Math.sin(angle)*240;connect(960+Math.cos(angle)*120,485+Math.sin(angle)*110,x,y,b,TEAL);node(ctx,s,x,y,90,i%2?GOLD:BLUE,b);});say('让帮助连成网，而不是只靠一个人');}
      if(stage===4){column('能做的',490,250,BLUE);column('需要连接的',1430,250,GOLD);note('具体陪伴\n实际帮助',490,490,BLUE);note('更多资源\n合适支持',1430,490,GOLD,b);text(ctx,'也照顾自己的限度',960,785,44,TEAL);}
      break;
    case 'boundaries':
      if(stage===1){person(ctx,400,600,1.1,BLUE);person(ctx,1530,600,1.1,GOLD);box('我能做这一部分',810,310,700,170,BLUE,a);box('这部分现在做不到',1150,540,760,170,GOLD,b);}
      if(stage===2){const r0=245,dx=mix(400,300,q);ring(ctx,960-dx,470,r0,BLUE,4);ring(ctx,960+dx,470,r0,GOLD,4);text(ctx,'需要',960-dx,470,55,BLUE);text(ctx,'限度',960+dx,470,55,GOLD);box('可协商',960,700,430,120,TEAL,b);}
      if(stage===3){panel(ctx,795,230,330,480,GOLD);person(ctx,470,535,1.2,BLUE);person(ctx,1450,535,1.2,GOLD);text(ctx,'安全 / 尊重',960,300,40,GOLD);text(ctx,'清楚表达',960,475,59,INK);connect(630,570,750,570,a);connect(1300,570,1180,570,b,GOLD);}
      if(stage===4){rows(['明确能承担的部分','核对彼此的理解','约定一个可行的下一步']);}
      break;
    case 'correlation':
      if(stage===1){node(ctx,'变量 A',480,440,150,BLUE,a);node(ctx,'变量 B',1440,440,150,GOLD,a);connect(660,370,1260,370,a,BLUE);connect(1260,520,660,520,b,GOLD);text(ctx,'方向也要问',960,660,65,TEAL);say('两条候选方向，都还不是已经证实的结论');}
      if(stage===2)return false;
      if(stage===3){column('看到的现象',490,250,BLUE);column('还需排查',1430,250,GOLD);note('一起变化',490,490,BLUE);['方向','共同原因','其他条件'].forEach((s,i)=>box(s,1430,340+i*170,490,120,i===1?GOLD:BLUE,b));}
      if(stage===4){note('研究设计',450,460,BLUE);node(ctx,'候选解释',1050,450,140,TEAL,a);box('什么证据\n能区分它们？',1570,460,430,300,GOLD,b);connect(680,460,880,460,b,TEAL);say('用研究检验猜想，不把箭头当结论');}
      break;
    case 'sampling':
      if(stage===1){column('被邀请的人',490,240,BLUE);column('实际回应的人',1420,240,GOLD);for(let i=0;i<12;i++){const x=310+i%4*125,y=380+Math.floor(i/4)*140;person(ctx,x,y,.42,BLUE);if(i%3){const u=ease(ramp(p,i*.025,.55+i*.025));person(ctx,mix(x,1240+i%3*160,u),mix(y,400+Math.floor(i/4)*140,u),.42,GOLD);}}say('被邀请，与实际回答，是不同环节');}
      if(stage===2){routes(['班群里的同学','没有入群的人','没有回应的人']);say('检查入口以外，谁还没有被听见');}
      if(stage===3){for(let i=0;i<24;i++){const x=350+i%8*175,y=300+Math.floor(i/8)*160;person(ctx,x,y,.45,i%5?BLUE+'44':GOLD);}ctx.setLineDash([14,12]);ctx.strokeStyle=GOLD;ctx.strokeRect(250,210,1420,530);ctx.setLineDash([]);box('还漏掉谁？',960,490,650,170,TEAL,b);}
      if(stage===4){note('实际覆盖的样本',450,460,BLUE);box('结论的范围',1330,460,700,420,GOLD,b);connect(680,460,940,460,b,TEAL);text(ctx,'不能直接代替全部人群',1330,560,39,GOLD);}
      break;
    case 'replication':
      if(stage===1){person(ctx,420,570,1.3,BLUE);table(1280,650,850);note('再次研究\n保留方法记录',1280,460,GOLD,b);connect(650,500,990,500,b,TEAL);}
      if(stage===2){column('相近结果',490,250,BLUE);column('不同结果',1430,250,GOLD);note('哪些条件相同？',490,490,BLUE);note('哪些条件改变？',1430,490,GOLD,b);say('两种结果，都带来值得检查的问题');}
      if(stage===3){for(let i=0;i<8;i++){const u=ease(ramp(p,i*.035,.55+i*.035));panel(ctx,350+i%4*340,260+Math.floor(i/4)*260+(1-u)*300,270,210,i%3?BLUE:GOLD);for(let j=0;j<3;j++)line(ctx,390+i%4*340,315+Math.floor(i/4)*260+j*45,570+i%4*340,315+Math.floor(i/4)*260+j*45,BLUE+'66',2,u);}say('多项研究，需要结合设计质量一起看');}
      if(stage===4){rows(['公开问题与方法','比较不同研究','让结论接受修正']);}
      break;
    case 'gratitude':
      if(stage===1){table();person(ctx,420,535,1.1,BLUE);person(ctx,1500,535,1.1,GOLD);const pencilX=mix(1380,750,q);line(ctx,pencilX,480,pencilX+230,415,GOLD,15);connect(1370,620,630,620,b,TEAL);box('一件具体的支持',960,260,720,150,GOLD,a);say('支持也可以很小：有人递来一支笔');}
      if(stage===2){column('困难仍然在',490,240,BLUE);column('也得到了一点支持',1430,240,GOLD);for(let i=0;i<4;i++)box(['任务','时间','担心','问题'][i],360+i%2*270,410+Math.floor(i/2)*220,220,130,BLUE);person(ctx,1330,500,1.1,BLUE);person(ctx,1530,540,.8,GOLD);connect(1430,600,1370,600,b,TEAL);say('看见支持，不要求困难立刻消失');}
      if(stage===3){cards(['感恩记录','烦恼记录','普通事件']);say('原研究比较不同记录条件，不保证个人效果');}
      if(stage===4){book(ctx,450,490,1.1,1-a,BLUE);['继续','调整','暂停'].forEach((s,i)=>{const u=ease(ramp(p,i*.13,.5+i*.13));box(s,1040+i*260,400+i%2*220,230,140,i===1?GOLD:BLUE,u);});say('观察是否有帮助，允许调整记录方式');}
      break;
    default:return false;
  }
  return true;
}
topicScene = function(ctx,shot,p){return variedTopicScene(ctx,shot,p)||baseTopicScene(ctx,shot,p);};
