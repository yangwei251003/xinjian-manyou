export const W = 1600;
export const H = 900;
export const PI = Math.PI;
export const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const mix = (a, b, p) => a + (b - a) * p;
export function phase(p, start = 0, end = 1) {
  const x = clamp((p - start) / (end - start));
  return x * x * (3 - 2 * x);
}
export function rng(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export function saved(c, draw) {
  c.save();
  try { draw(); } finally { c.restore(); }
}
export function fill(c, color) { rect(c, 0, 0, W, H, color); }
export function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}
export function round(c, x, y, w, h, r, color, border, width = 2) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  if (color) { c.fillStyle = color; c.fill(); }
  if (border) { c.strokeStyle = border; c.lineWidth = width; c.stroke(); }
}
export function poly(c, points, color, border, width = 2) {
  c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.closePath();
  if (color) { c.fillStyle = color; c.fill(); }
  if (border) { c.strokeStyle = border; c.lineWidth = width; c.stroke(); }
}
export function path(c, svg, color, border, width = 2) {
  const outline = new Path2D(svg);
  if (color) { c.fillStyle = color; c.fill(outline); }
  if (border) { c.strokeStyle = border; c.lineWidth = width; c.stroke(outline); }
}
export function line(c, points, color, width = 2, dash = []) {
  c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineJoin = 'round';
  c.lineCap = 'round';
  c.setLineDash(dash);
  c.stroke();
  c.setLineDash([]);
}
export function arrow(c, x, y, endX, endY, color, width = 4) {
  line(c, [[x, y], [endX, endY]], color, width);
  const a = Math.atan2(endY - y, endX - x);
  const size = width * 4 + 7;
  poly(c, [[endX, endY], [endX - size * Math.cos(a - .45), endY - size * Math.sin(a - .45)], [endX - size * Math.cos(a + .45), endY - size * Math.sin(a + .45)]], color);
}
export function ellipse(c, x, y, rx, ry, color, border, width = 2) {
  c.beginPath();
  c.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), 0, 0, 2 * PI);
  if (color) { c.fillStyle = color; c.fill(); }
  if (border) { c.strokeStyle = border; c.lineWidth = width; c.stroke(); }
}
export function clip(c, x, y, w, h, draw) {
  saved(c, () => {
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    draw();
  });
}
export function gradient(c, x, y, x2, y2, stops) {
  const paint = c.createLinearGradient(x, y, x2, y2);
  for (const [offset, color] of stops) paint.addColorStop(offset, color);
  return paint;
}
export function lit(c, x, y, radius, stops) {
  const paint = c.createRadialGradient(x, y, 0, x, y, radius);
  for (const [offset, color] of stops) paint.addColorStop(offset, color);
  return paint;
}
export function withAlpha(c, amount, draw) {
  if (amount > 0) saved(c, () => { c.globalAlpha *= clamp(amount); draw(); });
}
export function T(c, content, x, y, size, color, options = {}) {
  if (c.graphicsOnly) return;
  const {align = 'left', font = 'StudioSans', weight = 650, leading = 1.2, max = W - 2 * 42} = options;
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = 'alphabetic';
  c.font = `${weight} ${size}px ${font}, StudioSans, sans-serif`;
  String(content).split('\n').forEach((row, i) => c.fillText(row, x, y + size * leading * i, max));
}
export function grid(c, step, color, region = [0, 0, W, H]) {
  const [x, y, w, h] = region;
  c.beginPath();
  for (let i = x; i <= x + w; i += step) { c.moveTo(i, y); c.lineTo(i, y + h); }
  for (let j = y; j <= y + h; j += step) { c.moveTo(x, j); c.lineTo(x + w, j); }
  c.lineWidth = 1; c.strokeStyle = color; c.stroke();
}
const textures = new Map();
export function grain(c, seed, opacity = .1) {
  if (!textures.has(seed)) {
    const surface = new OffscreenCanvas(256, 256);
    const paint = surface.getContext('2d');
    const data = paint.createImageData(256, 256);
    const random = rng(seed);
    for (let i = 0; i < data.data.length; i += 4) {
      const tone = random() < .5 ? 0 : 255;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = tone;
      data.data[i + 3] = random() * 36;
    }
    paint.putImageData(data, 0, 0);
    textures.set(seed, surface);
  }
  withAlpha(c, opacity, () => fill(c, c.createPattern(textures.get(seed), 'repeat')));
}

export function subtitles(c, film, text) {
  if (!text || c.graphicsOnly) return;
  c.font = '570 35px StudioSans, sans-serif';
  const rows = [];
  let current = '';
  for (const char of text) {
    if (c.measureText(current + char).width > 1365 && !'，。！？、；”'.includes(char)) {
      rows.push(current); current = '';
    }
    current += char;
  }
  if (current) rows.push(current);
  const height = rows.length * 44 + 27;
  const y = 878 - height;
  const longest = Math.max(...rows.map(row => c.measureText(row).width));
  const width = longest + 64;
  round(c, (W - width) / 2, y, width, height, 12, film.subtitle[0]);
  T(c, rows.join('\n'), W / 2, y + 43, 35, film.subtitle[1], {align: 'center', weight: 570, leading: 44 / 35, max: 1436});
}
