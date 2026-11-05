import {escapeHTML as e,safeURL} from './core.js';

function timeLabel(seconds){
  const whole=Math.floor(seconds);
  return String(Math.floor(whole/60)).padStart(2,'0')+':'+String(whole%60).padStart(2,'0');
}

export function filmMarkup(film){
  if(!film?.src)return '';
  return `<section id="film" class="lesson-film" aria-labelledby="film-title" data-film-src="${e(film.src)}" data-film-meta="${e(film.meta)}">
    <div class="film-heading">
      <div class="section-eyebrow">心间漫游短片 · VIBE STUDIES</div>
      <h2 id="film-title">${e(film.title)}</h2>
      <p>${timeLabel(film.duration)} · 双语字幕 · 器乐配乐</p>
      ${film.relatedLessons?.length?`<p class="film-connections">本片关联：${film.relatedLessons.map(l=>`<a href="#/story/${encodeURIComponent(l.id)}">${e(l.title)}</a>`).join(' · ')}</p>`:''}
      ${film.collection?'<p><a href="films.html">浏览全部 14 支短片 ↗</a></p>':''}
    </div>
    <div class="film-frame">
      <img class="film-poster" src="${e(film.poster)}" alt="" width="1280" height="720" loading="lazy" decoding="async">
      <button class="film-start" data-film-start aria-label="播放短片：${e(film.title)}"><span aria-hidden="true">▶</span>播放短片</button>
    </div>
    <button class="film-fullscreen" data-film-fullscreen hidden>放大全屏 ↗</button>
    <p class="film-status" role="status" hidden></p>
    <div class="film-live" hidden><span lang="zh-CN"></span><span lang="en"></span></div>
    <details class="film-transcript" data-film-transcript>
      <summary>阅读双语分镜文字稿与出处</summary>
      <div class="film-transcript-body"><p>打开后加载这支短片的文字稿。</p></div>
    </details>
  </section>`;
}

const cueRequests=new WeakMap();

function getFilmMeta(section){
  if(cueRequests.has(section))return cueRequests.get(section);
  const request=fetch(section.dataset.filmMeta).then(response=>{
    if(!response.ok)throw new Error('分镜文字稿暂时不可用');
    return response.json();
  }).catch(error=>{
    cueRequests.delete(section);
    throw error;
  });
  cueRequests.set(section,request);
  return request;
}

export async function showFilmTranscript(details){
  if(!details.open || details.dataset.loaded)return;
  const body=details.querySelector('.film-transcript-body');
  try{
    const {cues,sources}=await getFilmMeta(details.closest('.lesson-film'));
    body.innerHTML='<ol>'+cues.map(cue=>`<li><time>${timeLabel(cue.start)}</time><div><strong>${e(cue.zh)}</strong><span lang="en">${e(cue.en)}</span>${cue.visual?`<small>${e(cue.visual)}</small>`:''}</div></li>`).join('')+'</ol><ul class="film-sources">'+sources.map(source=>`<li><a href="${e(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">${e(source.title)}</a></li>`).join('')+'</ul>';
    details.dataset.loaded='true';
  }catch{
    body.textContent='文字稿未能加载。关闭后重新展开可再试一次，或继续阅读本篇课程。';
  }
}

export function startLessonFilm(button){
  const section=button.closest('.lesson-film');
  const frame=section.querySelector('.film-frame');
  if(frame.querySelector('video'))return;
  const status=section.querySelector('.film-status');
  const captions=section.querySelector('.film-live');
  const fullscreen=section.querySelector('[data-film-fullscreen]');
  const zh=captions.querySelector('[lang="zh-CN"]');
  const en=captions.querySelector('[lang="en"]');
  const video=document.createElement('video');
  video.controls=true;
  video.playsInline=true;
  video.preload='none';
  video.poster=frame.querySelector('.film-poster').src;
  video.setAttribute('aria-label',section.querySelector('h2').textContent);
  video.tabIndex=0;
  let activeCue;
  let cues=[];
  function updateCaption(){
    const cue=cues.find(item=>video.currentTime>=item.start&&video.currentTime<item.end);
    if(cue===activeCue)return;
    activeCue=cue;
    captions.hidden=!cue;
    zh.textContent=cue?.zh||'';
    en.textContent=cue?.en||'';
  }
  function showError(){
    if(!video.isConnected)return;
    const restoreFocus=document.activeElement===video||document.activeElement===fullscreen;
    video.remove();
    button.hidden=false;
    captions.hidden=true;
    fullscreen.hidden=true;
    status.hidden=false;
    status.textContent='短片暂时无法播放。可重试，也可展开下方文字稿继续学习。';
    if(restoreFocus)button.focus({preventScroll:true});
  }
  video.addEventListener('timeupdate',updateCaption);
  video.addEventListener('seeked',updateCaption);
  video.addEventListener('error',showError,{once:true});
  status.hidden=true;
  button.hidden=true;
  fullscreen.hidden=false;
  frame.append(video);
  video.src=section.dataset.filmSrc;
  video.focus({preventScroll:true});
  video.play().catch(error=>{
    if(error.name==='NotAllowedError'&&video.isConnected){
      status.hidden=false;
      status.textContent='使用播放器上的播放键开始。';
    }
  });
  getFilmMeta(section).then(meta=>{
    cues=meta.cues;
    if(video.isConnected)updateCaption();
  }).catch(()=>{});
}

export function fullscreenLessonFilm(button){
  const section=button.closest('.lesson-film');
  const video=section.querySelector('video');
  if(!video)return;
  const request=video.requestFullscreen?.()??video.webkitEnterFullscreen?.();
  request?.catch(()=>{
    const status=section.querySelector('.film-status');
    status.hidden=false;
    status.textContent='可使用播放器控制栏的全屏按钮，或在新窗口中查看短片。';
  });
}

export function disposeLessonFilms(root){
  for(const video of root.querySelectorAll?.('video')||[]){
    video.pause();
    video.removeAttribute('src');
    video.load();
  }
}
