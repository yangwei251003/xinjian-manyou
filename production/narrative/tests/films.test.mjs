import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterLessons,exploreURL} from '../src/core.js';
import {filmMarkup} from '../src/films.js';

const read=file=>JSON.parse(readFileSync(new URL(file,import.meta.url),'utf8'));
const lessons=read('../content/lessons.json');
const catalog=read('../content/catalog.json');
const films=read('../assets/film-collection.json');
const media=read('../assets/media.json');

test('v3 searches scientific aliases, body and Chinese discovery names',()=>{
  for(const [query,id] of [
    ['斯特鲁普','attention'],['不注意盲视','attention'],['睡眠不足','sleep'],
    ['重建记忆','memory'],['基本归因错误','attribution'],['分散学习','retrieval'],
    ['积极心理学','gratitude'],['心理测量','test-validity'],
  ])assert.ok(filterLessons(lessons,{q:query,catalog}).some(l=>l.id===id),query);
  assert.equal(filterLessons(lessons,{q:'并不存在的全新术语',catalog}).length,0);
});

test('bookmarks, query, branch and scene remain intersected',()=>{
  const results=filterLessons(lessons,{q:'归因',saved:['attribution'],branch:'social',scene:'friendship',catalog});
  assert.deepEqual(results.map(l=>l.id),['attribution']);
  assert.equal(filterLessons(lessons,{q:'归因',saved:[],catalog}).length,0);
  const hash=exploreURL({q:'归因',branch:'social',scene:'friendship',bookmarked:true});
  const params=new URLSearchParams(hash.split('?')[1]);
  assert.equal(params.get('saved'),'1');
  assert.equal(params.get('q'),'归因');
});

test('shared films cover every lesson and preserve continuous, readable narration',()=>{
  assert.equal(films.length,14);
  const covered=[];
  for(const film of films){
    const script=read('../'+film.meta);
    assert.ok(film.duration>=60&&film.duration<=150);
    assert.equal(script.id,film.filmId);
    for(const id of script.lessonIds){
      assert.equal(media[id].video.src,film.src);
      covered.push(id);
    }
    assert.equal(script.cues[0].start,0);
    assert.ok(Math.abs(script.cues.at(-1).end-film.duration)<.02);
    for(const [i,cue]of script.cues.entries()){
      assert.ok(cue.zh&&cue.en);
      assert.ok(cue.end>cue.start);
      assert.ok(cue.zh.length/(cue.end-cue.start)<=5.1,'allow readable Chinese subtitles');
      if(i)assert.equal(cue.start,script.cues[i-1].end);
    }
  }
  assert.equal(new Set(covered).size,lessons.length);
  assert.equal(covered.length,lessons.length);
});

test('film card is optional, escaped and requests no video before explicit play',()=>{
  assert.equal(filmMarkup(undefined),'');
  assert.equal(filmMarkup({}),'');
  const card=filmMarkup({src:'assets/videos/attention/film.mp4',poster:'poster.webp',meta:'script.json',duration:75.8,title:'<试着看>"'});
  assert.ok(card.includes('data-film-start'));
  assert.ok(card.includes('data-film-transcript'));
  assert.ok(card.includes('&lt;试着看&gt;&quot;'));
  assert.ok(!card.includes('<video'));
  assert.ok(!card.includes('<source'));
  assert.ok(!card.includes('autoplay'));
  assert.ok(card.includes('01:15'));
});
