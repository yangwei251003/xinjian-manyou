import {W,H,PI,mix,phase,saved,fill,rect,round,poly,line,ellipse,gradient,grain,clip,T,withAlpha} from '../drawing.mjs';

const board='#263c33', white='#f3ead3', yellow='#ead179', coral='#e68d72', mint='#aad0ae';
function blackboard(c) {
  fill(c,'#b18f6c');
  rect(c,36,34,1528,760,gradient(c,47,64,W,760,[[0,'#365544'],[1,'#24382f']]));
  rect(c,23,784,1554,25,'#755b4d');
  rect(c,127,768,99,15,'#efe3c6');rect(c,258,768,73,15,'#d1a369');
  grain(c,7125,.97);
}
function chalk(c,words,x,y,s,color=white,align='left') {T(c,words,x,y,s,color,{font:'StudioPlay',weight:400,align,leading:1.33});}
function numbers(c,values,x,y,spacing,p,size=149){
  values.forEach((n,i)=>{
    const a=phase(p,i*.12,.27+i*.12);
    withAlpha(c,a,()=>chalk(c,n,x+i*spacing,y+37*(1-a),size,i%2?yellow:white,'center'));
  });
}
function check(c,x,y,size,progress,color=mint){
  clip(c,x,y-size,size*progress+3,size*2,()=>line(c,[[x,y],[x+size*.29,y+size*.33],[x+size,y-size*.45]],color,Math.max(5,size*.14)));
}
function voter(c,x,y,choice,p){
  ellipse(c,x,y-96,46,47,'#688477');
  poly(c,[[x-65,y-45],[x+63,y-45],[x+92,y+97],[x-92,y+97]],'#577365');
  const a=phase(p,.16,.61);
  line(c,[[x+31,y-23],[x+84,y-8-144*a]],'#adc5a4',15);
  rect(c,x+55,y-45-145*a,67,73,white);
  chalk(c,choice,x+89,y+9-145*a,47,board,'center');
}
export const shots = {
  riddle(c,p){
    blackboard(c);
    chalk(c,'2、4、6，试个反例',111,155,79,white);
    numbers(c,[2,4,6],397,449,404,p,178);
    line(c,[[278,489],[1306*phase(p,.28,.69)+278*(1-phase(p,.28,.69)),489]],yellow,7);
    chalk(c,'猜一个规则，再写三个数',800,658,52,yellow,'center');
  },
  positive(c,p){
    blackboard(c);
    chalk(c,'这个例子能分出哪条规则吗？',106,140,62);
    numbers(c,[8,10,12],267,390,236,p,123);
    const a=phase(p,.30,.75);
    line(c,[[795,357],[946,357],[1018,246]],yellow,5);
    line(c,[[946,357],[1018,537]],yellow,5);
    chalk(c,'每次加 2',1068,261,57);
    chalk(c,'只要递增',1068,552,57);
    check(c,1364,232,64,a);check(c,1364,527,64,a);
    chalk(c,'两条规则都接受',1072,667,41,mint);
  },
  counterexample(c,p){
    blackboard(c);
    chalk(c,'试一组会分岔的数',106,142,69);
    numbers(c,[3,5,9],399,405,410,p,167);
    const a=phase(p,.31,.64);
    withAlpha(c,a,()=>{chalk(c,'+2',595,300,43,yellow,'center');chalk(c,'+4',1002,300,43,coral,'center');});
    chalk(c,'每次加 2',256,605,48,white);chalk(c,'只要递增',913,605,48,white);
    withAlpha(c,phase(p,.43,.75),()=>{
      line(c,[[589,553],[638,610]],coral,12);line(c,[[636,552],[588,613]],coral,12);
      check(c,1269,589,68,1);
    });
  },
  'reveal-rule'(c,p){
    blackboard(c);
    chalk(c,'隐藏规则',115,158,51,yellow);
    const steps=[[299,566],[796,427],[1290,288]];
    steps.forEach(([x,y],i)=>{
      withAlpha(c,phase(p,.1*i,.35+.1*i),()=>{
        rect(c,x-94,y,188,52,'#739683');
        chalk(c,[3,5,9][i],x,y-26,90,white,'center');
      });
    });
    chalk(c,'任意三个依次变大的数',800,707,62,yellow,'center');
    chalk(c,'Wason · 1960',1464,147,32,mint,'right');
  },
  'line-study'(c,p){
    blackboard(c);
    chalk(c,'哪条和左边一样长？',112,139,65);
    const baseline=445;
    line(c,[[352,baseline-213],[352,baseline]],white,13);
    line(c,[[525,191],[525,470]],'#a2b3a0',2,[8,12]);
    [139,213,252].forEach((height,i)=>{
      const x=727+i*253;
      line(c,[[x,baseline-height],[x,baseline]],white,13);
      chalk(c,['A','B','C'][i],x,506,43,white,'center');
    });
    for(let i=0;i<3;i++)voter(c,563+i*343,677,'C',p-i*.075);
    chalk(c,'阿希线段实验示意',1438,143,28,mint,'right');
    withAlpha(c,phase(p,.68,.91),()=>ellipse(c,980,341,53,159,null,yellow,4));
  },
  'answer-alone'(c,p){
    blackboard(c);
    chalk(c,'先写下自己的猜想',102,145,62);
    rect(c,246,252,1101,385,'#f3ead0');
    for(let j=0;j<5;j++)line(c,[[284,338+j*57],[1309,338+j*57]],'#8a9a846c',2);
    const a=phase(p,.16,.72);
    clip(c,292,321,1020*a,255,()=>{
      T(c,'如果每次要加 2，3、5、9 就不会通过。',298,412,42,board,{font:'StudioSerif',weight:820,max:1006});
      T(c,'结果通过了，于是我修改猜想。',298,526,42,board,{font:'StudioSerif',weight:760,max:1006});
    });
    chalk(c,'用能分出解释的证据',800,733,49,yellow,'center');
  },
};
