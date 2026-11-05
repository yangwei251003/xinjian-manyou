import {filmMarkup,startLessonFilm,showFilmTranscript,fullscreenLessonFilm,disposeLessonFilms} from './films.js';
import {escapeHTML as e} from './core.js';
const collection=document.querySelector('#collection');
try{
 const response=await fetch('assets/film-collection.json');if(!response.ok)throw Error('目录暂时未能加载');const films=await response.json();
 collection.innerHTML=films.map((film,i)=>`<article id="watch-${e(film.filmId)}">${filmMarkup(film).replace('id="film"','id="film-'+i+'"').replaceAll('film-title','film-title-'+i)}</article>`).join('');
 document.querySelector('#index').innerHTML=films.map((f,i)=>`<a href="#watch-${e(f.filmId)}">${String(i+1).padStart(2,'0')} ${e(f.relatedLessons.map(l=>l.title).join(' / '))}</a>`).join('');
 collection.querySelectorAll('a[href^="#/story/"]').forEach(a=>a.href='index.html'+a.getAttribute('href'));
 collection.querySelectorAll('a[href="films.html"]').forEach(a=>a.parentElement.remove());
 if(location.hash)requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
}catch(error){collection.textContent=error.message+'，请刷新后重试。';}
document.addEventListener('click',event=>{
 const start=event.target.closest('[data-film-start]');if(start){const active=start.closest('.lesson-film');collection.querySelectorAll('.lesson-film').forEach(section=>{if(section!==active)section.querySelectorAll("video").forEach(v=>v.pause());});startLessonFilm(start);}
 const full=event.target.closest('[data-film-fullscreen]');if(full)fullscreenLessonFilm(full);
});
collection.addEventListener('toggle',event=>{if(event.target.matches('[data-film-transcript]'))showFilmTranscript(event.target);},true);
