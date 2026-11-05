/*
 * 心间漫游 · 音乐重剪版
 * Frame-derived scenes. No scene playback loops and no editor-specific contract.
 * Motion curves adapted from MotionGit kinetic-tech 0.2.7 (MIT).
 * Relay arrival choreography adapted from Vincent OrbFlylineRelay (Apache-2.0).
 * Original GLSL transition files retain their MIT notices in reference/gl/.
 */
const WIDTH = 1920;
const HEIGHT = 1080;
const TAU = Math.PI * 2;
const BLUE = '#5eafff';
const GOLD = '#e3bf84';
const TEAL = '#70dfd4';
const INK = '#f3f7ff';
const MUTED = '#a7bbd5';
const BACK = '#080f1d';
const canvas = document.querySelector('#film');
const output = canvas.getContext('2d', {alpha: false});
const sceneA = document.createElement('canvas');
const sceneB = document.createElement('canvas');
for (const surface of [sceneA, sceneB]) {
  surface.width = WIDTH;
  surface.height = HEIGHT;
}
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const mix = (a, b, amount) => a + (b - a) * amount;
const ramp = (time, start, end) => clamp((time - start) / (end - start));
const ease = value => 1 - Math.pow(1 - clamp(value), 3);
const expo = value => value >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(value));
const smooth = value => value < .5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
const hash = seed => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const bezier = (a, b, c, d, t) => {
  const q = 1 - t;
  return [q ** 3 * a[0] + 3 * q * q * t * b[0] + 3 * q * t * t * c[0] + t ** 3 * d[0],
    q ** 3 * a[1] + 3 * q * q * t * b[1] + 3 * q * t * t * c[1] + t ** 3 * d[1]];
};
let episode;
let pictures = [];
let compositor;
let musicAnalysis;

function line(ctx, x1, y1, x2, y2, color = BLUE, width = 3, progress = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(mix(x1, x2, progress), mix(y1, y2, progress));
  ctx.stroke();
}

function glow(ctx, x, y, radius, color = BLUE, opacity = 1) {
  ctx.save();
  ctx.globalAlpha *= opacity;
  const fill = ctx.createRadialGradient(x, y, 0, x, y, radius);
  fill.addColorStop(0, color + '70');
  fill.addColorStop(.18, color + '25');
  fill.addColorStop(1, color + '00');
  ctx.fillStyle = fill;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function dot(ctx, x, y, radius = 5, color = BLUE) {
  glow(ctx, x, y, radius * 9, color);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

function ring(ctx, x, y, radius, color = BLUE, width = 3, progress = 1, rotation = -Math.PI / 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius), rotation, rotation + TAU * clamp(progress));
  ctx.stroke();
}

function panel(ctx, x, y, width, height, color = BLUE, opacity = 1, radius = 20) {
  ctx.save();
  ctx.globalAlpha *= opacity;
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, '#203751');
  gradient.addColorStop(.55, '#101d32');
  gradient.addColorStop(1, '#0b1426');
  ctx.fillStyle = gradient;
  ctx.strokeStyle = color + 'a0';
  ctx.lineWidth = 2;
  ctx.shadowColor = color + '40';
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.stroke();
  line(ctx, x + radius, y + 2, x + width - radius, y + 2, '#d4e8ff30', 1);
  ctx.restore();
}

function text(ctx, value, x, y, size = 40, color = INK, align = 'center', weight = 500, family = 'FilmSans') {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const resolvedFamily = family === 'Anton' && /[^\x00-\x7f]/.test(String(value)) ? 'FilmSans' : family;
  ctx.font = `${weight} ${size}px ${resolvedFamily}`;
  ctx.fillText(String(value), x, y);
}

function wrap(ctx, value, x, y, width, size = 42, color = INK, maxLines = 4) {
  ctx.font = `500 ${size}px FilmSans`;
  const lines = [];
  let current = '';
  for (const char of String(value)) {
    if (char === '\n' || ctx.measureText(current + char).width > width) {
      lines.push(current);
      current = char === '\n' ? '' : char;
    } else current += char;
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) throw new Error('Text requires another shot: ' + value);
  const top = y - (lines.length - 1) * size * .72;
  lines.forEach((value, index) => text(ctx, value, x, top + index * size * 1.44, size, color));
  return lines.length;
}

function arrow(ctx, from, to, progress, color = BLUE, width = 3) {
  line(ctx, ...from, ...to, color, width, progress);
  if (progress < .15) return;
  const x = mix(from[0], to[0], progress);
  const y = mix(from[1], to[1], progress);
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  line(ctx, x, y, x - 16 * Math.cos(a - .45), y - 16 * Math.sin(a - .45), color, width);
  line(ctx, x, y, x - 16 * Math.cos(a + .45), y - 16 * Math.sin(a + .45), color, width);
}

function tag(ctx, value, x, y, color = BLUE, width = 250) {
  panel(ctx, x - width / 2, y - 31, width, 62, color, 1, 10);
  text(ctx, value, x, y, value.length > 11 ? 25 : 30, color);
}

function node(ctx, value, x, y, radius = 84, color = BLUE, lit = 0) {
  glow(ctx, x, y, radius * 2.7, color, .25 + lit * .65);
  const fill = ctx.createRadialGradient(x - radius * .25, y - radius * .4, 0, x, y, radius);
  fill.addColorStop(0, '#2a4566');
  fill.addColorStop(1, '#0d192a');
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
  ring(ctx, x, y, radius, color + 'b0', 2 + lit * 2);
  wrap(ctx, value, x, y, radius * 1.6, value.length > 5 ? 27 : 34, lit > .5 ? INK : color, 3);
}

function person(ctx, x, y, size = 1, color = BLUE) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ring(ctx, 0, -88, 35, color, 4);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-76, 90);
  ctx.lineTo(-76, 7);
  ctx.bezierCurveTo(-76, -62, 76, -62, 76, 7);
  ctx.lineTo(76, 90);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function book(ctx, x, y, scale = 1, opening = 1, color = BLUE) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const span = 30 + opening * 130;
  ctx.fillStyle = '#142b43';
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -108);
    ctx.quadraticCurveTo(side * span * .55, -140, side * span, -108);
    ctx.lineTo(side * span, 120);
    ctx.quadraticCurveTo(side * span * .5, 86, 0, 120);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 5; i++) line(ctx, side * span * .18, -66 + i * 33, side * span * .82, -60 + i * 33, color + '77', 2);
  }
  line(ctx, 0, -108, 0, 120, GOLD, 3);
  ctx.restore();
}

function clock(ctx, x, y, radius, angle, color = GOLD) {
  ring(ctx, x, y, radius, color, 3);
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU;
    const inner = i % 5 ? .92 : .83;
    line(ctx, x + Math.cos(a) * radius * inner, y + Math.sin(a) * radius * inner,
      x + Math.cos(a) * radius, y + Math.sin(a) * radius, color + (i % 5 ? '55' : 'cc'), i % 5 ? 1 : 3);
  }
  line(ctx, x, y, x + Math.cos(angle) * radius * .72, y + Math.sin(angle) * radius * .72, color, 5);
  line(ctx, x, y, x + radius * .2, y - radius * .4, INK, 5);
  dot(ctx, x, y, 5, color);
}

function robot(ctx, x, y, scale, reveal, exploded = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  panel(ctx, -155, -120 - exploded * 50, 310, 235, BLUE, 1, 35);
  ring(ctx, -104 - exploded * 25, 139 + exploded * 65, 38, GOLD, 7);
  ring(ctx, 104 + exploded * 25, 139 + exploded * 65, 38, GOLD, 7);
  line(ctx, 0, -120 - exploded * 50, 0, -167 - exploded * 100, BLUE, 4);
  dot(ctx, 0, -172 - exploded * 100, 9, reveal > .55 ? GOLD : BLUE);
  ring(ctx, -62, -34, 21, GOLD, 4);
  ctx.strokeStyle = BLUE;
  ctx.beginPath();
  ctx.moveTo(58, -59);ctx.lineTo(84, -12);ctx.lineTo(32, -12);ctx.closePath();ctx.stroke();
  for (let i = 0; i < 5; i++) line(ctx, -95 + i * 47, 60, -73 + i * 47, 60, BLUE + '80', 4);
  ctx.restore();
}

function phone(ctx, x, y, scale = 1, opened = 1) {
  ctx.save();ctx.translate(x, y);ctx.scale(scale, scale);
  panel(ctx, -125, -215, 250, 430, BLUE, 1, 34);
  line(ctx, -35, -191, 35, -191, MUTED, 4);
  panel(ctx, -96, -90, 192, 110, GOLD, opened, 18);
  if (opened > .2) text(ctx, '未回复', 0, -35, 34, GOLD);
  for (let i = 0; i < 3; i++) dot(ctx, -25 + i * 25, 148, 4, BLUE);
  ctx.restore();
}

function glyph(ctx, type, x, y, scale, p, variant = 0) {
  ctx.save();ctx.translate(x, y);ctx.scale(scale, scale);
  if (type === 'field') {
    const shapes = ['○', '△', '□'];
    for (let i = 0; i < 24; i++) {
      const selected = i % 3 === variant % 3;
      ctx.globalAlpha = selected ? 1 : 1 - p * .6;
      text(ctx, shapes[i % 3], -245 + i % 6 * 98, -150 + Math.floor(i / 6) * 100, 60, selected ? GOLD : BLUE);
    }
    ctx.globalAlpha = 1;
  }
  else if (type === 'robot') robot(ctx, 0, 0, 1, p, variant === 1 ? ease(p) : 0);
  else if (type === 'book' || type === 'journal') {
    book(ctx, 0, 0, 1, type === 'journal' ? 1 : 1 - ease(p));
    if (type === 'journal') {
      for (let i = 0; i < 5; i++) arrow(ctx, [-95 + i * 35, -200], [-110 + i * 35, -150], ease(p), BLUE);
      ring(ctx, 78, -50, 45, GOLD, 4, .5, Math.PI);
      line(ctx, 78, -50, 78, 60, GOLD, 4);
    }
  } else if (type === 'phone') phone(ctx, 0, 0, .9, ease(p));
  else if (type === 'clock' || type === 'ruler') {
    clock(ctx, type === 'ruler' ? -155 : 75, 0, 125, -.7 + p * 2.4, BLUE);
    if (type === 'ruler') {
      ctx.save();ctx.translate(160, 0);ctx.rotate(-.2 + p * .25);
      panel(ctx, -110, -42, 220, 84, GOLD, 1, 6);
      for (let i = 0; i < 14; i++) line(ctx, -100 + i * 15, -40, -100 + i * 15, i % 5 ? -16 : 0, GOLD, 2);
      ctx.restore();
    } else {
      ctx.fillStyle = GOLD + '55';ctx.beginPath();ctx.arc(-180, -35, 92, 0, TAU);ctx.fill();
      ctx.fillStyle = '#0d192a';ctx.beginPath();ctx.arc(-145, -61, 82, 0, TAU);ctx.fill();
    }
  } else if (type === 'door' || type === 'window' || type === 'harbor') {
    panel(ctx, -120, -180, 240, 350, BLUE, 1, 5);
    line(ctx, 0, -180, 0, 170, GOLD, 3);
    arrow(ctx, [-230, 40], [220, -70], ease(p), TEAL, 4);
    dot(ctx, 62, -5, 8, GOLD);
  } else if (type === 'matrix') {
    for (let i = 0; i < 100; i++) {
      const reveal = ease(clamp(p * 2 - i / 100));
      ctx.globalAlpha = reveal;
      const color = i < 90 ? BLUE : GOLD;
      ctx.fillStyle = color;
      ctx.beginPath();ctx.arc(-144 + i % 10 * 32, -144 + Math.floor(i / 10) * 32, 8, 0, TAU);ctx.fill();
    }
    ctx.globalAlpha = 1;
    text(ctx, '90 / 100', 0, 220, 52, BLUE);
  } else if (type === 'rule') {
    const numbers = variant % 2 ? ['3', '5', '7'] : ['2', '4', '6'];
    numbers.forEach((number, i) => {
      panel(ctx, -263 + i * 190, -100 + (1 - ease(clamp(p * 2 - i * .2))) * 150, 146, 200, i === 1 ? GOLD : BLUE);
      text(ctx, number, -190 + i * 190, 0, 100, i === 1 ? GOLD : INK, 'center', 400, 'Anton');
    });
  } else if (type === 'weather') {
    ring(ctx, -135, -45, 70, BLUE, 4, .6, Math.PI);
    line(ctx, -205, -45, -65, -45, BLUE, 4);
    for (let i = 0; i < 5; i++) line(ctx, -200 + i * 32, 0 + p * 55, -215 + i * 32, 37 + p * 55, BLUE, 3);
    ring(ctx, 155, -30, 70, GOLD, 4);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU;
      line(ctx, 155 + Math.cos(a) * 88, -30 + Math.sin(a) * 88, 155 + Math.cos(a) * 112, -30 + Math.sin(a) * 112, GOLD, 3);
    }
  } else if (type === 'sliders' || type === 'calibration') {
    for (let i = 0; i < 5; i++) {
      const y = -150 + i * 76;
      line(ctx, -230, y, 230, y, BLUE + '60', 5);
      const v = .18 + hash(i + episode.seed) * .66;
      dot(ctx, mix(-230, 230, mix(.5, v, ease(p))), y, 10, i === variant % 5 ? GOLD : BLUE);
    }
  } else if (['crowd', 'people', 'support', 'dialogue'].includes(type)) {
    for (let i = 0; i < (type === 'crowd' ? 5 : 3); i++) {
      const number = type === 'crowd' ? 5 : 3;
      person(ctx, (i - (number - 1) / 2) * 130, (i % 2) * 35, .66, i === number - 1 ? GOLD : BLUE);
    }
    arrow(ctx, [-220, -180], [220, -180], ease(p), GOLD);
  } else if (type === 'papers' || type === 'tiles' || type === 'gallery') {
    const count = type === 'tiles' ? 9 : 5;
    for (let i = 0; i < count; i++) {
      const x = type === 'tiles' ? (i % 3 - 1) * 120 : (i - 2) * 86;
      const y = type === 'tiles' ? (Math.floor(i / 3) - 1) * 110 : Math.abs(i - 2) * 28;
      panel(ctx, x - 50, y - 80 + (1 - ease(clamp(p * 2 - i * .08))) * 170, 100, 145, i === 2 ? GOLD : BLUE, 1, 6);
      if (type !== 'tiles') text(ctx, String(i + 1), x, y, 42, GOLD, 'center', 400, 'Anton');
    }
  } else if (type === 'load') {
    person(ctx, 0, 105, 1.1);
    for (let i = 0; i < 3; i++) panel(ctx, -230 + i * 160, -215 - ease(p) * 15 * i, 140, 84, i === 2 ? GOLD : BLUE);
    arrow(ctx, [-170, -130], [0, -40], ease(p), BLUE);
    arrow(ctx, [170, -160], [0, -40], ease(p), GOLD);
  } else if (type === 'causal') {
    node(ctx, '冰淇淋', -210, 100, 72);
    node(ctx, '树荫', 210, 100, 72, GOLD);
    node(ctx, '天气？', 0, -120, 72, TEAL);
    arrow(ctx, [-50, -60], [-165, 35], ease(p), TEAL);
    arrow(ctx, [50, -60], [165, 35], ease(p), TEAL);
  } else if (type === 'sample') {
    for (let i = 0; i < 48; i++) {
      const x = -250 + i % 8 * 72;
      const y = -145 + Math.floor(i / 8) * 63;
      ring(ctx, x, y, 12, i < 24 ? BLUE : TEAL, 3);
    }
    ctx.strokeStyle = GOLD;ctx.lineWidth = 4;ctx.setLineDash([12, 10]);
    ctx.strokeRect(-290 + ease(p) * 70, -195, 300 + ease(p) * 220, 410);
    ctx.setLineDash([]);
  } else {
    const points = Array.from({length: type === 'brain' ? 18 : 8}, (_, i) => {
      const a = i * 2.399;
      return [Math.cos(a) * Math.sqrt(i + 1) * 63, Math.sin(a) * Math.sqrt(i + 1) * 48];
    });
    points.forEach((point, i) => {
      if (i) line(ctx, ...points[Math.floor((i - 1) / 2)], ...point, BLUE + '70', 2, ease(clamp(p * 2 - i / points.length)));
      dot(ctx, ...point, i === variant % points.length ? 9 : 5, i % 3 ? BLUE : GOLD);
    });
  }
  ctx.restore();
}

function background(ctx, shot, p, time) {
  ctx.resetTransform();ctx.globalAlpha = 1;ctx.globalCompositeOperation = 'source-over';ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  const lightX = 600 + (shot.index % 4) * 250 + p * 100;
  const fill = ctx.createRadialGradient(lightX, 380, 20, 950, 540, 1250);
  fill.addColorStop(0, '#142943');fill.addColorStop(.5, '#0b1629');fill.addColorStop(1, '#060b15');
  ctx.fillStyle = fill;ctx.fillRect(0, 0, WIDTH, HEIGHT);
  glow(ctx, 450 + shot.index % 3 * 450, 490, 620, shot.index % 3 ? BLUE : TEAL, .14);
  // Background drift spans longer than the complete film; it is not the subject action.
  for (let i = 0; i < 120; i++) {
    const x = (hash(i * 3 + episode.seed) * 2300 - time * (1 + i % 4) + 2500) % 2300 - 150;
    const y = hash(i * 7 + 5) * 1300 - time * .6 - 80;
    ctx.fillStyle = i % 8 ? '#84b9dd50' : '#edc58770';
    ctx.beginPath();ctx.arc(x, y, .7 + hash(i) * 1.6, 0, TAU);ctx.fill();
  }
  ctx.strokeStyle = '#7cb3e60b';ctx.lineWidth = 1;
  for (let i = 0; i < 16; i++) {
    line(ctx, i * 140 - p * 30, 0, i * 140 - p * 30, HEIGHT, '#7cb3e609', 1);
  }
}

function titleScene(ctx, shot, p) {
  const phrase = shot.heading;
  const chars = [...phrase];
  const preferredSize = shot.kind === 'hook' ? 112 : shot.kind === 'impact' ? 125 : 105;
  let splitAt = Math.ceil(phrase.length / 2);
  while ('，。？！；：、」”）'.includes(phrase[splitAt]) && splitAt < phrase.length - 4) splitAt++;
  const chunks = phrase.length > 15 ? [phrase.slice(0, splitAt), phrase.slice(splitAt)] : [phrase];
  ctx.font = `700 ${preferredSize}px FilmSans`;
  const widest = Math.max(...chunks.map(chunk => ctx.measureText(chunk).width));
  const size = Math.min(preferredSize, preferredSize * 1640 / widest);
  const y0 = chunks.length === 2 ? 395 : 465;
  chunks.forEach((chunk, row) => {
    ctx.font = `700 ${size}px FilmSans`;
    const total = ctx.measureText(chunk).width;
    let x = (WIDTH - total) / 2;
    [...chunk].forEach((char, i) => {
      const entry = expo(ramp(p, i * .018, .27 + i * .018));
      const width = ctx.measureText(char).width;
      ctx.save();
      ctx.translate(x + width / 2, y0 + row * size * 1.35 + (1 - entry) * 95);
      ctx.scale(1 + (1 - entry) * .45, 1);
      ctx.globalAlpha = clamp(entry * 2);
      text(ctx, char, 0, 0, size, i >= chunk.length * .6 ? GOLD : INK, 'center', 700);
      ctx.restore();
      x += width;
    });
  });
  const width = Math.min(1250, Math.max(500, chars.length * 65));
  line(ctx, 960 - width / 2, y0 + (chunks.length - 1) * size * 1.35 + 105, 960 + width / 2, y0 + (chunks.length - 1) * size * 1.35 + 105, BLUE, 4, ease(ramp(p, .2, .75)));
  for (let i = 0; i < 46; i++) {
    const age = ramp(p, .15, 1);
    const a = hash(i + shot.index * 100) * TAU;
    const radius = age * (170 + hash(i * 3) * 580);
    const x = 960 + Math.cos(a) * radius;
    const y = 520 + Math.sin(a) * radius * .6;
    ctx.globalAlpha = (1 - age) * .6;
    line(ctx, x, y, x - Math.cos(a) * 18, y - Math.sin(a) * 12, i % 3 ? BLUE : GOLD, 2);
  }
  ctx.globalAlpha = 1;
  text(ctx, shot.en, 960, 790, 27, GOLD);
  text(ctx, episode.english, 960, 230, 24, MUTED);
}

function comicScene(ctx, shot, p) {
  const image = pictures[shot.panel - 1];
  const side = shot.panel % 2 ? 1 : -1;
  const enter = expo(ramp(p, 0, .22));
  const x = 960 + side * (1 - enter) * 800;
  ctx.save();ctx.translate(x, 492);ctx.rotate(side * mix(.07, -.025, p));
  const size = 660;
  const zoom = 1.02 + p * .08;
  ctx.shadowColor = BLUE + '50';ctx.shadowBlur = 50;
  ctx.strokeStyle = BLUE;ctx.lineWidth = 3;
  ctx.beginPath();ctx.roundRect(-size / 2, -size / 2, size, size, 25);ctx.stroke();ctx.clip();
  const crop = (image.width - image.width / zoom) / 2;
  ctx.drawImage(image, crop, crop * (shot.panel % 2 ? 1.4 : .6), image.width - crop * 2, image.height - crop * 2, -size / 2, -size / 2, size, size);
  ctx.restore();
  const labelX = side > 0 ? 225 : 1695;
  text(ctx, '0' + shot.panel, labelX, 340, 125, GOLD, 'center', 400, 'Anton');
  wrap(ctx, shot.heading, labelX, 540, 300, 33, MUTED, 5);
  line(ctx, labelX - 80, 665, labelX + 80, 665, BLUE, 3, ease(p));
  text(ctx, '原创校园故事', labelX, 710, 24, GOLD);
}

function relayScene(ctx, shot, p, elapsed) {
  const f = elapsed * 30;
  const positions = [[420, 520], [960, 355], [1500, 520]];
  const arrivals = [10, 48, 82];
  positions.forEach((position, i) => {
    const entry = ease(ramp(f, i * 4, i * 4 + 20));
    const hit = ramp(f, arrivals[i], arrivals[i] + 5) * (1 - ramp(f, arrivals[i] + 5, arrivals[i] + 20));
    ctx.save();ctx.globalAlpha = entry;
    const y = position[1] + (1 - entry) * 100;
    node(ctx, shot.labels[i], position[0], y, 112, i === 2 ? GOLD : BLUE, clamp(ramp(f, arrivals[i], arrivals[i] + 8) + hit));
    if (hit > 0) ring(ctx, position[0], y, 125 + ramp(f, arrivals[i], arrivals[i] + 20) * 100, '#e3f4ff' + Math.round(hit * 180).toString(16).padStart(2, '0'), 2);
    ctx.restore();
  });
  for (let j = 0; j < 2; j++) {
    const start = j ? 58 : 22;
    const duration = j ? 24 : 26;
    if (f < start) continue;
    const a = [positions[j][0] + 80, positions[j][1] - 70];
    const d = [positions[j + 1][0] - 85, positions[j + 1][1] - 60];
    const b = [mix(a[0], d[0], .22), Math.min(a[1], d[1]) - 150];
    const c = [mix(a[0], d[0], .78), b[1]];
    const growth = smooth(ramp(f, start, start + duration));
    const fade = 1 - ramp(f, start + duration + 4, start + duration + 18);
    for (let i = 0; i < 80; i++) {
      const u = i / 80;
      if (u > growth) break;
      const from = bezier(a, b, c, d, u);
      const to = bezier(a, b, c, d, Math.min(growth, (i + 1) / 80));
      line(ctx, ...from, ...to, BLUE + Math.round((.15 + u * .75) * fade * 255).toString(16).padStart(2, '0'), 5);
    }
    if (growth < 1) dot(ctx, ...bezier(a, b, c, d, growth), 9, INK);
    else {
      for (let i = 1; i < 23; i++) {
        const position = bezier(a, b, c, d, i / 24);
        ctx.fillStyle = BLUE + '55';ctx.beginPath();ctx.arc(...position, 2.6, 0, TAU);ctx.fill();
      }
    }
  }
}

function conceptualScene(ctx, shot, p, elapsed) {
  const labels = shot.labels;
  const type = shot.object;
  const phase = ease(ramp(p, 0, .55));
  const end = ease(ramp(p, .35, 1));
  const camera = 1 + shot.camera.push * p;
  ctx.save();
  ctx.translate(960 + shot.camera.angle * p * 160, 505);
  ctx.scale(camera, camera);
  ctx.translate(-960, -505);
  switch (shot.kind) {
    case 'aperture': {
      const radius = mix(90, 330, phase);
      for (let i = 0; i < 4; i++) ring(ctx, 960, 480, radius + i * 28, i % 2 ? GOLD + '44' : BLUE + '70', i === 0 ? 4 : 1.5, .88, -.5 + p * .2 + i * .4);
      glyph(ctx, type, 960, 480, 1.25 + p * .25, phase, shot.index);
      tag(ctx, labels[0], 440, 510, BLUE);
      tag(ctx, labels[1], 1480, 510, GOLD);
      arrow(ctx, [570, 510], [710, 510], phase, BLUE);
      arrow(ctx, [1210, 510], [1350, 510], end, GOLD);
      break;
    }
    case 'object': {
      glyph(ctx, type, 1160, 490, 1.55, phase, 0);
      text(ctx, episode.anchor.year, 390, 400, 116, GOLD, 'center', 400, 'Anton');
      wrap(ctx, labels[0] + ' → ' + labels[1], 420, 570, 470, 48, INK, 3);
      for (let i = 0; i < 5; i++) line(ctx, 650, 290 + i * 85, 740 + 40 * phase, 290 + i * 85, BLUE + '40', 1.5);
      break;
    }
    case 'field': {
      const letters = ['○', '△', '□'];
      const target = episode.id === 'confirmation-bias' ? 1 : 0;
      for (let i = 0; i < 48; i++) {
        const x = 290 + i % 12 * 120;
        const y = 310 + Math.floor(i / 12) * 110;
        const lit = i % 3 === target;
        ctx.globalAlpha = lit ? 1 : mix(.8, .16, end);
        text(ctx, letters[i % 3], x, y + (1 - phase) * 120, 61, lit ? GOLD : BLUE);
      }
      ctx.globalAlpha = 1;
      const scanX = mix(270, 1560, smooth(p));
      glow(ctx, scanX, 475, 230, BLUE, .5);
      line(ctx, scanX, 220, scanX, 740, BLUE + '80', 2);
      tag(ctx, labels[0] + ' → ' + labels[2], 960, 790, GOLD, 500);
      break;
    }
    case 'tunnel': {
      for (let i = 9; i >= 0; i--) {
        const depth = i * 100 + (1 - phase) * 280;
        const scale = 1000 / (1000 + depth);
        ctx.save();ctx.translate(960, 500);ctx.scale(scale, scale);
        ctx.strokeStyle = BLUE + Math.round(30 + scale * 110).toString(16).padStart(2, '0');ctx.lineWidth = 3;
        ctx.strokeRect(-620, -250, 1240, 500);
        text(ctx, labels[i % 6], (i % 3 - 1) * 400, i % 2 ? -170 : 170, 36, i === 0 ? GOLD : BLUE);
        ctx.restore();
      }
      glyph(ctx, type, 960, 490, 1.15, phase, 1);
      break;
    }
    case 'gate': {
      panel(ctx, 850, 210, 220, 545, TEAL, .7, 12);
      for (let i = 0; i < 30; i++) {
        const u = clamp(p * 1.55 - i * .018);
        const passes = i % 3 === 0;
        const x = passes ? mix(260, 1580, ease(u)) : Math.min(825, mix(260, 1580, ease(u)));
        const y = 270 + i % 7 * 68 + (passes ? 0 : end * (i % 2 ? 55 : -55));
        ring(ctx, x, y, 14, passes ? GOLD : BLUE + '60', 3);
        if (passes && x > 1070) line(ctx, x - 38, y, x - 14, y, GOLD + '60', 2);
      }
      tag(ctx, labels[0], 440, 790, BLUE);tag(ctx, labels[2], 1480, 790, GOLD);
      text(ctx, labels[1], 960, 475, 38, TEAL);
      break;
    }
    case 'contrast': {
      for (let i = 0; i < 2; i++) {
        const x = 230 + i * 790;
        const slide = (1 - expo(ramp(p, i * .08, .4 + i * .08))) * (i ? 500 : -500);
        panel(ctx, x + slide, 270, 660, 420, i ? GOLD : BLUE);
        text(ctx, labels[i], x + slide + 330, 390, 62, i ? GOLD : INK);
        glyph(ctx, type, x + slide + 330, 560, .53, phase, i);
      }
      text(ctx, '？', 960, 480, 85, MUTED);
      break;
    }
    case 'scale': {
      glyph(ctx, type, 960, 340, .8, phase, 2);
      const tilt = mix(-.18, .08, smooth(p));
      ctx.save();ctx.translate(960, 580);ctx.rotate(tilt);
      line(ctx, -590, 0, 590, 0, GOLD, 5, phase);
      for (const side of [-1, 1]) {
        line(ctx, side * 470, 0, side * 470, 100, BLUE, 3);
        panel(ctx, side * 470 - 190, 100, 380, 100, side > 0 ? GOLD : BLUE);
        text(ctx, side > 0 ? labels[3] : labels[0], side * 470, 150, 38, side > 0 ? GOLD : BLUE);
      }
      ctx.restore();
      line(ctx, 960, 580, 885, 790, BLUE, 5);line(ctx, 960, 580, 1035, 790, BLUE, 5);
      break;
    }
    case 'paths': {
      const origin = [300, 500];
      node(ctx, labels[0], ...origin, 90, BLUE, 1);
      const points = [[900, 280], [900, 670], [1520, 380], [1520, 700]];
      points.forEach((point, i) => {
        const from = i < 2 ? [410, 500] : [1000, points[i - 2][1]];
        const u = ease(ramp(p, i * .1, .45 + i * .1));
        arrow(ctx, from, [point[0] - 100, point[1]], u, i % 2 ? GOLD : BLUE, 4);
        node(ctx, labels[i + 1], ...point, 85, i % 2 ? GOLD : BLUE, u);
      });
      break;
    }
    case 'stream': {
      const count = 90;
      for (let i = 0; i < count; i++) {
        const start = [130 + hash(i) * 140, 210 + hash(i * 7) * 570];
        const endPoint = [1630 + hash(i * 3) * 140, 250 + (i % 3) * 220];
        const u = clamp(p * 1.5 - i / count * .45);
        const point = bezier(start, [700, start[1]], [1180, endPoint[1]], endPoint, smooth(u));
        if (u > .02 && u < .98) {
          line(ctx, point[0] - 25, point[1], point[0], point[1], i % 3 ? BLUE + '90' : GOLD, 2);
          dot(ctx, ...point, i % 3 ? 2 : 4, i % 3 ? BLUE : GOLD);
        }
      }
      for (let i = 0; i < 3; i++) node(ctx, labels[i + 1], 1600, 250 + i * 220, 80, i === 0 ? GOLD : BLUE, phase);
      tag(ctx, labels[0], 350, 790, BLUE, 350);
      break;
    }
    case 'compare': {
      for (let i = 0; i < 3; i++) {
        const u = ease(ramp(p, i * .1, .38 + i * .1));
        panel(ctx, 190 + i * 535, 280 + (1 - u) * 260, 475, 420, i === 2 ? GOLD : BLUE);
        glyph(ctx, type, 427 + i * 535, 455 + (1 - u) * 260, .55, phase, i);
        text(ctx, labels[i + 1], 427 + i * 535, 625 + (1 - u) * 260, 40, i === 2 ? GOLD : BLUE);
      }
      break;
    }
    case 'timeline': {
      const positions = [330, 960, 1590];
      const names = episode.id === 'retrieval' ? ['5分钟', '2天', '1周'] : labels.slice(0, 3);
      arrow(ctx, [180, 530], [1740, 530], phase, MUTED, 3);
      positions.forEach((x, i) => {
        const u = ease(ramp(p, i * .12, .45 + i * .12));
        ring(ctx, x, 530, 25, i ? GOLD : BLUE, 5);
        panel(ctx, x - 185, 285 - (1 - u) * 100, 370, 160, i ? GOLD : BLUE, u);
        text(ctx, names[i], x, 365, 65, i ? GOLD : INK);
        if (episode.id === 'retrieval') text(ctx, i ? '提取保持较好' : '再读表现较好', x, 660, 34, i ? GOLD : BLUE);
        else text(ctx, labels[i + 3], x, 660, 34, GOLD);
      });
      break;
    }
    case 'explode': {
      glyph(ctx, type, 960, 490, 1.1 - p * .3, phase, 1);
      labels.forEach((label, i) => {
        const angle = i / 6 * TAU - Math.PI / 2;
        const radius = mix(80, 530, phase);
        const x = 960 + Math.cos(angle) * radius;
        const y = 490 + Math.sin(angle) * radius * .48;
        line(ctx, 960 + Math.cos(angle) * 190, 490 + Math.sin(angle) * 95, x, y, i % 2 ? GOLD + '60' : BLUE + '60', 2, phase);
        tag(ctx, label, x, y, i % 2 ? GOLD : BLUE, 235);
      });
      break;
    }
    case 'focus': {
      const focusX = mix(530, 1290, smooth(p));
      for (let i = 0; i < 7; i++) {
        const x = 250 + i * 235;
        const selected = 1 - clamp(Math.abs(x - focusX) / 400);
        ctx.globalAlpha = .2 + selected * .8;
        glyph(ctx, type, x, 490, .33 + selected * .37, phase, i);
      }
      ctx.globalAlpha = 1;
      ring(ctx, focusX, 470, 210, BLUE, 5);
      line(ctx, focusX + 150, 620, focusX + 235, 705, GOLD, 12);
      tag(ctx, labels[4], focusX, 780, GOLD, 370);
      break;
    }
    case 'causal': {
      const causalQuestion = episode.id === 'correlation';
      node(ctx, causalQuestion ? '冰淇淋' : labels[0], 490, 600, 130, BLUE, phase);
      node(ctx, causalQuestion ? '树荫' : labels[1], 1430, 600, 130, GOLD, phase);
      node(ctx, causalQuestion ? '天气？' : labels[2], 960, 250, 112, TEAL, phase);
      ctx.setLineDash([15, 12]);
      if (causalQuestion) {
        arrow(ctx, [860, 310], [590, 500], phase, TEAL, 4);
        arrow(ctx, [1060, 310], [1330, 500], phase, TEAL, 4);
      } else {
        line(ctx, 860, 310, 590, 500, TEAL, 3, phase);
        line(ctx, 1060, 310, 1330, 500, TEAL, 3, phase);
      }
      ctx.setLineDash([]);
      text(ctx, causalQuestion ? '候选共同原因' : '把线索放回同一情境', 960, 480, 40, TEAL);
      text(ctx, '？', 960, 650, 85, GOLD);
      break;
    }
    case 'context': {
      panel(ctx, 245, 240, 1430, 560, BLUE, .65);
      for (let i = 0; i < 6; i++) {
        const x = 380 + i * 230;
        line(ctx, x, 680, x, 350 - i % 3 * 50, '#82b0dc50', 2, phase);
        panel(ctx, x - 70, 680, 140, 90, i % 2 ? GOLD : BLUE, phase, 7);
      }
      person(ctx, 735, 535, 1.05, BLUE);person(ctx, 1190, 535, 1.05, GOLD);
      glyph(ctx, type, 960, 430, .6, phase, 0);
      tag(ctx, labels[4], 960, 745, TEAL, 340);
      break;
    }
    case 'steps': {
      for (let i = 0; i < 4; i++) {
        const u = expo(ramp(p, i * .085, .3 + i * .085));
        const x = 230 + i * 410;
        const y = 560 - i * 70;
        panel(ctx, x, y, 330, 210, i === 3 ? GOLD : BLUE, u);
        text(ctx, String(i + 1).padStart(2, '0'), x + 65, y + 55, 50, GOLD, 'center', 400, 'Anton');
        text(ctx, labels[(i + 2) % 6], x + 165, y + 138, 36, INK);
        if (i < 3) arrow(ctx, [x + 345, y + 80], [x + 395, y + 10], end, BLUE);
      }
      break;
    }
    case 'assemble': {
      const center = [960, 470];
      for (let i = 0; i < 80; i++) {
        const angle = hash(i + episode.seed) * TAU;
        const target = [-275 + i % 10 * 61, -175 + Math.floor(i / 10) * 50];
        const u = expo(ramp(p, hash(i) * .2, .6 + hash(i) * .15));
        const x = center[0] + mix(Math.cos(angle) * 1000, target[0], u);
        const y = center[1] + mix(Math.sin(angle) * 700, target[1], u);
        ctx.save();ctx.translate(x, y);ctx.rotate((1 - u) * angle);
        line(ctx, -18, 0, 18, 0, i % 3 ? BLUE : GOLD, 3);
        ctx.restore();
      }
      glyph(ctx, type, 960, 470, ease(ramp(p, .4, .95)) * .85, phase, 2);
      tag(ctx, labels[4] + ' → ' + labels[5], 960, 780, GOLD, 600);
      break;
    }
    case 'interact': {
      const active = Math.min(2, Math.floor(p * 3));
      for (let i = 0; i < 3; i++) {
        panel(ctx, 245 + i * 530, 340, 440, 330, i === active ? GOLD : BLUE, 1, 24);
        text(ctx, labels[i + 3], 465 + i * 530, 470, 48, i === active ? GOLD : MUTED);
        if (i === active) ring(ctx, 465 + i * 530, 585, 32, GOLD, 4, ease((p * 3) % 1));
      }
      text(ctx, '试着向前走一步', 960, 760, 36, TEAL);
      break;
    }
    case 'equation': {
      const equations = {
        'attention': ['漏看', '≠', '不在乎'], 'memory': ['确信', '≠', '准确保证'],
        'retrieval': ['眼前顺利', '≠', '长期保持'], 'knowledge-curse': ['知道', '≠', '讲清楚'],
        'attribution': ['一个行为', '≠', '全部原因'], 'framing': ['九成得到', '=', '一成未得到'],
        'test-validity': ['稳定读数', '≠', '用途有效'], 'correlation': ['一起变化', '≠', '因果已明'],
        'confirmation-bias': ['同一个例子', '→', '多种解释'], 'gratitude': ['看见支持', '≠', '强行开心'],
      };
      const values = equations[episode.id] || [labels[0], '→', labels[5]];
      values.forEach((value, i) => {
        const u = expo(ramp(p, i * .1, .35 + i * .1));
        text(ctx, value, [470, 960, 1450][i], 480 + (1 - u) * 140, i === 1 ? 155 : 92, i === 1 ? GOLD : INK, 'center', 700);
      });
      line(ctx, 310, 640, 1610, 640, BLUE + '80', 2, end);
      break;
    }
    case 'bridge': {
      const radius = 190;
      ring(ctx, 440, 470, radius, BLUE, 3);
      ring(ctx, 1480, 470, radius, GOLD, 3);
      glyph(ctx, type, 440, 470, .6, phase, 0);
      person(ctx, 1480, 500, 1.0, GOLD);
      const a = [650, 470], d = [1270, 470];
      for (let i = 0; i < 60; i++) {
        const u = i / 60;
        if (u > phase) break;
        const from = bezier(a, [800, 180], [1110, 180], d, u);
        const to = bezier(a, [800, 180], [1110, 180], d, Math.min(phase, (i + 1) / 60));
        line(ctx, ...from, ...to, TEAL, 4);
      }
      dot(ctx, ...bezier(a, [800, 180], [1110, 180], d, phase), 9, GOLD);
      tag(ctx, labels[5], 960, 720, TEAL, 400);
      break;
    }
    case 'limits': {
      const names = ['研究对象', '具体情境', '方法条件'];
      for (let i = 0; i < 3; i++) {
        const u = ease(ramp(p, i * .14, .45 + i * .14));
        panel(ctx, 320, 250 + i * 180, 1280, 138, i === 2 ? GOLD : BLUE, u);
        text(ctx, String(i + 1).padStart(2, '0'), 420, 319 + i * 180, 60, GOLD, 'center', 400, 'Anton');
        text(ctx, names[i], 960, 319 + i * 180, 50, INK);
        ring(ctx, 1480, 319 + i * 180, 28, i === 2 ? GOLD : BLUE, 3, u);
      }
      break;
    }
    case 'identity': {
      person(ctx, 960, 510, 2.15, BLUE);
      labels.forEach((label, i) => {
        const a = i / 6 * TAU;
        const distance = mix(200, 620, end);
        const x = 960 + Math.cos(a) * distance;
        const y = 470 + Math.sin(a) * distance * .43;
        ctx.globalAlpha = 1 - end * .45;
        tag(ctx, label, x, y, i % 2 ? GOLD : BLUE, 240);
      });
      ctx.globalAlpha = 1;
      break;
    }
    case 'action': {
      for (let i = 0; i < 3; i++) {
        const x = 380 + i * 580;
        const u = ease(ramp(p, i * .15, .48 + i * .15));
        panel(ctx, x - 220, 310, 440, 360, i === 2 ? GOLD : BLUE, u);
        person(ctx, x, 440, .62, i === 2 ? GOLD : BLUE);
        text(ctx, labels[i + 3], x, 590, 44, INK);
        if (i < 2) arrow(ctx, [x + 230, 480], [x + 340, 480], end, TEAL, 4);
      }
      break;
    }
    case 'question': {
      text(ctx, '？', 960, 470, 400 * mix(.5, 1, expo(phase)), GOLD, 'center', 700);
      for (let i = 0; i < 6; i++) {
        const angle = i / 6 * TAU - .7;
        const radius = 360 + phase * 100;
        text(ctx, labels[i], 960 + Math.cos(angle) * radius * 1.4, 480 + Math.sin(angle) * radius * .6, 34, i % 2 ? GOLD : BLUE);
      }
      break;
    }
    case 'constellation': {
      const points = [[310, 480], [620, 260], [950, 380], [1260, 240], [1600, 480], [1210, 720], [690, 720]];
      points.forEach((point, i) => {
        if (i) arrow(ctx, points[i - 1], point, ease(ramp(p, i * .055, .35 + i * .055)), i % 2 ? BLUE : GOLD, 3);
        dot(ctx, ...point, 10, i % 2 ? BLUE : GOLD);
        text(ctx, labels[i % 6], point[0], point[1] + 50, 31, INK);
      });
      break;
    }
    default:
      glyph(ctx, type, 960, 490, 1.3, phase, shot.index % 3);
  }
  ctx.restore();
}

function specialScene(ctx, shot, p) {
  const end = ease(ramp(p, .35, 1));
  const actions = {
    'knowledge-curse':['expert','novice','perspectives','hidden','compressed','buttons','lamp','sequence','teachback'],
    'retrieval':['reading','recall','memory','immediate','delayed','card','comparison','reconstruct'],
    'attribution':['observation','person','context','missing','weather','expand','contextualize','ask','agree']
  };
  if (!(actions[episode.id] || []).includes(shot.action)) return false;
  const phase = ease(ramp(p, 0, .65));
  if (episode.id === 'knowledge-curse' && ['expert', 'novice', 'perspectives', 'hidden', 'compressed', 'buttons', 'lamp', 'sequence', 'teachback'].includes(shot.action)) {

    if (shot.action === 'compressed') {
      for (let i = 0; i < 6; i++) {
        const x = mix(330 + i * 250, 960 + (i - 2.5) * 5, phase);
        const y = mix(440 + i % 2 * 140, 470, phase);
        panel(ctx, x - 90, y - 70, 180, 140, i % 2 ? BLUE : GOLD, 1 - phase * .7);
        text(ctx, ['目标', '开关', '三角', '黄灯', '等待', '检查'][i], x, y, 32, INK);
      }
      text(ctx, '「按一下就好了」', 960, 700, 72 * phase, GOLD);
    } else if (shot.action === 'buttons') {
      panel(ctx, 525, 240, 870, 520, BLUE, 1, 70);
      ctx.save();ctx.translate(960, 495);ctx.scale(1 - .08 * Math.sin(p * Math.PI), 1 - .08 * Math.sin(p * Math.PI));
      ctx.beginPath();ctx.moveTo(0,-130);ctx.lineTo(150,125);ctx.lineTo(-150,125);ctx.closePath();ctx.fillStyle=BLUE+'25';ctx.fill();ctx.strokeStyle=GOLD;ctx.lineWidth=7;ctx.stroke();ctx.restore();
      ring(ctx, 960, 510, 175 + end * 115, GOLD + Math.round((1-end)*160).toString(16).padStart(2,'0'), 4);
      text(ctx, '第一步：指明要按的按钮', 960, 795, 44, TEAL);
    } else if (shot.action === 'lamp') {
      panel(ctx, 555, 240, 810, 490, BLUE, 1, 40);
      glow(ctx, 960, 450, 370, GOLD, phase);
      dot(ctx, 960, 450, 105, GOLD);
      for (let i=0;i<16;i++){const a=i/16*TAU;line(ctx,960+Math.cos(a)*150,450+Math.sin(a)*150,960+Math.cos(a)*(180+phase*80),450+Math.sin(a)*(180+phase*80),GOLD,3);}
      text(ctx, '再等黄灯：让反馈变得可见', 960, 795, 44, TEAL);
    } else if (shot.action === 'sequence') {
      robot(ctx, 510, 460, 1.05, phase);
      for (let i = 0; i < 3; i++) {
        const u = ease(ramp(p, i * .12, .4 + i * .12));
        node(ctx, ['按三角', '等黄灯', '再确认'][i], 1000 + i * 270, 490, 90, i === 1 ? GOLD : BLUE, u);
        if (i < 2) arrow(ctx, [1100 + i * 270, 490], [1160 + i * 270, 490], u, TEAL, 4);
      }
    } else if (shot.action === 'expert') {
      for (let i = 5; i >= 0; i--) {
        const z = i * 85;
        const scale = 900 / (900 + z);
        ctx.save();ctx.translate(960 + (i - 2.5) * 120 * phase, 470 - i * 22);ctx.scale(scale, scale);
        panel(ctx, -420, -160, 840, 320, i === 0 ? GOLD : BLUE, .35 + (5 - i) * .1);
        text(ctx, ['目标','开关','按钮','信号','等待','检查'][i], 0, -35, 65, i === 0 ? GOLD : INK);
        line(ctx, -250, 65, 250, 65, BLUE, 3, phase);
        ctx.restore();
      }
      tag(ctx, '熟悉以后，步骤容易被打包', 960, 760, GOLD, 650);
    } else if (shot.action === 'novice') {
      panel(ctx, 485, 245, 950, 470, GOLD, 1, 65);
      ring(ctx, 735, 440, 94, GOLD, 6, phase);
      ctx.strokeStyle = BLUE;ctx.lineWidth = 6;ctx.beginPath();ctx.moveTo(1180, 335);ctx.lineTo(1290, 525);ctx.lineTo(1070, 525);ctx.closePath();ctx.stroke();
      text(ctx, '这两个符号，哪个先按？', 960, 630, 42, INK);
      for (let i = 0; i < 3; i++) {
        const x = 500 + i * 460;
        text(ctx, '？', x, 205 - phase * 30, 65, MUTED);
      }
    } else if (shot.action === 'perspectives') {
      const split = mix(620, 960, phase);
      line(ctx, split, 230, split, 790, TEAL, 4);
      robot(ctx, 500, 490, .87, phase, .2);
      panel(ctx, 1130, 300, 430, 300, GOLD, 1, 30);
      ring(ctx, 1245, 430, 47, GOLD, 5);
      text(ctx, '△', 1450, 430, 115, BLUE);
      tag(ctx, '老队员：看到整个流程', 500, 730, BLUE, 600);
      tag(ctx, '新同学：只看到按钮', 1360, 730, GOLD, 600);
      arrow(ctx, [760, 470], [1070, 470], end, MUTED);
      text(ctx, '信息并不相同', 960, 255, 35, TEAL);
    } else if (shot.action === 'teachback') {
      person(ctx, 380, 630, 1.3, BLUE);person(ctx, 1530, 630, 1.3, GOLD);
      const replies = ['先按三角', '再等黄灯', '最后确认'];
      replies.forEach((label, i) => {
        const u = ease(ramp(p, i * .14, .45 + i * .14));
        const x = mix(1480, 560 + i * 320, u);
        panel(ctx, x - 135, 285 + i % 2 * 115, 270, 115, GOLD, u);
        text(ctx, label, x, 342 + i % 2 * 115, 35, INK);
      });
      arrow(ctx, [1370, 640], [550, 640], phase, GOLD, 4);
      text(ctx, '请他复述，才能看见缺了哪一步', 960, 780, 42, TEAL);
    } else {
      person(ctx, 390, 590, 1.2, BLUE);person(ctx, 1530, 590, 1.2, GOLD);
      robot(ctx, 960, 540, .7, phase);
      const expert = shot.action !== 'novice';
      for (let i = 0; i < 6; i++) {
        const x = 230 + i % 3 * 160;
        const y = 265 + Math.floor(i / 3) * 100;
        panel(ctx, x, y, 130, 75, BLUE, expert ? 1 : .3);
        text(ctx, ['目标', '顺序', '按钮', '信号', '等待', '检查'][i], x + 65, y + 37, 25, BLUE);
      }
      node(ctx, shot.action === 'teachback' ? '再说一遍' : '这是什么？', 1530, 320, 113, GOLD, phase);
      arrow(ctx, [655, 430], [815, 460], phase, BLUE, 4);
      arrow(ctx, [1100, 460], [1350, 430], phase, GOLD, 4);
      tag(ctx, '已有的地图', 390, 755, BLUE, 320);tag(ctx, '新手看到的', 1530, 755, GOLD, 320);
    }
  } else if (episode.id === 'retrieval' && ['reading', 'recall', 'memory', 'immediate', 'delayed', 'card', 'comparison', 'reconstruct'].includes(shot.action)) {

    if (shot.action === 'immediate' || shot.action === 'delayed' || shot.action === 'comparison') {
      const delayed = shot.action !== 'immediate';
      panel(ctx, 260, 270, 600, 430, delayed ? BLUE : GOLD);
      panel(ctx, 1060, 270, 600, 430, delayed ? GOLD : BLUE);
      book(ctx, 560, 450, .7, 1, BLUE);book(ctx, 1360, 450, .7, 0, GOLD);
      text(ctx, '重复阅读', 560, 640, 45, INK);text(ctx, '主动提取', 1360, 640, 45, INK);
      tag(ctx, delayed ? '2天 / 1周：提取较好' : '5分钟：再读较好', delayed ? 1360 : 560, 220, GOLD, 490);
      const target = delayed ? 1360 : 560;
      ring(ctx, target, 480, 240 + phase * 18, GOLD + '80', 3, phase);
    } else if (shot.action === 'reading') {
      book(ctx, 960, 500, 1.9, 1, BLUE);
      const scanY = mix(285, 680, smooth(p));
      ctx.fillStyle = GOLD + '20';ctx.fillRect(650, scanY - 15, 620, 45);
      line(ctx, 650, scanY, 1270, scanY, GOLD + 'b0', 2);
      tag(ctx, '答案还在眼前', 960, 795, BLUE, 450);
    } else if (shot.action === 'recall') {
      book(ctx, 450, 500, 1.25, 1 - phase, BLUE);
      panel(ctx, 1050, 270, 570, 480, GOLD, 1, 15);
      text(ctx, '试着自己说出来', 1335, 360, 45, GOLD);
      for (let i = 0; i < 4; i++) line(ctx, 1120, 460 + i * 65, 1550 - i % 2 * 110, 460 + i * 65, BLUE + '80', 4, ease(ramp(p, .12 + i * .12, .5 + i * .12)));
      arrow(ctx, [680, 500], [980, 500], phase, TEAL, 5);
    } else if (shot.action === 'memory') {
      const points = Array.from({length: 13}, (_, i) => [960 + Math.cos(i * 2.399) * Math.sqrt(i + 1) * 165, 480 + Math.sin(i * 2.399) * Math.sqrt(i + 1) * 83]);
      points.forEach((point, i) => {
        if (i) line(ctx, ...points[Math.floor((i - 1) / 2)], ...point, BLUE + '70', 3, ease(ramp(p, i * .025, .5 + i * .025)));
        node(ctx, i === 0 ? '线索' : ['词语','图像','意义','情境'][i % 4], ...point, i === 0 ? 82 : 55, i % 3 ? BLUE : GOLD, phase);
      });
    } else if (shot.action === 'card') {
      const flip = Math.cos(p * Math.PI);
      ctx.save();ctx.translate(960, 495);ctx.scale(Math.max(.04, Math.abs(flip)), 1);
      panel(ctx, -460, -240, 920, 480, p < .5 ? BLUE : GOLD, 1, 30);
      wrap(ctx, p < .5 ? '合上材料以后\n你还能解释吗？' : '先提取，再核对\n让反馈指出缺口', 0, 0, 800, 73, INK, 2);
      ctx.restore();
    } else {
      book(ctx, 430, 500, 1.15, shot.action === 'reading' ? 1 : 1 - phase, BLUE);
      for (let i = 0; i < 7; i++) {
        const u = ease(ramp(p, i * .06, .5 + i * .06));
        const x = mix(500, 940 + i % 4 * 190, u);
        const y = mix(470, 370 + Math.floor(i / 4) * 200, u);
        panel(ctx, x - 65, y - 80, 130, 160, i % 2 ? BLUE : GOLD, u, 10);
        line(ctx, x - 40, y - 25, x + 40, y - 25, BLUE + '90', 3);
        line(ctx, x - 40, y + 15, x + 18, y + 15, GOLD + '90', 3);
      }
      tag(ctx, shot.action === 'reading' ? '眼前的材料' : '从记忆中找路', 430, 760, BLUE, 430);
      tag(ctx, '核对反馈，再试一次', 1320, 760, GOLD, 500);
    }
  } else if (episode.id === 'attribution' && ['observation', 'person', 'context', 'missing', 'weather', 'expand', 'contextualize', 'ask', 'agree'].includes(shot.action)) {

    if (shot.action === 'observation') {
      phone(ctx, 960, 490, 1.3, 1);
      for (let i = 0; i < 4; i++) {
        const angle = i / 4 * TAU + Math.PI / 4;
        const x = 960 + Math.cos(angle) * 460;
        const y = 490 + Math.sin(angle) * 260;
        line(ctx, x, y, x + (x < 960 ? 75 : -75), y, BLUE, 4, phase);
      }
      tag(ctx, '观察：还没有收到回复', 960, 780, TEAL, 600);
    } else if (shot.action === 'person') {
      phone(ctx, 400, 500, .9, 1);
      const scale = .7 + .3 * expo(phase);
      ctx.save();ctx.translate(1280, 490);ctx.scale(scale, scale);
      panel(ctx, -340, -185, 680, 370, GOLD);
      text(ctx, '他不在乎？', 0, -15, 95, GOLD);
      text(ctx, '一种解释', 0, 110, 35, MUTED);ctx.restore();
      arrow(ctx, [560, 490], [890, 490], phase, BLUE, 4);
    } else if (shot.action === 'missing') {
      const names = ['他的行程？','手机在哪？','发生了什么？','还有谁知道？'];
      names.forEach((name, i) => {
        const x = 360 + i * 400;
        panel(ctx, x - 160, 310 + (i % 2) * 120, 320, 240, i % 2 ? GOLD : BLUE, phase);
        text(ctx, '？', x, 395 + (i % 2) * 120, 90, GOLD);
        text(ctx, name, x, 505 + (i % 2) * 120, 31, INK);
      });
    } else if (shot.action === 'weather') {
      clock(ctx, 470, 470, 145, -.8 + p * 1.8, GOLD);
      for (let i = 0; i < 45; i++) {
        const x = 800 + hash(i) * 850;
        const y = 210 + hash(i * 7) * 480 + phase * 90;
        line(ctx, x, y, x - 23, y + 55, BLUE + '65', 2);
      }
      person(ctx, mix(1060, 1390, smooth(p)), 550, 1.3, BLUE);
      tag(ctx, '也许正在赶路', 1160, 750, GOLD, 500);
    } else if (shot.action === 'ask') {
      person(ctx, 410, 650, 1.2, BLUE);person(ctx, 1510, 650, 1.2, GOLD);
      panel(ctx, 300 + (1 - phase) * -350, 260, 690, 180, BLUE, phase);
      text(ctx, '刚才发生了什么？', 645, 350, 51, INK);
      panel(ctx, 950 + (1 - end) * 350, 500, 690, 180, GOLD, end);
      text(ctx, '我还缺一段背景。', 1295, 590, 51, INK);
    } else if (shot.action === 'agree') {
      panel(ctx, 610, 250, 700, 480, GOLD);
      for (let i = 0; i < 5; i++) line(ctx, 670, 345 + i * 70, 1250, 345 + i * 70, BLUE + '45', 2, phase);
      person(ctx, 360, 580, 1.15, BLUE);person(ctx, 1560, 580, 1.15, GOLD);
      wrap(ctx, '下一次\n怎样联系？', 960, 480, 580, 83, INK, 2);
      arrow(ctx, [490, 580], [580, 580], phase, TEAL, 4);
      arrow(ctx, [1430, 580], [1340, 580], end, TEAL, 4);
    } else {
      phone(ctx, 960, 490, shot.action === 'expand' ? mix(1.7, .8, phase) : .8, 1);
      const options = ['在赶路？', '没带手机？', '还有情况？'];
      options.forEach((label, i) => {
        const u = ease(ramp(p, i * .12, .5 + i * .12));
        const angle = -Math.PI * .7 + i * Math.PI * .7;
        const x = 960 + Math.cos(angle) * 620;
        const y = 480 + Math.sin(angle) * 230;
        node(ctx, label, x, y, 107, i % 2 ? GOLD : BLUE, u);
        line(ctx, 960 + Math.cos(angle) * 160, 480 + Math.sin(angle) * 130, x - Math.cos(angle) * 110, y - Math.sin(angle) * 110, TEAL + '70', 3, u);
      });
      tag(ctx, '补上背景，让解释变多', 960, 790, TEAL, 600);
    }
  }
  return true;
}

function evidenceScene(ctx, shot, p) {
  if (shot.kind === 'evidence') {
    const u = expo(ramp(p,0,.38));
    ctx.save();ctx.translate(735,495);ctx.rotate(mix(-.1,-.025,p));
    panel(ctx,-510,-265,1020,530,BLUE,u,8);
    text(ctx,episode.anchor.author,0,-180,35,INK);
    text(ctx,episode.anchor.year,0,-95,70,GOLD,'center',400,'Anton');
    for(let i=0;i<5;i++) line(ctx,-400,10+i*52,400-i%2*110,10+i*52,BLUE+'55',3);
    ctx.fillStyle=GOLD+'20';ctx.fillRect(-420,mix(0,165,smooth(p)),840,50);
    ctx.restore();
    ['比较条件','研究对象','适用范围'].forEach((v,i)=>{const t=ease(ramp(p,.1+i*.14,.5+i*.14));tag(ctx,v,1490+(1-t)*550,310+i*175,i===2?GOLD:BLUE,380);});
    text(ctx,'回到研究的方法，而不只记一句结论',960,800,39,TEAL);
    return;
  }
  if (shot.kind === 'credits') {
    const sources=episode.sources.slice(0,2);
    text(ctx,'继续追问，回到出处',960,260,72,GOLD);
    sources.forEach((source,i)=>{
      const u=expo(ramp(p,i*.14,.45+i*.14));
      panel(ctx,260+(1-u)*(i?900:-900),370+i*205,1400,170,i?GOLD:BLUE,u,10);
      const value=typeof source==='string'?source:(source.citation||source.title||source.label||source.url||episode.anchor.author);
      wrap(ctx,value,960,455+i*205,1250,29,INK,3);
    });
    text(ctx,'完整研究链接与证据边界见对应课程',960,825,35,TEAL);
    return;
  }
  const entry = expo(ramp(p, 0, .35));
  const x = mix(-800, 165, entry);
  panel(ctx, x, 230, 740, 540, BLUE, 1, 12);
  for (let i = 0; i < 9; i++) line(ctx, x + 45, 300 + i * 46, x + 690, 300 + i * 46, BLUE + '15', 1);
  text(ctx, episode.anchor.year, x + 370, 420, episode.anchor.year.length > 8 ? 90 : 160, GOLD, 'center', 400, 'Anton');
  wrap(ctx, episode.anchor.author, x + 370, 600, 650, 35, INK, 3);
  const words = shot.kind === 'archive' ? ['研究问题', '怎样比较', '适用范围'] : episode.labels.slice(0, 3);
  words.forEach((word, i) => {
    const u = ease(ramp(p, .1 + i * .13, .4 + i * .13));
    node(ctx, word, 1320, 320 + i * 190, 83, i === 2 ? GOLD : BLUE, u);
    if (i < 2) arrow(ctx, [1320, 412 + i * 190], [1320, 408 + i * 190], u, BLUE);
    line(ctx, 1420, 320 + i * 190, 1695, 320 + i * 190, BLUE + '70', 2, u);
  });
}

function drawScene(surface, shot, time) {
  const ctx = surface.getContext('2d', {alpha: false});
  const elapsed = Math.max(0, time - shot.start);
  const p = clamp(elapsed / (shot.end - shot.start));
  background(ctx, shot, p, time);
  const titles = ['hook', 'kinetic', 'impact', 'closing', 'outro'];
  if (titles.includes(shot.kind)) titleScene(ctx, shot, p);
  else if (shot.kind === 'comic') comicScene(ctx, shot, p);
  else if (shot.kind === 'archive' || shot.kind === 'evidence' || shot.kind === 'credits') evidenceScene(ctx, shot, p);
  else if (shot.kind === 'relay') relayScene(ctx, shot, p, elapsed);
  else {
    if (!topicScene(ctx, shot, p) && !specialScene(ctx, shot, p)) conceptualScene(ctx, shot, p, elapsed);
  }
  if (!titles.includes(shot.kind)) {
    const opacity = Math.min(ease(ramp(elapsed, .08, .35)), ease(ramp(shot.end - time, .03, .22)));
    ctx.save();ctx.globalAlpha = opacity;
    const fill = ctx.createLinearGradient(0, 820, 0, 1030);
    fill.addColorStop(0, '#080f1d00');fill.addColorStop(.35, '#080f1de0');fill.addColorStop(1, '#080f1d');
    ctx.fillStyle = fill;ctx.fillRect(0, 810, WIDTH, 220);
    wrap(ctx, shot.text, 960, 886, 1630, shot.text.length > 45 ? 36 : 44, INK, 2);
    text(ctx, shot.en, 960, 969, 25, GOLD);
    ctx.restore();
    text(ctx, shot.kind === 'comic' ? episode.displayTitle : shot.heading, 105, 141, 38, INK, 'left');
  }
  text(ctx, '心间漫游 / ' + episode.english, 105, 61, 23, MUTED, 'left');
  text(ctx, String(shot.index + 1).padStart(2, '0') + ' / 42', 1815, 61, 25, GOLD, 'right', 400, 'Anton');
  text(ctx, '画面为教学示意', 105, 1034, 22, MUTED, 'left');
  text(ctx, episode.anchor.author, 1815, 1034, 22, MUTED, 'right');
  line(ctx, 105, 1005, 1815, 1005, BLUE + '22', 2);
  line(ctx, 105, 1005, 1815, 1005, GOLD, 2, time / episode.duration);
  const nearestBeat = musicAnalysis.beats.reduce((best, beat) => Math.abs(beat.time - time) < Math.abs(best.time - time) ? beat : best, musicAnalysis.beats[0]);
  const pulse = Math.exp(-Math.abs(time - nearestBeat.time) * 15) * .22;
  dot(ctx, mix(105, 1815, time / episode.duration), 1005, 3 + pulse * 5, GOLD);
  if (time > episode.duration - .5) {
    ctx.fillStyle = '#080f1d';ctx.globalAlpha = ramp(time, episode.duration - .5, episode.duration);ctx.fillRect(0, 0, WIDTH, HEIGHT);ctx.globalAlpha = 1;
  }
}

async function makeCompositor() {
  const surface = document.createElement('canvas');surface.width = WIDTH;surface.height = HEIGHT;
  const gl = surface.getContext('webgl', {alpha: false, preserveDrawingBuffer: true, antialias: false});
  if (!gl) throw new Error('WebGL transition compositor unavailable');
  const vertex = 'attribute vec2 position; varying vec2 uv; void main(){uv=(position+1.0)*0.5;gl_Position=vec4(position,0.,1.);}';
  const header = 'precision highp float; varying vec2 uv; uniform sampler2D fromTex; uniform sampler2D toTex; uniform float progress; vec4 getFromColor(vec2 p){return texture2D(fromTex,vec2(p.x,1.-p.y));} vec4 getToColor(vec2 p){return texture2D(toTex,vec2(p.x,1.-p.y));}';
  const programs = {};
  function compile(type, source) {
    const shader = gl.createShader(type);gl.shaderSource(shader, source);gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  for (const name of ['DirectionalWipe', 'CircleOpen', 'Doorway', 'CrossZoom']) {
    const code = await (await fetch('reference/gl/' + name + '.glsl')).text();
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, header + '\n' + code + '\nvoid main(){gl_FragColor=transition(uv);}'));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    programs[name] = program;
  }
  const buffer = gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const textures = [gl.createTexture(), gl.createTexture()];
  textures.forEach(texture => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  });
  return function transition(from, to, name, progress) {
    const program = programs[name];gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'position');gl.bindBuffer(gl.ARRAY_BUFFER, buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    [from, to].forEach((source, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);gl.bindTexture(gl.TEXTURE_2D, textures[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    });
    gl.uniform1i(gl.getUniformLocation(program, 'fromTex'), 0);gl.uniform1i(gl.getUniformLocation(program, 'toTex'), 1);
    gl.uniform1f(gl.getUniformLocation(program, 'progress'), progress);
    gl.uniform2f(gl.getUniformLocation(program, 'direction'), 1, -1);
    gl.uniform1f(gl.getUniformLocation(program, 'smoothness'), .18);
    gl.uniform1i(gl.getUniformLocation(program, 'opening'), 1);
    gl.uniform1f(gl.getUniformLocation(program, 'reflection'), .22);
    gl.uniform1f(gl.getUniformLocation(program, 'perspective'), .45);
    gl.uniform1f(gl.getUniformLocation(program, 'depth'), 2.4);
    gl.uniform1f(gl.getUniformLocation(program, 'strength'), .15);
    gl.viewport(0, 0, WIDTH, HEIGHT);gl.drawArrays(gl.TRIANGLES, 0, 6);
    return surface;
  };
}

window.render = function render(time) {
  time = clamp(time, 0, episode.duration - .001);
  let index = episode.shots.findIndex(shot => shot.start <= time && time < shot.end);
  if (index < 0) index = episode.shots.length - 1;
  let boundary = -1;
  if (index > 0 && time < episode.shots[index].start + .22) boundary = index;
  else if (index < episode.shots.length - 1 && time > episode.shots[index].end - .22) boundary = index + 1;
  if (boundary >= 0) {
    const cut = episode.shots[boundary].start;
    drawScene(sceneA, episode.shots[boundary - 1], time);
    drawScene(sceneB, episode.shots[boundary], time);
    let name = [18,24,38].includes(boundary) ? 'CrossZoom' : episode.shots[boundary].transition;
    if (name === 'CrossZoom' && ![18,24,38].includes(boundary)) name = 'DirectionalWipe';
    const result = compositor(sceneA, sceneB, name, smooth(ramp(time, cut - .22, cut + .22)));
    output.drawImage(result, 0, 0);
  } else {
    drawScene(sceneA, episode.shots[index], time);
    output.drawImage(sceneA, 0, 0);
  }
  return {shot: index, kind: episode.shots[index].kind, action: episode.shots[index].action};
};

window.ready = (async () => {
  const id = new URLSearchParams(location.search).get('id') || 'knowledge-curse';
  const episodes = await (await fetch('episodes.json')).json();
  episode = episodes.find(item => item.id === id);
  if (!episode) throw new Error('Unknown episode ' + id);
  musicAnalysis = await (await fetch('music-analysis.json')).json();
  pictures = await Promise.all(Array.from({length: 6}, async (_, i) => {
    const picture = new Image();picture.src = `assets/comics/${id}/${String(i + 1).padStart(2, '0')}.webp`;
    await picture.decode();return picture;
  }));
  await Promise.all([document.fonts.load('500 44px FilmSans'), document.fonts.load('700 112px FilmSans'), document.fonts.load('400 120px Anton')]);
  compositor = await makeCompositor();
  window.episode = episode;
  window.render(0);
  return {width: WIDTH, height: HEIGHT, duration: episode.duration, shots: episode.shots.length};
})();
