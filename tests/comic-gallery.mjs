// Browser regression for readable, uncropped album layouts and detail navigation.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const modulePath = option('--playwright', 'playwright');
const {chromium} = await import(path.isAbsolute(modulePath) ? pathToFileURL(modulePath).href : modulePath);
const base = option('--base', 'http://127.0.0.1:4173/').replace(/\/?$/, '/');
const lessons = await (await fetch(base + 'content/lessons.json')).json();
const browser = await chromium.launch({executablePath: option('--chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe'), headless: true});
const report = {base, checkedAt: new Date().toISOString(), layouts: [], navigation: [], errors: []};
const runtimeErrors = [];

try {
  for (const width of [1366, 390, 320, 768, 1024]) {
    const context = await browser.newContext({viewport: {width, height: 900}, reducedMotion: 'reduce'});
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => runtimeErrors.push(error.message));
    const videos = [];
    page.on('request', request => { if (request.url().endsWith('.mp4')) videos.push(request.url()); });
    const selected = [1366, 390].includes(width) ? lessons : lessons.filter(l => ['attribution', 'gratitude', 'test-validity'].includes(l.id));
    for (const lesson of selected) {
      try {
        await page.goto(base + '#/story/' + lesson.id);
        await page.locator(`[data-save="${lesson.id}"]`).waitFor();
        await page.locator('.comic-grid img').evaluateAll(images => Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode(); })));
        const result = await page.evaluate(() => {
          const grid = document.querySelector('.comic-grid');
          const panels = [...grid.querySelectorAll('.comic-panel')].map(panel => {
            const rect = panel.getBoundingClientRect(), image = panel.querySelector('img');
            return {x: rect.x, y: rect.y, width: rect.width, height: rect.height, imageLoaded: image.complete && image.naturalWidth > 0, fit: getComputedStyle(image).objectFit};
          });
          const bubbles = [...grid.querySelectorAll('.image-bubble')].map(bubble => {
            const rect = bubble.getBoundingClientRect(), frame = bubble.closest('.independent-frame').getBoundingClientRect();
            return {inside: rect.left >= frame.left - 1 && rect.right <= frame.right + 1 && rect.top >= frame.top - 1 && rect.bottom <= frame.bottom + 1, font: parseFloat(getComputedStyle(bubble).fontSize)};
          });
          return {columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length, gridHeight: grid.getBoundingClientRect().height, pageHeight: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth > innerWidth, panels, bubbles};
        });
        assert.equal(result.overflow, false, 'page must fit its viewport');
        assert.equal(result.panels.length, lesson.panels.length, 'all frames stay on the page');
        assert.equal(result.columns, width > 760 ? 3 : 2);
        assert.ok(result.panels.every(panel => panel.width >= 120 && panel.width <= 300 && panel.imageLoaded && panel.fit === 'contain'), 'small, complete images');
        for (let i = 1; i < result.panels.length; i++) {
          const previous = result.panels[i - 1], current = result.panels[i];
          assert.ok(current.y > previous.y || (current.y === previous.y && current.x > previous.x), 'left-to-right, top-to-bottom order');
        }
        assert.ok(result.bubbles.every(bubble => bubble.inside && bubble.font >= 12), 'overlay dialogue must remain legible and inside its frame');
        if (width > 760) assert.ok(result.gridHeight < 750, 'whole comic should fit in a single reading view');
        assert.equal(await page.locator('.reader-aside').isVisible(), true, 'research navigation is available on mobile');
        assert.equal(videos.length, 0, 'viewing the album must not load a film');
        report.layouts.push({width, id: lesson.id, columns: result.columns, frameWidth: result.panels[0].width, comicHeight: result.gridHeight, pageHeight: result.pageHeight});
      } catch (error) {
        report.errors.push({width, id: lesson.id, message: error.message});
      }
    }
    if ([1366, 390].includes(width)) {
      await page.goto(base + '#/story/attribution');
      await page.locator('[data-save="attribution"]').waitFor();
      const first = page.locator('.panel-open').first();
      await first.click();
      const dialog = page.locator('#panel-dialog');
      assert.equal(await dialog.evaluate(el => el.open), true);
      assert.equal(await dialog.evaluate(el => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1), true, 'image, caption and controls fit the detail window');
      assert.equal(await dialog.locator('[data-panel-step="-1"]').isDisabled(), true);
      await dialog.locator('[data-panel-step="1"]').click();
      assert.equal(await page.locator('#panel-dialog-counter').innerText(), '02 / 06');
      await page.keyboard.press('ArrowLeft');
      assert.equal(await page.locator('#panel-dialog-counter').innerText(), '01 / 06');
      for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#panel-dialog-counter').innerText(), '06 / 06');
      assert.equal(await dialog.locator('[data-panel-step="1"]').isDisabled(), true);
      assert.ok((await dialog.locator('img').getAttribute('src')).endsWith('/06.webp'));
      await page.keyboard.press('Escape');
      assert.equal(await dialog.evaluate(el => el.open), false);
      assert.equal(await first.evaluate(el => document.activeElement === el), true, 'closing returns focus to the original frame');
      await page.locator('.comic-transcript summary').click();
      assert.equal(await page.locator('.comic-transcript li').count(), 6);
      await page.locator('[data-prediction]').nth(1).click();
      assert.equal(await page.locator('[data-prediction][aria-pressed="true"]').count(), 1);
      assert.ok((await page.locator('.prediction-feedback').innerText()).length > 10);
      for (const [route, selector] of [['#/', '.hero h1'], ['#/explore', '#search-input'], ['#/collection', '.shelf-stats'], ['#/map', '.knowledge-atlas'], ['#/discover', '.discovery-tabs'], ['#/library', '.book-grid'], ['#/about', '.about-page']]) {
        await page.goto(base + route);
        await page.locator(selector).first().waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, route + ' must fit the viewport');
      }
      report.navigation.push({width, keyboard: 'pass', focusRestored: true, transcript: 'pass', prediction: 'pass', otherPages: 7});
    }
    await context.close();
  }
} finally {
  await browser.close();
}
assert.deepEqual(runtimeErrors, []);
const output = option('--out', '');
if (output) { await fs.mkdir(path.dirname(output), {recursive: true}); await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n'); }
console.log(JSON.stringify({layouts: report.layouts.length, widths: [...new Set(report.layouts.map(item => item.width))], navigation: report.navigation, failures: report.errors}, null, 2));
if (report.errors.length) process.exitCode = 1;
