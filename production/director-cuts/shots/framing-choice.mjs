import {W,H,PI,mix,phase,fill,rect,round,poly,line,ellipse,gradient,grain,clip,saved,T,withAlpha} from '../drawing.mjs';

const cream='#ffefd0', ink='#71352d', coral='#c94e38', teal='#2c7b74', gold='#efae53';
function press(c,tone=coral){
  fill(c,tone);
  for(let i=-4;i<16;i++)line(c,[[i*144,-40],[i*144+499,H]],'#fff1d62b',21);
  grain(c,919,.92);
}
function population(c,x,y,spacing,scale=1,highlight='both'){
  for(let i=0;i<100;i++){
    const selected=i<90;
    const color=highlight==='both'||highlight===(selected?'win':'miss') ? (selected?teal:coral) : '#bca98a';
    const a=x+i%10*spacing,b=y+Math.floor(i/10)*spacing;
    if(selected)round(c,a,b,spacing*.72*scale,spacing*.72*scale,spacing*.2,color);
    else {
      rect(c,a,b,spacing*.72*scale,spacing*.72*scale,color);
      line(c,[[a+4,b+4],[a+spacing*.58,b+spacing*.58]],cream,1.8);
    }
  }
}
function ticket(c,x,y,angle,face,scale=1){
  const squeeze=Math.abs(Math.cos(angle));
  saved(c,()=>{
    c.translate(x,y);c.scale(Math.max(.015,squeeze)*scale,scale);
    const side=face==='win';
    round(c,-566,-241,1158,504,21,'#78332957');
    round(c,-580,-257,1160,502,17,cream);
    rect(c,-577,-255,302,500,side?teal:ink);
    for(let i=0;i<11;i++){
      ellipse(c,-580,-231+45*i,11,11,coral);
      ellipse(c,580,-231+45*i,11,11,coral);
    }
    line(c,[[409,-232],[409,217]],'#a88669',2,[7,10]);
    if(squeeze>.19){
      T(c,'体验券',-429,-108,52,cream,{align:'center',font:'StudioPlay',weight:400});
      T(c,'100 人',-426,38,67,cream,{align:'center',weight:900});
      T(c,'同一次抽签',-426,125,28,cream,{align:'center'});
      T(c,side?'90':'10',68,91,253,side?teal:coral,{align:'center',weight:900});
      T(c,side?'人抽中':'人没抽中',61,176,46,ink,{align:'center',font:'StudioPlay',weight:400});
      for(let j=0;j<13;j++)rect(c,464+j*5,-157,2+j%3,297,j%2?ink:teal);
    }
  });
}
function label(c,x,y,text,tint){
  saved(c,()=>{
    c.translate(x,y);c.rotate(.037);
    round(c,-241,-152,482,303,29,'#cf7153',ink,5);
    for(let j=0;j<7;j++)line(c,[[-212,-122+j*37],[211,-119+j*37]],'#e99574',4);
    rect(c,-187,-83,372,151,cream);
    T(c,text,0,14,58,tint,{align:'center',font:'StudioPlay',weight:400,max:344});
    T(c,'同类食品属性示意',0,120,23,'#f9e1b0',{align:'center'});
  });
}
export const shots={
  ticket(c,p){
    press(c);
    T(c,'一张票的两面',95,127,86,cream,{font:'StudioPlay',weight:400});
    T(c,'抽签结果 / 正面',1486,117,31,cream,{align:'right'});
    ticket(c,800,mix(707,447,phase(p,.03,.48)),0,'win');
  },
  flip(c,p){
    press(c);
    const a=PI*phase(p,.14,.78);
    ticket(c,800,432,a,a<PI/2?'win':'miss');
    T(c,'翻到另一面',96,127,77,cream,{font:'StudioPlay',weight:400});
    T(c,'仍然是这 100 人',1484,742,44,cream,{align:'right'});
  },
  ink(c,p){
    fill(c,cream);
    const a=phase(p,.18,.72);
    population(c,618,153,51,1,p<.37?'win':p<.65?'miss':'both');
    rect(c,607,147+510*a,526,5,'#d1b083');
    T(c,'同一张网格',87,236,63,ink,{font:'StudioPlay',weight:400});
    T(c,'100',82,453,172,coral,{weight:900});
    T(c,'固定分母',94,526,42,ink);
    T(c,'90 抽中',1194,327,52,teal,{font:'StudioPlay',weight:400});
    T(c,'10 没抽中',1194,432,52,coral,{font:'StudioPlay',weight:400});
    T(c,'框架效应',1480,723,43,ink,{align:'right'});
    grain(c,920,.8);
  },
  package(c,p){
    press(c,'#2d7b73');
    T(c,'标签会改变第一印象',84,145,76,cream,{font:'StudioPlay',weight:400});
    label(c,442,419,'75% 瘦肉',teal);
    label(c,1156,419,'25% 脂肪',coral);
    const a=phase(p,.43,.72);
    withAlpha(c,a,()=>{
      ellipse(c,805,646,108,55,'#f2dfb9');
      line(c,[[740,651],[839,628]],'#8f755e',12);
      T(c,'品尝后，影响减弱',805,750,39,cream,{align:'center'});
    });
    T(c,'Levin & Gaeth · 1988',1483,124,27,cream,{align:'right'});
  },
  'two-choices'(c,p){
    fill(c,cream);
    const a=phase(p,.23,.78);
    rect(c,0,0,740,900,'#f3cb84');
    T(c,'同一个属性',93,149,69,ink,{font:'StudioPlay',weight:400});
    population(c,175,249,42,.93);
    T(c,'同一批人，换个说法',97,749,37,ink);
    T(c,'两个选择方案',863,149,69,ink,{font:'StudioPlay',weight:400});
    const y=435;
    line(c,[[884,y],[1091,y],[1345,312]],teal,11);
    line(c,[[1091,y],[1345,592]],coral,11);
    ellipse(c,884,y,23,23,ink);ellipse(c,1345,312,26,26,teal);ellipse(c,1345,592,26,26,coral);
    withAlpha(c,a,()=>{T(c,'确定结果',1341,268,39,teal,{align:'center'});T(c,'有风险的结果',1344,683,39,coral,{align:'center'});});
  },
  'both-sides'(c,p){
    press(c);
    round(c,81,148,1439,597,19,cream);
    population(c,145,212,46,1);
    T(c,'把两面写进同一句',697,246,63,ink,{font:'StudioPlay',weight:400});
    const a=phase(p,.12,.48);
    withAlpha(c,a,()=>T(c,'90 人抽中',696,419,79,teal,{weight:880}));
    withAlpha(c,phase(p,.35,.76),()=>T(c,'10 人没抽中',696,582,79,coral,{weight:880}));
    T(c,'分母：100 人',699,674,31,ink);
  },
};
