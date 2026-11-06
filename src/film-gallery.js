import {escapeHTML as escape} from './core.js';
import {
  disposeLessonFilms, filmMarkup, fullscreenLessonFilm, showFilmTranscript, startLessonFilm,
} from './films.js';

const list = document.querySelector('#film-list');
const player = document.querySelector('#now-playing');
let collection = [];

function filmHash(id) {
  return '#watch-' + encodeURIComponent(id);
}

function tile(film, index) {
  const accent = /^#[a-f0-9]{6}$/i.test(film.color) ? film.color : '#325c51';
  return `<article class="film-tile" style="--film-accent:${accent}">
    <a class="film-tile-link" href="${filmHash(film.filmId)}">
      <img class="film-tile-poster" src="${escape(film.poster)}" alt=""
        width="1280" height="720" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async">
      <div class="film-tile-body">
        <div class="film-tile-meta"><span>${escape(film.style)}</span><span>${Math.round(film.duration)} 秒</span></div>
        <h2 class="film-tile-title">${escape(film.title)}</h2>
      </div>
    </a>
  </article>`;
}

function selectFilm() {
  const selected = collection.find(film => filmHash(film.filmId) === location.hash);
  disposeLessonFilms(player);
  player.hidden = !selected;
  player.innerHTML = selected ? filmMarkup({...selected, collection:false}) : '';
  for (const link of list.querySelectorAll('a')) {
    if (link.hash === location.hash) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  if (selected) {
    for (const link of player.querySelectorAll('a[href^="#/story/"]')) {
      link.href = 'index.html' + link.getAttribute('href');
    }
    requestAnimationFrame(() => player.scrollIntoView({block:'start'}));
  }
}

player.addEventListener('click', event => {
  const start = event.target.closest('[data-film-start]');
  if (start) startLessonFilm(start);
  const fullscreen = event.target.closest('[data-film-fullscreen]');
  if (fullscreen) fullscreenLessonFilm(fullscreen);
});
player.addEventListener('toggle', event => {
  if (event.target.matches('[data-film-transcript]')) showFilmTranscript(event.target);
}, true);
window.addEventListener('hashchange', selectFilm);

try {
  const response = await fetch('assets/film-collection.json');
  if (!response.ok) throw Error('短片目录暂时无法加载');
  collection = await response.json();
  list.innerHTML = collection.map(tile).join('');
  selectFilm();
} catch {
  list.textContent = '短片目录暂时无法加载，请刷新页面。';
} finally {
  list.removeAttribute('aria-busy');
}
