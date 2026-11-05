/* Original concept-specific choreography. Each invocation advances a different
 * operation; these are explanatory diagrams, never measured observations. */
function topicScene(ctx, shot, p) {
  const stages = {field:0,gate:1,compare:2,causal:3,assemble:4};
  const stage = stages[shot.kind];
  if (stage === undefined) return false;
  const q = smooth(p), r = ease(ramp(p,.22,.9));
  const id = episode.id;
  const words = (arr,x=960,y=755,w=1200) => wrap(ctx,arr[stage],x,y,w,40,TEAL,2);
  const link = (a,b,t=1,c=BLUE) => arrow(ctx,a,b,t,c,4);
  const label = (s,x,y,c=INK,z=43) => text(ctx,s,x,y,z,c);
  const strip = (s,x,y,c=BLUE) => tag(ctx,s,x,y,c,Math.max(280,s.length*35));
  const disk = (x,y,rad,c) => {ctx.fillStyle=c+'22';ctx.beginPath();ctx.arc(x,y,rad,0,TAU);ctx.fill();ring(ctx,x,y,rad,c,3);};
  switch(id) {
    case 'attention': {
      if(stage===0){
        const people=[[430,430],[720,630],[1110,340],[1500,575]];
        people.forEach(([x,y],i)=>{person(ctx,x+q*(i%2?45:-45),y,.8,i%2?BLUE:GOLD);label(i%2?'蓝衣':'白衣',x,y+110,i%2?BLUE:GOLD,29);});
        const ball=bezier([430,455],[650,120],[1250,120],[1500,560],q);
        dot(ctx,...ball,23,GOLD);ring(ctx,...ball,32,INK,2);
        strip('任务：追踪白衣队的传球',960,210,GOLD);
      }else if(stage===1){
        const radius=mix(570,170,q);ctx.save();ctx.beginPath();ctx.arc(960,480,radius,0,TAU);ctx.clip();
        for(let i=0;i<35;i++){const x=300+i%7*215,y=260+Math.floor(i/7)*100;label(['△','○','□'][i%3],x,y,i%3?BLUE:GOLD,65);}
        ctx.restore();ring(ctx,960,480,radius,GOLD,5);strip('任务像一束有限的光',960,775,GOLD);
      }else if(stage===2){
        line(ctx,960,230,960,720,MUTED+'55',2);
        label('先看人物',480,270,GOLD,60);label('再看背景',1430,270,BLUE,60);
        person(ctx,480,520,1.5,GOLD);
        for(let i=0;i<9;i++)panel(ctx,1130+i%3*180,370+Math.floor(i/3)*100,140,65,BLUE,.4+r*.6,4);
        link([660,530],[1050,530],q,TEAL);
      }else if(stage===3){
        node(ctx,'词义干扰',500,470,150,BLUE,r);node(ctx,'漏看事件',1420,470,150,GOLD,r);
        label('Stroop',500,265,BLUE,40);label('不注意盲视',1420,265,GOLD,40);
        label('蓝',500,485,GOLD,100);person(ctx,1420,490,.7,GOLD);
        label('不同任务，不混为同一种现象',960,760,TEAL,42);
      }else{
        panel(ctx,370,260,1180,450,BLUE);label('换一个观察任务',960,340,GOLD,70);
        ['先确定目标','换焦点再看','核对遗漏'].forEach((v,i)=>{const u=ease(ramp(p,i*.15,.45+i*.15));label(v,550+i*410,540+(1-u)*120,INK,39);if(i<2)link([690+i*410,540],[770+i*410,540],u);});
      }
      break;
    }
    case 'knowledge-curse': {
      if(stage===0){
        robot(ctx,450,490,.95,q);
        const locations=[[850,300],[1210,425],[1570,590]];
        locations.forEach(([x,y],i)=>{const u=ease(ramp(p,i*.14,.45+i*.14));node(ctx,['按三角','等黄灯','再确认'][i],x,y,90,i===1?GOLD:BLUE,u);if(i)link([locations[i-1][0]+75,locations[i-1][1]+35],[x-80,y-35],u,TEAL);});
        strip('老队员脑中：完整顺序',960,775);
      }else if(stage===1){
        label('「按一下」',960,320,GOLD,115);
        const arr=['哪个按钮？','等什么信号？','怎样算完成？'];
        arr.forEach((v,i)=>{const u=ease(ramp(p,i*.14,.42+i*.14));node(ctx,v,470+i*490,590,118,i===1?GOLD:BLUE,u);});
      }else if(stage===2){
        const names=['说了什么','省掉什么','对方能否复述'];
        names.forEach((v,i)=>{const x=420+i*540,u=ease(ramp(p,i*.12,.48+i*.12));panel(ctx,x-200,300+(1-u)*260,400,380,i===2?GOLD:BLUE);label(v,x,390+(1-u)*260,i===2?GOLD:INK,35);if(i===0)label('按一下',x,560+(1-u)*260,INK,65);else if(i===1){label('△ → 灯 → 确认',x,560+(1-u)*260,BLUE,36);}else label('？',x,555+(1-u)*260,GOLD,120);});
      }else if(stage===3){
        const seq=['说出动作','指出信号','确认结果'];
        seq.forEach((v,i)=>{const u=ease(ramp(p,i*.16,.45+i*.16));const x=440+i*530;panel(ctx,x-210,310,420,350,i===1?GOLD:BLUE,u);label('0'+(i+1),x,390,GOLD,75);label(v,x,540,INK,46);if(i<2)link([x+220,480],[x+300,480],u,TEAL);});
      }else{
        robot(ctx,960,485,.6+.5*r,q);
        for(let i=0;i<6;i++){const a=i/6*TAU;const rr=mix(700,285,ease(ramp(p,i*.025,.65+i*.025)));const x=960+Math.cos(a)*rr,y=480+Math.sin(a)*rr*.6;strip(['动作','信号','顺序','结果','疑问','复述'][i],x,y,i%2?GOLD:BLUE);}
        label('把隐形步骤带回说明里',960,795,TEAL,42);
      }
      break;
    }
    case 'retrieval': {
      if(stage===0){
        book(ctx,440,500,1.1,1,BLUE);link([650,500],[1050,500],q,TEAL);
        panel(ctx,1140,270,510,420,GOLD);label('合上以后',1395,345,GOLD,45);
        for(let i=0;i<4;i++)line(ctx,1205,445+i*60,1570-i%2*95,445+i*60,INK,4,ease(ramp(p,.12+i*.1,.45+i*.1)));
      }else if(stage===1){
        const points=[[400,300],[700,610],[1040,300],[1450,600]];
        points.forEach(([x,y],i)=>{const u=ease(ramp(p,i*.13,.4+i*.13));node(ctx,['线索','尝试回忆','发现缺口','核对反馈'][i],x,y,95,i===2?GOLD:BLUE,u);if(i)link([points[i-1][0]+70,points[i-1][1]],[x-90,y],u,TEAL);});
      }else if(stage===2){
        label('5分钟',470,260,BLUE,100);label('2天 / 1周',1430,260,GOLD,100);
        book(ctx,470,480,1.1,1,BLUE);book(ctx,1430,480,1.1,0,GOLD);
        strip('再读表现较好',470,715,BLUE);strip('提取保持较好',1430,715,GOLD);
        line(ctx,960,260,960,735,MUTED+'44',2);
      }else if(stage===3){
        panel(ctx,310,270,1300,460,BLUE);
        label('比较的条件，要一起保留',960,355,GOLD,64);
        ['相同材料','不同学习方式','不同测验时间'].forEach((v,i)=>{label(v,500+i*460,560+(1-ease(ramp(p,i*.12,.5+i*.12)))*100,INK,39);});
      }else{
        const rows=['先写出记得的','回看材料核对','隔一段时间再试'];
        rows.forEach((v,i)=>{const u=ease(ramp(p,i*.16,.5+i*.16));const x=mix(i%2?-500:2400,960,u);panel(ctx,x-570,250+i*185,1140,140,i===2?GOLD:BLUE);label('0'+(i+1),x-450,320+i*185,GOLD,60);label(v,x+50,320+i*185,INK,50);});
      }
      break;
    }
    case 'attribution': {
      if(stage===0){
        phone(ctx,600,490,1.3,1);label('还没回复',600,260,BLUE,55);
        const opts=['不想理我？','正在忙？','手机没电？'];opts.forEach((v,i)=>{const u=ease(ramp(p,i*.13,.4+i*.13));label(v,1370+(1-u)*550,320+i*180,i?BLUE:GOLD,55);link([850,490],[1150,320+i*180],u,i?BLUE:GOLD);});
      }else if(stage===1){
        person(ctx,960,510,1.5,GOLD);const dist=mix(40,580,r);
        ['时间','地点','任务','突发情况'].forEach((v,i)=>{const a=i/4*TAU;const x=960+Math.cos(a)*dist,y=490+Math.sin(a)*dist*.45;node(ctx,v,x,y,85,i%2?GOLD:BLUE,q);});
      }else if(stage===2){
        panel(ctx,250,280,600,410,BLUE);panel(ctx,1070,280,600,410,GOLD);
        label('看见的',550,370,BLUE,60);phone(ctx,550,535,.5,1);
        label('还不知道的',1370,370,GOLD,60);label('行程 / 设备 / 处境',1370,550,INK,40);
      }else if(stage===3){
        node(ctx,'个人解释',480,340,125,BLUE,q);node(ctx,'情境解释',1450,340,125,GOLD,q);
        node(ctx,'更多信息',960,650,125,TEAL,r);
        link([560,430],[860,590],q,BLUE);link([1370,430],[1060,590],r,GOLD);
      }else{
        phone(ctx,400,475,.8,1);link([600,480],[900,480],q,BLUE);
        panel(ctx,990,270,650,430,GOLD);label('先问一句',1315,355,GOLD,60);
        wrap(ctx,'刚才发生了什么？\n下次怎样联系？',1315,530,580,50,INK,3);
      }
      break;
    }
    case 'memory': {
      const tiles=Array.from({length:20},(_,i)=>[700+i%5*130,300+Math.floor(i/5)*110]);
      tiles.forEach(([tx,ty],i)=>{const missing=[3,8,12,16].includes(i);let x=tx,y=ty;
        if(stage===0){x=mix(150+hash(i)*1600,tx,q);y=mix(120+hash(i+20)*650,ty,q);}
        if(stage===1&&missing){x=mix(1750,tx,q);y=mix(250+i*15,ty,q);}
        if(stage===2){x=tx+(i%2?1:-1)*r*120;}
        if(stage===4){x=mix(tx+(i%2?550:-550),tx,q);y=mix(150+hash(i)*650,ty,q);}
        const c=missing?(stage===0?MUTED:GOLD):BLUE;panel(ctx,x-53,y-45,106,90,c,missing&&stage===0?.15:1,9);
        if(missing)label(stage===0?'？':'后来',x,y,c,28);
      });
      words(['经历没有被完整保存','后来信息，也可能进入回忆','回忆像重新拼接','熟悉与确信，不是准确的保证','核对记录，容许自己修正']);break;
    }
    case 'metacognition': {
      if(stage===0){book(ctx,960,480,1.8,1,BLUE);label('看着答案：好像都会',960,225,GOLD,55);}
      else if(stage===1){book(ctx,450,490,1.25,1-q,BLUE);panel(ctx,1050,260,580,460,GOLD);label('请独立解释',1340,350,GOLD,45);label('……',1340,550,INK,100);}
      else{const n=['先预测','独立试','看反馈'];n.forEach((v,i)=>{const x=430+i*530;node(ctx,v,x,480,130,i===stage-2?GOLD:BLUE,q);if(i<2)link([x+140,480],[x+380,480],r,TEAL);});}
      words(['熟悉感先形成判断','移开答案，缺口才出现','把预测与实际尝试并排','反馈帮助校准判断','把不会的部分放进下一次练习']);break;
    }
    case 'sleep': {
      const shift=stage===0?0:stage===1?1:stage===2?2:stage===3?3:4;
      if(shift===0){book(ctx,960,490,1.7,1,BLUE);for(let i=0;i<8;i++)dot(ctx,640+i*90,280+q*120,7,BLUE);}
      else if(shift===1){ctx.strokeStyle=BLUE;ctx.lineWidth=5;ctx.strokeRect(570,480,800,170);panel(ctx,600,385,210,110,GOLD);person(ctx,1000,500,.6,BLUE);ctx.save();ctx.translate(1420,300);ctx.rotate(q*.5);label('☾',0,0,GOLD,160);ctx.restore();}
      else if(shift===2){clock(ctx,960,485,240,-2+q*1.5,GOLD);label('睡眠',960,700,BLUE,45);}
      else if(shift===3){label('恢复 / 记忆过程',960,270,GOLD,65);for(let i=0;i<5;i++){const x=430+i*260;disk(x,520,70,BLUE);if(i<4)link([x+80,520],[x+170,520],q,TEAL);}}
      else{book(ctx,600,470,1.2,0,BLUE);link([800,470],[1100,470],q,GOLD);panel(ctx,1170,300,480,370,BLUE);label('再练习',1410,420,INK,60);label('再核对',1410,555,GOLD,60);}
      words(['学习先形成新信息','给休息留出真实时间','不是一夜自动学会所有东西','睡眠参与多种过程，示意不是脑扫描','醒来以后，仍需练习与核对']);break;
    }
    case 'stress': {
      if(stage<2){person(ctx,960,540,1.4,BLUE);for(let i=0;i<7;i++){const x=360+i%4*400,y=270+Math.floor(i/4)*180;const u=ease(ramp(p,i*.06,.5+i*.06));panel(ctx,x-130,y+(1-u)*-300,260,100,i%2?GOLD:BLUE);label(['作业','比赛','时间','睡眠','责任','变化','期待'][i],x,y+(1-u)*-300,INK,35);}if(stage===1)ring(ctx,960,520,200+r*75,GOLD+'99',6);}
      else{const arr=stage===2?['任务要求','可用时间','现有资源']:stage===3?['可以减少','可以协商','可以求助']:['拆成一步','安排时间','找人分担'];arr.forEach((v,i)=>{const x=440+i*520;node(ctx,v,x,470,135,i===2?GOLD:BLUE,ease(ramp(p,i*.12,.5+i*.12)));if(i<2)link([x+140,470],[x+380,470],r,TEAL);});}
      words(['负荷来自具体要求','反应提醒我们查看资源','把要求和资源放在一起','改变负荷，也可以增加支持','先做一个可行的小调整']);break;
    }
    case 'brain': {
      const pts=Array.from({length:28},(_,i)=>[960+Math.cos(i*2.399)*Math.sqrt(i+1)*101,480+Math.sin(i*2.399)*Math.sqrt(i+1)*55]);
      pts.forEach(([x,y],i)=>{const group=i%4;const active=stage===0?group===0:stage===1?group<2:stage===2?group!==2:true;for(let j=0;j<i;j++){if(j%4===group||stage>1&&j===i-1)line(ctx,...pts[j],x,y,(active?BLUE:MUTED)+(active?'65':'15'),active?2:1,ease(ramp(p,(i+j)*.004,.55+(i+j)*.004)));}dot(ctx,x,y,active?7:3,active?(group===1?GOLD:BLUE):MUTED);});
      words(['一个亮点，不是一种能力的全部','多个过程，由网络共同参与','换一个任务，参与方式也可能不同','成像需要比较条件与其他证据','这是网络概念图，不是真实脑扫描']);break;
    }
    case 'emotions': {
      if(stage===0){person(ctx,960,520,1.9,BLUE);const pts=[[650,480],[750,480],[790,430],[830,540],[875,360],[930,490],[1270,490]];for(let i=1;i<pts.length;i++)line(ctx,...pts[i-1],...pts[i],GOLD,4,clamp(q*6-i+1));}
      else if(stage===1){node(ctx,'心跳变快',960,480,150,GOLD,q);['比赛前','被催促','期待见面'].forEach((v,i)=>{const a=i/3*TAU;node(ctx,v,960+Math.cos(a)*620,480+Math.sin(a)*250,100,BLUE,r);});}
      else{const list=stage===2?['身体信号','情境','目标']:stage===3?['我注意到了什么','我怎样理解','我需要什么']:['辨认','核对','选择行动'];list.forEach((v,i)=>{node(ctx,v,430+i*530,480,v.length>6?145:120,i===1?GOLD:BLUE,ease(ramp(p,i*.13,.5+i*.13)));});}
      words(['身体信号是线索之一','相似信号，可以有不同解释','把身体、情境和目标一起看','不凭一次感受给自己定型','让解释帮助你选择行动']);break;
    }
    case 'reappraisal': {
      const x=960+(stage===1?mix(-300,250,q):0);panel(ctx,x-520,260,1040,450,BLUE);line(ctx,x,260,x,710,BLUE,3);line(ctx,x-520,485,x+520,485,BLUE,3);
      if(stage===0){label('事实',x-250,370,INK,70);label('推断',x+250,580,GOLD,70);}
      else{const a=stage===1?['他没回应','也许没听见']:stage===2?['最初解释','另一种解释']:stage===3?['有没有证据','需不需要行动']:['核对事实','采取一步'];label(a[0],x-250,380,INK,48);label(a[1],x+250,590,GOLD,48);link([x-80,430],[x+80,540],r,TEAL);}
      words(['先把事实与推断分开','视角移动，解释可能增加','另一解释也要符合证据','换想法，不等于忽略现实问题','需要行动的事，仍然可以行动']);break;
    }
    case 'habits': {
      const points=[[310,620],[650,470],[990,470],[1350,320],[1630,320]];
      points.forEach(([x,y],i)=>{if(i){const bend=stage===1&&i===2?200:0;link([points[i-1][0]+50,points[i-1][1]],[x-55,y+bend],ease(ramp(p,i*.08,.4+i*.08)),i===4?GOLD:BLUE);}disk(x,y,48,i===4?GOLD:BLUE);label(['线索','开始','重复','准备','行动'][i],x,y+100,INK,36);});
      if(stage===1)panel(ctx,820,360,170,190,GOLD,.7,4);
      if(stage===3){book(ctx,mix(350,1350,q),290,.4,1,GOLD);}
      words(['稳定情境，可以成为动作线索','准备成本，会让开始变难','重复与情境一起影响自动启动','提前摆好材料，改变便利程度','把起步动作缩小到现在能做']);break;
    }
    case 'personality': {
      const names=['开放性','尽责性','外向性','宜人性','情绪稳定性'];
      names.forEach((v,i)=>{const y=245+i*90;label(v,420,y,INK,36);line(ctx,700,y,1510,y,BLUE+'66',6);const base=.2+i*.12;const pos=stage===0?base:clamp(base+(stage%2?.12:-.1)*r,.05,.95);dot(ctx,mix(700,1510,pos),y,14,i===stage?GOLD:BLUE);});
      label('维度示意 · 不是任何人的测验结果',1100,690,MUTED,29);
      words(['倾向是维度，不是几个固定盒子','具体表现也受情境影响','要看多次行为与不同场合','一次表现，不能替一个人定型','用更多观察更新理解'],960,775);break;
    }
    case 'comparison': {
      panel(ctx,300,250,560,490,BLUE);label('别人展示的',580,320,BLUE,42);person(ctx,580,530,1.2,BLUE);
      if(stage===0){panel(ctx,1060,250,560,490,GOLD);label('自己的全部',1340,320,GOLD,42);person(ctx,1340,520,1.2,GOLD);}
      else{for(let i=0;i<5;i++){const y=280+i*90;panel(ctx,1110+(1-r)*600,y,500,65,i===4?GOLD:BLUE,.6);label(['练习','失败','支持','时间','成果'][i],1360+(1-r)*600,y+32,INK,30);}}
      words(['一边是展示，一边是完整过程','画面以外，还有没被看见的条件','先问：比较的是同一维度吗','能借鉴的方法，比给人排名有用','把一种可学方法放进自己的下一步']);break;
    }
    case 'attachment': {
      person(ctx,430,520,1.5,GOLD);const x=stage===0?mix(1450,700,q):stage===1?mix(700,520,q):stage===2?mix(580,1420,q):stage===3?1100:mix(850,1450,q);person(ctx,x,570,.78,BLUE);
      ctx.beginPath();ctx.moveTo(500,520);ctx.bezierCurveTo(720,750,x-100,750,x-20,570);ctx.strokeStyle=TEAL+'90';ctx.lineWidth=3;ctx.stroke();
      for(let i=0;i<3;i++)panel(ctx,1170+i*160,250+i%2*80,120,100,BLUE,.4+r*.6,8);
      strip('可靠回应',430,745,GOLD);
      words(['不确定时，可能需要靠近支持','可靠回应，让需要被看见','得到支持，可以帮助继续探索','一个场景，不能判断完整依恋模式','连接与探索，可以同时存在']);break;
    }
    case 'conformity': {
      const h=[130,230,330];line(ctx,350,650,350,420,INK,8);
      [790,1130,1470].forEach((x,i)=>{line(ctx,x,650,x,650-h[i],stage>0&&i===2?GOLD:BLUE,8,ease(ramp(p,i*.1,.45+i*.1)));label(['A','B','C'][i],x,715,INK,45);});
      if(stage>0){['C','C','C'].forEach((v,i)=>{person(ctx,700+i*300,220,.45,BLUE);label(v,700+i*300,145,GOLD,40);});}
      if(stage===3||stage===4)ring(ctx,1130,530,150,TEAL,4,r);
      words(['先看长度，再看他人的答案','群体答案，也可能与自己的观察冲突','信息与合群动机都可能影响判断','重新独立观察，再交换理由','这里是线段任务示意，不是实验录像']);break;
    }
    case 'listening': {
      person(ctx,350,610,1.25,BLUE);person(ctx,1580,610,1.25,GOLD);
      const messages=stage===0?['我今天很难受','……']:stage===1?['你是说……','我理解对了吗？']:stage===2?['对，我更担心的是','再听一段']:stage===3?['你现在希望我怎么帮？','陪我一会儿']:['先核对理解','再商量行动'];
      panel(ctx,460,260,890,170,BLUE,q);label(messages[0],905,345,INK,48);
      panel(ctx,680,500,800,160,GOLD,r);label(messages[1],1080,580,GOLD,43);
      link([1430,460],[590,460],r,TEAL);
      words(['先接住一句话，不急着给结论','复述是在核对，不是替对方下定义','允许对方修正你的理解','需要什么，让对方参与回答','理解与行动，都可以共同商量']);break;
    }
    case 'framing': {
      for(let i=0;i<100;i++){const x=520+i%10*75,y=240+Math.floor(i/10)*46;const c=i<90?GOLD:BLUE;ctx.fillStyle=c+(stage===1&&i<90?'35':'cc');ctx.beginPath();ctx.arc(x,y,12,0,TAU);ctx.fill();}
      const n=stage===1?'10 / 100':'90 / 100';label(n,1490,420,GOLD,85);label(stage===1?'未得到':'得到',1490,540,INK,55);
      if(stage>1){label('90 得到 + 10 未得到 = 100',960,790,TEAL,52);line(ctx,450,720,1330,720,GOLD,3,r);}
      words(['先看：每100个中的90个','同一组结果，也可突出另外10个','分母与结果没有改变','这是属性框架，另有风险选择框架','比较前，统一分母、条件与结果']);break;
    }
    case 'sunk-cost': {
      line(ctx,960,250,960,770,MUTED+'55',2);label('已经付出',500,270,BLUE,60);label('接下来',1430,270,GOLD,60);
      for(let i=0;i<8;i++){const x=300+i%4*125,y=430+Math.floor(i/4)*150;panel(ctx,x,y,90,90,BLUE,stage>0?1-r*.65:1,9);}
      const choices=stage===0?['继续？','改变？']:stage===1?['未来成本','未来收益']:stage===2?['新的理由','新的代价']:['按未来理由','重新比较'];
      choices.forEach((v,i)=>{node(ctx,v,1370,430+i*230,100,i?GOLD:BLUE,ease(ramp(p,i*.15,.55+i*.15)));});
      if(stage===1){ctx.setLineDash([12,12]);line(ctx,780,510,1110,510,GOLD,3,1-r);ctx.setLineDash([]);}
      words(['不能收回的投入，仍会牵动我们','把过去投入，与未来理由分开','问题是：接下来还值得吗','也要保留转换成本与现实约束','让未来理由，参与下一步选择']);break;
    }
    case 'help-seeking':
    case 'support': {
      person(ctx,400,520,1.4,BLUE);
      const names=id==='help-seeking'?['具体困扰','可信任成人','合适支持']:['先问需要','能力范围','连接支持'];
      names.forEach((v,i)=>{const u=ease(ramp(p,i*.15,.5+i*.15));const x=790+i*400,y=370+i%2*220;node(ctx,v,x,y,110,i===2?GOLD:BLUE,u);if(i)link([x-290,370+(i-1)%2*220],[x-110,y],u,TEAL);else link([520,520],[680,y],u,BLUE);});
      if(stage===3){ring(ctx,400,520,200,GOLD,3,r);label('自己的限度',400,780,GOLD,35);}
      words(id==='help-seeking'?['把困难说具体，比独自猜诊断有用','说明它怎样影响睡眠、学习或生活','可以从一位可信任成人开始','一起联系合适支持或专业评估','求助是过程，可以再找一条路']:['问一句：你现在需要什么','陪伴不等于替对方承担全部','实际帮助，也是一种支持','也照顾自己的能力与限度','需要时，连接成人与专业支持']);break;
    }
    case 'boundaries': {
      const d=mix(650,stage===1?480:580,q);disk(960-d/2,480,270,BLUE);disk(960+d/2,480,270,GOLD);
      label('我能做的',960-d/2-50,430,BLUE,48);label('你的需要',960+d/2+50,530,GOLD,48);
      if(stage>1){panel(ctx,820,330,280,280,TEAL,r,15);label('可协商',960,430,TEAL,43);label('下一步',960,525,INK,43);}
      words(['先分清需要与现实限度','表达能做什么，也表达做不到什么','边界不只是拒绝，也可以协商','安全与尊重，是协商的条件','共同找到一个可行的下一步']);break;
    }
    case 'correlation': {
      if(stage===0||stage===1){
        label('两种现象一起增加',960,250,GOLD,65);
        for(let i=0;i<9;i++){const x=400+i*140,y1=650-i*32,y2=680-i*30;dot(ctx,x,y1,8,BLUE);dot(ctx,x,y2,8,GOLD);if(i){line(ctx,x-140,y1+32,x,y1,BLUE,4,q);line(ctx,x-140,y2+30,x,y2,GOLD,4,q);}}
        label('示意趋势，没有真实数值',960,780,MUTED,30);
      }else{
        node(ctx,'冰淇淋销量',430,570,135,BLUE,q);node(ctx,'树荫下人数',1490,570,135,GOLD,q);node(ctx,'天气更热？',960,260,125,TEAL,q);
        ctx.setLineDash([12,12]);link([860,340],[550,490],r,TEAL);link([1060,340],[1370,490],r,TEAL);ctx.setLineDash([]);
      }
      words(['一起变化，是需要解释的现象','它还没有告诉我们因果方向','可以提出一个共同原因的猜想','箭头是候选解释，仍需研究检验','检查设计，再决定能说到哪一步']);break;
    }
    case 'sampling': {
      for(let i=0;i<60;i++){const x=310+i%12*118,y=280+Math.floor(i/12)*100;const picked=stage===0?i%12<3:stage===1?i%12<3&&i%3!==0:stage===2?i%5===0:stage===3?i%7===0:i%6===0;person(ctx,x,y,.25,picked?GOLD:BLUE+'44');if(picked)ring(ctx,x,y-15,32,GOLD,2,r);}
      if(stage<2){line(ctx,610,190,610,760,GOLD,3);label('只有这一侧？',420,790,GOLD,38);}
      words(['抽样入口，可能只覆盖一小部分人','被邀请，也不代表一定会回应','先说清想了解哪个人群','检查遗漏与回应过程','结论不能超出样本实际覆盖范围']);break;
    }
    case 'replication': {
      const names=stage===0?['问题','方法','材料']:stage===1?['同一问题','再次研究','保留记录']:stage===2?['相近结果','不同结果','检查条件']:stage===3?['设计质量','公开报告','更多研究']:['比较','修正','累积'];
      names.forEach((v,i)=>{const u=ease(ramp(p,i*.14,.48+i*.14));const x=440+i*530;ctx.save();ctx.translate(x,480+(1-u)*300);ctx.rotate((i-1)*.05*q);panel(ctx,-180,-220,360,440,i===2?GOLD:BLUE);label(v,0,-110,i===2?GOLD:INK,45);for(let j=0;j<5;j++)line(ctx,-125,-20+j*48,125-j%2*80,-20+j*48,BLUE+'70',3,r);ctx.restore();});
      words(['把问题、方法和材料说清楚','重复研究，需要留下可比较的记录','不同结果，带来新的追问','一次成功或失败，都不是整段结论','让证据在比较与修正中累积']);break;
    }
    case 'confirmation-bias': {
      const nums=stage===0?['2','4','6']:stage===1?['8','10','12']:stage===2?['3','5','7']:stage===3?['4','3','2']:['偶数递增？','任意递增？','怎样区分？'];
      nums.forEach((v,i)=>{const u=ease(ramp(p,i*.16,.48+i*.16));panel(ctx,260+i*550,310+(1-u)*300,440,330,i===1?GOLD:BLUE);label(v,480+i*550,475+(1-u)*300,i===1?GOLD:INK,stage===4?48:150);});
      words(['一个符合规则的例子：2、4、6','再试偶数，仍无法区分两种解释','试试3、5、7：若接受，偶数猜想就不够','递减例子，可检验“递增”这个猜想','寻找能让不同解释给出不同预测的测试']);break;
    }
    case 'test-validity': {
      if(stage<2){clock(ctx,700,490,205,-.7+q*.025,GOLD);for(let i=0;i<4;i++)label('一致读数',1260,300+i*125,i%2?BLUE:GOLD,55);}
      else if(stage===2){clock(ctx,420,485,145,-.7,GOLD);line(ctx,790,550,1610,550,BLUE,6);for(let i=0;i<21;i++)line(ctx,790+i*41,550,790+i*41,550-(i%5?25:55),BLUE,3);label('要测距离',1210,340,INK,80);label('用途需要另一类证据',1210,700,GOLD,42);}
      else{const names=stage===3?['一致性','误差','用途证据']:['测什么','怎样解释','用来做什么'];names.forEach((v,i)=>node(ctx,v,440+i*530,480,130,i===2?GOLD:BLUE,ease(ramp(p,i*.14,.5+i*.14))));}
      words(['重复读数，可以很稳定','稳定是信度问题的一部分','稳定的表，不能因此用来测距离','效度关乎解释和用途的证据','先说清用途，再讨论证据够不够']);break;
    }
    case 'gratitude': {
      book(ctx,960,480,2.6,1,BLUE);const left=stage===0?'今天很难':stage===1?'事情仍没解决':'困难仍在';
      const right=stage===0?'也有一件支持':stage===1?'有人陪我整理':'如实记录';
      label(left,675,390,INK,44);label(right,1230,390,GOLD,42);
      for(let i=0;i<5;i++){line(ctx,580,470+i*50,800,470+i*50,BLUE+'80',3,q);line(ctx,1100,470+i*50,1350,470+i*50,GOLD+'80',3,r);}
      words(['困难与支持，可以写在同一页','记录一件具体得到的支持','不要求自己立刻变开心','研究中的平均效果，不是个人保证','如果记录增加负担，可以调整或暂停']);break;
    }
    default:return false;
  }
  return true;
}
