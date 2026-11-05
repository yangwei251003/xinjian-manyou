import test from 'node:test';
import assert from 'node:assert/strict';
import {handleInteraction,handleTrait} from '../src/interactions.js';
const makeNode=(dataset={})=>({dataset,attributes:{},innerHTML:'',textContent:'',hidden:false,value:50,classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];},hasAttribute(k){return Object.hasOwn(this.dataset,k.replace(/^data-/,'').replace(/-([a-z])/g,(_,x)=>x.toUpperCase()));},closest(sel){return sel==='button'?this:null;}});
function environment(entries){globalThis.document={querySelector:s=>{assert.ok(entries[s],`Missing fixture: ${s}`);return entries[s];}};}
test('six decision mechanisms handle each choice and reset without scores',()=>{
 for(const id of ['reappraisal','listening','sunk-cost','habits','memory','metacognition']){
  const options=Array.from({length:3},(_,i)=>makeNode({decision:id,option:String(i)}));const result=makeNode();const area={querySelectorAll:()=>options,querySelector:()=>result};
  for(const [i,b] of options.entries()){b.closest=s=>s==='button'?b:s==='.decision-simulator'?area:null;assert.equal(handleInteraction(b),true);assert.ok(result.innerHTML.length>50);assert.equal(options.filter(x=>x.attributes['aria-pressed']==='true').length,1);assert.equal(options[i].attributes['aria-pressed'],'true');}
  const reset=makeNode({decisionReset:id});reset.closest=s=>s==='button'?reset:area;assert.equal(handleInteraction(reset),true);assert.ok(options.every(x=>x.attributes['aria-pressed']==='false'));assert.match(result.innerHTML,/不会保存/);
 }
});
test('retrieval and third factor reveal repeat and restore exact state',()=>{
 const material=makeNode(),prompt=makeNode(),factor=makeNode();factor.hidden=true;environment({'#retrieval-material':material,'#retrieval-prompt':prompt,'#third-factor':factor});
 const retrieval=makeNode({retrieval:''});assert.equal(handleInteraction(retrieval),true);assert.equal(material.hidden,true);assert.equal(prompt.hidden,false);assert.equal(retrieval.attributes['aria-expanded'],'false');handleInteraction(retrieval);assert.equal(material.hidden,false);assert.equal(prompt.hidden,true);
 const third=makeNode({thirdFactor:''});handleInteraction(third);assert.equal(factor.hidden,false);assert.equal(third.attributes['aria-expanded'],'true');handleInteraction(third);assert.equal(factor.hidden,true);assert.equal(third.attributes['aria-expanded'],'false');
});
test('framing switches complementary quantities and attribution distinguishes inference',()=>{
 const frame=makeNode(),lens=makeNode();environment({'#frame-number':frame,'#lens-result':lens});
 const gain=makeNode({frame:'gain'}),loss=makeNode({frame:'loss'});gain.parentElement=loss.parentElement={querySelectorAll:()=>[gain,loss]};handleInteraction(loss);assert.match(frame.innerHTML,/10<span>/);handleInteraction(gain);assert.match(frame.innerHTML,/90<span>/);assert.equal(gain.attributes['aria-pressed'],'true');
 const inference=makeNode({lens:'inference'}),context=makeNode({lens:'context'});inference.parentElement=context.parentElement={querySelectorAll:()=>[inference,context]};handleInteraction(inference);assert.match(lens.innerHTML,/不是已经知道的事实/);handleInteraction(context);assert.match(lens.innerHTML,/阿澈.*社团排练/);
});
test('trait range endpoints remain contextual, no diagnosis',()=>{const output=makeNode(),description=makeNode();environment({'#trait-value':output,'#trait-description':description});const control=makeNode({trait:''});control.value=0;handleTrait(control);assert.equal(output.textContent,'0 / 100');assert.match(description.textContent,/不等于/);control.value=100;handleTrait(control);assert.equal(output.textContent,'100 / 100');assert.match(description.textContent,/不等于/);});
