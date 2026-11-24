// The Cell Block style sheet: every picture is drawn by the style's own engine (3D sets + 2D cut-out people).
import * as THREE from 'three';
import { ctx } from './core/lib.js';
import { startBoard, panel, frame, small, rules } from './core/board.js';
import { makeEngine, camera } from './core/engine.js';
import * as J from './core/jail.js';
import { Toon, drawToon, PROPS } from './core/toon.js';
import { captionText } from './core/captions.js';
import { CAST } from './cast.js';

await document.fonts.load('900 40px Inter'); await document.fonts.load('800 40px Inter');
const GL = document.getElementById('gl'), GL2 = document.getElementById('gl2');
GL.width = 648; GL.height = 1152;
const E = makeEngine(GL, { w: 648, h: 1152, samples: 0 }), E2 = makeEngine(GL2, { w: 1280, h: 860, samples: 0 });
const cam = camera(36);
const B = startBoard(document.getElementById('cv'), { title: 'CELL BLOCK 3D: VIDEO STYLE SHEET', author: 'WHAT IF HOW · 2026', bg: '#141A2E', line: '#3A4468', head: '#FFF6E6', accent: '#FFC21A' });
const shot = (x, y, w, renderFn, over) => frame(x, y, w, () => { renderFn(); ctx.drawImage(GL, 0, 0, 1080, 1920); if (over) over(); });
const wide = (box, renderFn, over) => { renderFn(); B.save(); B.beginPath(); B.roundRect(box.x, box.y, box.w, box.h, 12); B.clip(); B.drawImage(GL2, box.x, box.y, box.w, box.h); B.restore(); if (over) over(); };
const R = (cam2, E3, scene, people, focus, look = {}) => { people.forEach((p) => p.face(cam2)); E3.render(scene, cam2, { focus, aperture: 0.001, maxblur: 0.008, bloom: 0.25, ...look }); };

// sets
const CELL = J.cell(E, { cash: true });
const hero = new Toon(CAST.hero), boss = new Toon(CAST.boss), guard = new Toon(CAST.guard), guard2 = new Toon(CAST.rookie);
CELL.scene.add(hero.group, guard.group, guard2.group);

// 1 · hero frame (the cell, cash on the bunk, guards at the door)
let b = panel(20, 80, 540, 520, 1, 'HERO FRAME');
shot(b.x + 4, b.y, 246, () => {
  hero.at(-0.5, 0, -2.0); hero.set({ mood: 'smug', armL: [150, 40], armR: [150, 40], sweat: 1 });
  guard.at(-0.3, 0, -4.4); guard.set({ mood: 'shock' }); guard2.at(0.7, 0, -4.6); guard2.set({ mood: 'laugh', armR: [40, -60], holdR: PROPS.keys });
  cam.position.set(0.3, 1.5, 1.4); cam.lookAt(-0.1, 1.2, -3); R(cam, E, CELL.scene, [hero, guard, guard2], 3.4);
}, () => captionText('every'));
[['2D CARTOON PEOPLE', 'thick ink, big round heads'], ['INSIDE A 3D WORLD', 'cells, canteens, vaults'], ['LOUD, VIVID COLOUR', 'saturated, bright, glossy'], ['A TRUE CAPER', 'escapes, heists, cons'], ['ONE WORD AT A TIME', 'white, centre screen']]
  .forEach(([a, c], i) => { small(a, b.x + 270, b.y + 34 + i * 86, 'left', 16, '#FFF6E6'); small(c.toUpperCase(), b.x + 270, b.y + 58 + i * 86, 'left', 12, '#A9B0CC'); });

// 2 · cast
b = panel(570, 80, 690, 520, 2, 'THE CAST');
{
  const g = B; g.save(); g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h - 8, 12); g.clip();
  const gr = g.createLinearGradient(0, b.y, 0, b.y + b.h); gr.addColorStop(0, '#5B8CFF'); gr.addColorStop(0.7, '#A9C4FF'); gr.addColorStop(0.7, '#8A6BD0'); gr.addColorStop(1, '#6B4FB0');
  g.fillStyle = gr; g.fillRect(b.x, b.y, b.w, b.h);
  const roles = [['hero', 'HERO', { mood: 'smug', armR: [30, -84], holdR: PROPS.spoon }], ['boss', 'BOSS', { mood: 'laugh', armL: [150, 20], armR: [30, -70], holdR: PROPS.cards }], ['guard', 'GUARD', { mood: 'shock', armL: [40, -40], armR: [40, -40] }],
    ['oldtimer', 'OLD-TIMER', { mood: 'sly', armR: [20, -110] }], ['robber', 'ROBBER', { mood: 'happy', armL: [20, -60], holdL: PROPS.moneybag }], ['warden', 'WARDEN', { mood: 'angry', armL: [30, -70], holdL: PROPS.paper('ESCAPE?') }]];
  roles.forEach(([k, name, st], i) => { g.save(); g.translate(b.x + 6 + i * 110, b.y + 40); g.scale(0.22, 0.22); drawToon(g, CAST[k], st); g.restore(); small(name, b.x + 62 + i * 110, b.y + b.h - 30, 'center', 13, '#FFFFFF'); });
  g.restore();
  small('RECIPE: ROUND WHITE HEAD · BEAN BODY · STICK LIMBS · ONE HAIR OR HAT · ONE SIGNATURE THING', b.x + b.w / 2, b.y + b.h + 6, 'center', 12, '#A9B0CC');
}

// 3 · faces + parts
b = panel(1270, 80, 630, 520, 3, 'FACES + PARTS');
{
  const moods = ['neutral', 'smug', 'happy', 'laugh', 'shock', 'worried', 'angry', 'sad', 'sly', 'proud', 'tired', 'dizzy'];
  moods.forEach((m, i) => {
    const cx = b.x + 52 + (i % 6) * 100, cy = b.y + 2 + Math.floor(i / 6) * 140;
    B.save(); B.beginPath(); B.roundRect(cx - 46, cy, 92, 108, 10); B.fillStyle = '#26304F'; B.fill(); B.clip();
    B.translate(cx - 75, cy + 4); B.scale(0.29, 0.29); drawToon(B, CAST.hero, { mood: m, look: m === 'sly' ? [1, 0] : [0, 0] }); B.restore();
    small(m.toUpperCase(), cx, cy + 126, 'center', 12, '#FFF6E6');
  });
  const parts = [['TUFT', { hair: 'tuft', hairCol: '#7A4A2E' }], ['SHADES', { extra: ['shades'], hair: 'swoop', hairCol: '#2A2238' }], ['CHAIN', { extra: ['chain'], hair: 'bald', hairCol: '#9A8A80' }], ['GUARD CAP', { hat: 'guard', hatCol: '#26305A', pattern: 'uniform', body: '#B8C8E8' }], ['MASK', { extra: ['mask'], hat: 'beanie', hatCol: '#2A2238' }], ['BEARD', { extra: ['beard'], hat: 'bandana', hatCol: '#E2344A' }]];
  parts.forEach(([n, lk], i) => {
    const cx = b.x + 52 + i * 100, cy = b.y + 290;
    B.save(); B.beginPath(); B.roundRect(cx - 46, cy, 92, 96, 10); B.fillStyle = '#FFC21A'; B.fill(); B.clip();
    B.translate(cx - 70, cy - 6); B.scale(0.27, 0.27); drawToon(B, { ...CAST.hero, hair: 'none', extra: [], ...lk }, { mood: 'neutral' }); B.restore();
    small(n, cx, cy + 114, 'center', 12, '#FFC21A');
  });
}

// 4 · worlds
b = panel(20, 610, 760, 456, 4, 'WORLDS');
const sw = 160, sx = (i) => b.x + 8 + i * (sw + 22);
{
  const CT = J.canteen(E), p1 = new Toon(CAST.boss), p2 = new Toon(CAST.oldtimer), p3 = new Toon(CAST.hero); CT.scene.add(p1.group, p2.group, p3.group);
  const s0 = CT.P.seat(0, 1), s1 = CT.P.seat(0, 2), s2 = CT.P.seat(0, 3);
  p1.at(0, 0, -3.95); p1.set({ mood: 'smug', legs: 'sit', armL: [60, -80], holdL: PROPS.cards }); p2.at(-0.95, 0, -3.5); p2.set({ mood: 'sly', legs: 'sit', armR: [60, -80], holdR: PROPS.cards }); p3.at(0.95, 0, -3.5); p3.set({ mood: 'worried', legs: 'sit', armL: [60, -80], holdL: PROPS.cards });
  shot(sx(0), b.y, sw, () => { cam.position.set(0, 1.7, 0.2); cam.lookAt(0, 1.1, -4); R(cam, E, CT.scene, [p1, p2, p3], 3.8); });
}
{
  const V = J.vault(E), r = new Toon(CAST.robber); V.scene.add(r.group);
  r.at(V.P.hole[0] + 0.1, -0.55, V.P.hole[2]); r.set({ mood: 'happy', armL: [100, 20], armR: [30, -60], holdR: PROPS.moneybag });
  shot(sx(1), b.y, sw, () => { cam.position.set(-0.6, 2.2, 3.2); cam.lookAt(-0.1, 1.3, -4); R(cam, E, V.scene, [r], 5.6, { bloom: 0.12, bloomThreshold: 0.95 }); });
}
{
  const C2 = J.cell(E, { low: '#E2344A', up: '#FFF0E6', mattress: '#3C6FE0', number: 'D-2-07' }), h2 = new Toon(CAST.hero); C2.scene.add(h2.group);
  h2.at(0.3, 0, -2.4); h2.set({ mood: 'tired', legs: 'sit' }); h2.at(0.35, 0.42, -2.6);
  shot(sx(2), b.y, sw, () => { cam.position.set(-1.1, 1.5, 0.6); cam.lookAt(0.4, 1.0, -2.8); R(cam, E, C2.scene, [h2], 3.4); });
}
{
  const Y = J.yard(E), g1 = new Toon(CAST.guard), h3 = new Toon(CAST.hero); Y.scene.add(g1.group, h3.group);
  h3.at(-0.3, 0, -5); h3.set({ mood: 'happy', legs: 'run', phase: 1 }); g1.at(0.9, 0, -8.5); g1.set({ mood: 'angry', armR: [120, 20] });
  shot(sx(3), b.y, sw, () => { cam.position.set(0.2, 1.7, 0.6); cam.lookAt(0.3, 1.6, -9); R(cam, E, Y.scene, [g1, h3], 4.8, { bloom: 0.15 }); });
}
['(A) CANTEEN', '(B) BANK VAULT', '(C) A CELL', '(D) THE YARD'].forEach((t, i) => small(t, sx(i) + sw / 2, b.y + sw * 16 / 9 + 24, 'center', 13));

// 5 · captions
b = panel(790, 610, 520, 456, 5, 'CAPTIONS');
wide({ x: b.x, y: b.y, w: b.w, h: b.h - 10 }, () => {
  hero.at(-0.6, 0, -1.6); hero.set({ mood: 'shock', look: [0.6, 0], sweat: 1 });
  const c3 = new THREE.PerspectiveCamera(32, 1280 / 860, 0.05, 800); c3.position.set(-0.1, 1.5, 1.2); c3.lookAt(-0.4, 1.4, -2.5); R(c3, E2, CELL.scene, [hero, guard, guard2], 2.8, { aperture: 0.003, maxblur: 0.012 });
}, () => {
  const mid = b.x + b.w / 2;
  [['He dug', 60], ['every', 160], ['single night', 260]].forEach(([w, y]) => { B.save(); B.translate(mid, b.y + y); B.scale(0.5, 0.5); captionText(w, 0, 0); B.restore(); });
  small('ONE WORD AT A TIME · WHITE · BLACK EDGE · CENTRE', mid, b.y + b.h - 34, 'center', 13, '#FFFFFF');
});

// 6 · rules
b = panel(1320, 610, 580, 456, 6, 'RULES');
rules(b, ['OPEN ON THE CRAZIEST MOMENT.', 'REWIND: "SEE, ..." THEN THE PLAN, STEP BY STEP.', 'NEW SHOT EVERY 1.5-3 S; CAMERA NEVER STOPS.', 'FACES REACT ON EVERY BEAT.', 'BOLD, SATURATED COLOUR: NO GREY, NO MUD.', 'TRUE STORIES ONLY. NO GORE.', 'END ON A PUNCHLINE THAT FLIPS THE START.'], b.y + 26, 16, 52);
window.SHEET_READY = true;
