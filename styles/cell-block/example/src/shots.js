// THE MEN WHO LEFT THEIR HEADS IN BED: the shot list (Cell Block 3D example, the 1962 Alcatraz escape).
// A shot: { id, at, note, draw(lt, d, t, blit) }: pose the cut-out people, move the camera, E.render(...), blit(),
// then any 2D overlay. Every shot moves the camera. Times come from the voice: cut(i) = just before line i,
// Wd('word', i) = when that word is said.
import * as THREE from 'three';
import { ctx, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as J from './core/jail.js';
import { Toon, PROPS } from './core/toon.js';
import { CAST } from './cast.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const talk = (t, on = 1) => (on ? 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3)) : 0);
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);
const person = (k, opts, patch = {}) => new Toon({ ...CAST[k], extra: [...(CAST[k].extra || [])], ...patch }, opts);

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LOOKS = { room: { bloom: 0.28, aperture: 0.001, maxblur: 0.008 }, night: { bloom: 0.45, aperture: 0.0008, maxblur: 0.007, exposure: 1.0 }, wide: { bloom: 0.2, aperture: 0.0005, maxblur: 0.006 } };
  const shoot = (scene, people, from, to, at, at2, k, look, focus) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at);
    people.forEach((p) => p.face(cam));
    E.render(scene, cam, { ...look, focus: focus ?? cam.position.distanceTo(at2 ? mix(at, at2, k) : at), t: k });
  };

  // ── sets ─────────────────────────────────────────────────────────────
  // the cell (Morris's): blanket over the lower bunk, a dummy head on the pillow, a vent grille low on the left wall
  const CL = J.cell(E, { number: 'B-138' });
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.22, 1.5), WD.mat({ color: '#E2344A', roughness: 0.9 })); blanket.position.set(CL.w / 2 - 0.55, 0.62, -CL.depth / 2 + 0.2); blanket.castShadow = blanket.receiveShadow = true; CL.scene.add(blanket);
  const dummy = person('hero', { height: 1.75 }); dummy.at(CL.w / 2 - 0.5, -0.66, -CL.depth / 2 - 0.75); CL.scene.add(dummy.group);   // only the head pokes above the blanket
  const vent = new THREE.Group(); vent.position.set(-CL.w / 2 + 0.11, 0.5, -CL.depth / 2 - 0.2); CL.scene.add(vent);
  vent.add(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.62), WD.mat({ color: '#9AA4B8', metalness: 0.5, roughness: 0.4 })));
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.56), WD.mat({ color: '#5B6478' })); s.position.set(0.02, -0.17 + i * 0.057, 0); vent.add(s); }
  const ventHole = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.46), new THREE.MeshBasicMaterial({ color: '#120E18' })); ventHole.rotation.y = Math.PI / 2; ventHole.position.set(-CL.w / 2 + 0.105, 0.5, -CL.depth / 2 - 0.2); ventHole.visible = false; CL.scene.add(ventHole);
  const dust = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.018, 0), WD.mat({ color: '#D9CBB0' }), 40); CL.scene.add(dust);
  const clHero = person('hero'), clGuard = person('guard'), clMate1 = person('oldtimer'), clMate2 = person('boss');
  [clHero, clGuard, clMate1, clMate2].forEach((p) => CL.scene.add(p.group));
  const clPeople = [clHero, clGuard, clMate1, clMate2, dummy];
  const hideAll = () => clPeople.forEach((p) => (p.group.visible = p === dummy));
  const nightCell = (on) => { CL.scene.background.set(on ? '#0B1024' : '#1A2340'); CL.sun.key.intensity = on ? 0.7 : 2.4; CL.scene.environmentIntensity = on ? 0.15 : 0.4; };

  // the canteen
  const CT = J.canteen(E, { tvText: 'CHOW' });
  const ctHero = person('hero'), ctBoss = person('boss'), ctOld = person('oldtimer'), ctGuard = person('guard');
  [ctHero, ctBoss, ctOld, ctGuard].forEach((p) => CT.scene.add(p.group));

  // the bay at night: dark water, the island and its lights behind, a raincoat raft
  const BAY = new THREE.Scene();
  WD.sky(BAY, { top: '#0B1030', horizon: '#3A3F8A' }); BAY.environment = E.envMap; BAY.environmentIntensity = 0.2;
  const water = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 80, 80), new THREE.MeshStandardMaterial({ color: '#1E4FB8', roughness: 0.25, metalness: 0.2 })); water.rotation.x = -Math.PI / 2; water.receiveShadow = true; BAY.add(water);
  const moon = new THREE.DirectionalLight('#BFD6FF', 1.8); moon.position.set(-6, 10, -8); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); Object.assign(moon.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); moon.shadow.camera.updateProjectionMatrix(); BAY.add(moon, moon.target);
  BAY.add(new THREE.HemisphereLight('#6A78D8', '#0A1430', 1.2));
  const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshBasicMaterial({ color: '#FFF6D0', toneMapped: false })); moonDisc.position.set(-40, 38, -160); BAY.add(moonDisc);
  const island = new THREE.Mesh(new THREE.ConeGeometry(14, 7, 7), WD.mat({ color: '#2B2F55' })); island.position.set(18, 0.5, -60); island.scale.set(1.6, 1, 1); BAY.add(island);
  const prisonBlock = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 4), WD.mat({ color: '#3A4078' })); prisonBlock.position.set(18, 5, -60); BAY.add(prisonBlock);
  for (let i = 0; i < 10; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), new THREE.MeshBasicMaterial({ color: '#FFE27A', toneMapped: false })); l.position.set(12 + i * 1.3, 5.3, -57.9); BAY.add(l); }
  const beam = new THREE.Mesh(new THREE.ConeGeometry(4, 40, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#FFF2B0', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); beam.position.set(8, 12, -50); BAY.add(beam);
  const raft = new THREE.Group(); BAY.add(raft);
  { const rm = WD.mat({ color: '#E8B838', roughness: 0.7 }); const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 2.6, 6, 16), rm); body.rotation.z = Math.PI / 2; body.position.set(0, 0.25, -0.45); body.castShadow = true; raft.add(body);
    const b2 = body.clone(); b2.position.z = 0.45; raft.add(b2); const deck = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 0.9), WD.mat({ color: '#C99A2E' })); deck.position.y = 0.3; raft.add(deck);
    for (let i = -3; i <= 3; i++) { const sm = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.015, 6, 20, Math.PI), WD.mat({ color: '#8A6A1E' })); sm.position.set(i * 0.4, 0.25, -0.45); sm.rotation.y = Math.PI / 2; raft.add(sm); } }
  const rafters = [person('hero'), person('oldtimer'), person('boss')]; rafters.forEach((p, i) => { raft.add(p.group); p.at(-0.9 + i * 0.9, -0.1, 0); });
  const dawn = new THREE.Mesh(new THREE.PlaneGeometry(700, 160), new THREE.MeshBasicMaterial({ map: WD.canvasTex('dawn', 64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3A3F8A'); gr.addColorStop(0.55, '#FF7A8A'); gr.addColorStop(1, '#FFC46A'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), toneMapped: false, depthWrite: false }));
  dawn.position.set(0, 60, -190); dawn.visible = false; BAY.add(dawn);
  const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 1.0), WD.mat({ color: '#8A5A36' })); BAY.add(paddle);

  // ── 0 · HOOK: "In 1962, three men broke out of Alcatraz," (dolly down the cell corridor, three inmates sneak past the bars) ──
  { const st = cut(0), wb = Wd('broke', 0);
    add({ id: 'S01', at: st, note: 'night: through the bars, three inmates tiptoe along the corridor, a guard asleep on a stool', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); nightCell(true); dummy.group.visible = false; ventHole.visible = false; dust.visible = false;
      [clHero, clMate1, clMate2].forEach((p, i) => { p.group.visible = true; p.at(lerp(-3.0, 0.6, k) - i * 1.0, 0, -CL.depth - 0.7 - i * 0.55); p.set({ legs: 'walk', phase: t * 6 + i, lean: 6, mood: i === 0 ? 'sly' : 'worried', look: [1, 0], armL: [30, 30], armR: [30, 30] }); });
      clGuard.group.visible = true; clGuard.at(-3.6, 0, -CL.depth - 1.9); clGuard.set({ mood: 'tired', blink: 1, legs: 'sit', lean: -6 });
      shoot(CL.scene, clPeople, V3(3.4, 1.7, -CL.depth - 2.1), V3(2.8, 1.6, -CL.depth - 2.0), V3(-1.6, 1.1, -CL.depth - 0.9), V3(-0.6, 1.1, -CL.depth - 1.0), k, { ...LOOKS.night, fov: 40 });
      blit();
    } });
    cue(st + 0.05, 'whoosh', { gain: 0.6 }); cue(Wd('1962', 0), 'ding', { gain: 0.6 }); cue(wb, 'boing', { gain: 0.5 }); }

  // ── 1 · "and left their own heads in bed." (push in on the bunk: a smiling head on the pillow) ──
  { const st = cut(1), wh = Wd('heads', 1);
    add({ id: 'S02', at: st, note: 'push in on the lower bunk: a sleeping head on the pillow under the red blanket', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); nightCell(true); ventHole.visible = false; dust.visible = false;
      dummy.set({ mood: 'happy', v: 'sleep' });
      shoot(CL.scene, clPeople, V3(-0.2, 1.25, -0.6), V3(0.4, 0.95, -1.7), V3(CL.w / 2 - 0.5, 0.75, -CL.depth / 2 - 0.6), null, k, LOOKS.night);
      blit();
      const p = clamp((t - wh) / 0.25); if (p > 0) { ctx.save(); ctx.globalAlpha = p; ctx.font = '900 140px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFC21A'; ctx.strokeStyle = '#1F1C33'; ctx.lineWidth = 14; ctx.translate(820, 560); ctx.rotate(-0.15 + Math.sin(t * 3) * 0.05); ctx.strokeText('?!', 0, 0); ctx.fillText('?!', 0, 0); ctx.restore(); }
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(wh, 'pop', { gain: 0.8 }); }

  // ── 2 · "See, for months, they dug through the vents in their cells," (hero kneels at the vent, scraping, dust flies) ──
  { const st = cut(2), wd = Wd('dug', 2);
    add({ id: 'S03', at: st, note: 'day: hero kneels at the low wall vent, scraping with a spoon, dust puffs; the grille comes off on "vents"', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); nightCell(false); dummy.group.visible = false;
      const off = t > Wd('vents', 2); vent.visible = !off; ventHole.visible = off;
      clHero.group.visible = true; clHero.at(-CL.w / 2 + 0.75, 0, -CL.depth / 2 - 0.05);
      const scrape = t > wd ? Math.sin(t * 22) * 14 : 0;
      clHero.set({ legs: 'sit', mood: t > wd ? 'smug' : 'sly', armL: [70 + scrape, -50], holdL: PROPS.spoon, armR: [40, -30], look: [-1, 0.6], sweat: 1, v: 'dig' });
      const m4 = new THREE.Matrix4(); dust.visible = t > wd;
      for (let i = 0; i < 40; i++) { const ph = ((t * 1.3 + i / 40) % 1); m4.makeTranslation(-CL.w / 2 + 0.25 + ph * 0.5, 0.45 + Math.sin(i * 7) * 0.15 - ph * ph * 0.4, -CL.depth / 2 - 0.2 + Math.cos(i * 3) * 0.25); dust.setMatrixAt(i, m4); }
      dust.instanceMatrix.needsUpdate = true;
      shoot(CL.scene, clPeople, V3(0.9, 1.3, 0.3), V3(0.6, 1.05, -0.6), V3(-CL.w / 2 + 0.6, 0.75, -CL.depth / 2 - 0.15), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh', { gain: 0.6 }); for (let x = wd; x < Wd('vents', 2); x += 0.28) cue(x, 'tock', { gain: 0.5 }); cue(Wd('vents', 2), 'thud', { gain: 0.6 }); }

  // ── 3 · "with spoons stolen from the canteen." (canteen: hero slides a spoon up his sleeve, the boss laughs) ──
  { const st = cut(3), ws = Wd('stolen', 3);
    add({ id: 'S04', at: st, note: 'canteen: hero at the table pockets a spoon behind the guard\'s back; boss laughs', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); const hid = t > ws + 0.2;
      ctHero.at(-0.85, 0, -2.6); ctHero.set({ legs: 'sit', mood: hid ? 'smug' : 'sly', armR: hid ? [10, 0] : [70, -60], holdR: hid ? null : PROPS.spoon, look: [1, 0], v: hid ? 'h' : 's' });
      ctBoss.at(0.85, 0, -2.6); ctBoss.set({ legs: 'sit', mood: 'laugh', talk: talk(t), armL: [120, 30] });
      ctOld.at(0, 0, -4.0); ctOld.set({ legs: 'sit', mood: 'sly', blink: blink(t) });
      ctGuard.at(2.6, 0, -5.5); ctGuard.set({ mood: 'neutral', look: [1, 0], armL: [20, -100], holdL: PROPS.cup });
      shoot(CT.scene, [ctHero, ctBoss, ctOld, ctGuard], V3(-0.4, 1.75, 1.6), V3(0.1, 1.6, 0.7), V3(0, 1.0, -3), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh', { gain: 0.6 }); cue(ws + 0.2, 'zip', { gain: 0.6 }); }

  // ── 4 · "Every night, the guards counted fake heads" (guard with flashlight checks the bunk, nods, counts) ──
  { const st = cut(4), wc = Wd('counted', 4);
    add({ id: 'S05', at: st, note: 'night: guard at the bars shines a flashlight on the sleeping head, counts with a smile', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); nightCell(true); vent.visible = true; ventHole.visible = false; dust.visible = false;
      dummy.set({ mood: 'happy', v: 'sleep' });
      clGuard.group.visible = true; clGuard.at(-0.2, 0, -CL.depth - 0.5); clGuard.set({ mood: t > wc ? 'happy' : 'neutral', armR: [70, -20], holdR: PROPS.flashlight, look: [1, 0.4], talk: t > wc ? talk(t) * 0.5 : 0, v: 'g' });
      shoot(CL.scene, clPeople, V3(-0.9, 1.5, -0.6), V3(-0.6, 1.45, -1.3), V3(0.1, 1.2, -CL.depth), null, k, LOOKS.night);
      blit();
      [0, 1, 2].forEach((i) => { const p = clamp((t - wc - i * 0.35) / 0.2); if (p > 0) { ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#1F1C33'; ctx.lineWidth = 10; ctx.font = '900 110px Inter'; ctx.textAlign = 'center'; const x = 300 + i * 240, y = 560 - eob(p) * 40; ctx.strokeText(String(i + 1), x, y); ctx.fillText(String(i + 1), x, y); ctx.restore(); } });
    } });
    cue(st, 'whoosh', { gain: 0.5 }); [0, 1, 2].forEach((i) => cue(wc + i * 0.35, 'pop', { gain: 0.6 })); }

  // ── 5 · "made of soap, paper and real hair." (close on the dummy head, ingredient chips pop in) ──
  { const st = cut(5), words = [['soap', 'SOAP', '#7FD3FF'], ['paper', 'PAPER', '#FFFFFF'], ['hair', 'REAL HAIR', '#FFC21A']];
    add({ id: 'S06', at: st, note: 'close on the dummy head on the pillow; SOAP / PAPER / REAL HAIR chips pop on their words', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); nightCell(false); dust.visible = false;
      dummy.set({ mood: 'happy', v: 'sleep' });
      shoot(CL.scene, clPeople, V3(0.4, 1.05, -1.5), V3(0.7, 0.95, -1.95), V3(CL.w / 2 - 0.5, 0.95, -CL.depth / 2 - 0.75), null, k, { ...LOOKS.room, aperture: 0.002 });
      blit();
      words.forEach(([w, label, col], i) => { const p = clamp((t - Wd(w, 5)) / 0.2); if (p <= 0) return; ctx.save(); ctx.translate(330 + (i % 2) * 420, 420 + i * 190); ctx.scale(eob(p), eob(p)); ctx.rotate((i - 1) * 0.06);
        ctx.font = '900 92px Inter'; const tw = ctx.measureText(label).width + 70; ctx.fillStyle = col; ctx.strokeStyle = '#1F1C33'; ctx.lineWidth = 8; ctx.beginPath(); ctx.roundRect(-tw / 2, -70, tw, 140, 70); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1F1C33'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 4); ctx.restore(); });
    } });
    cue(st, 'whoosh', { gain: 0.5 }); words.forEach(([w]) => cue(Wd(w, 5), 'plop', { gain: 0.7 })); }

  // ── 6 · "Then they glued fifty raincoats into a raft," (the raft on the dark shore, the crew proud) ──
  { const st = cut(6), wr = Wd('raft', 6);
    add({ id: 'S07', at: st, note: 'the yellow raincoat raft puffs up on "raft"; the three proud on it, island lights behind', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); dawn.visible = false; moonDisc.visible = true; beam.visible = true; water.material.color.set('#1E4FB8'); raft.visible = true; paddle.visible = false; const inf = 0.35 + 0.65 * eob(clamp((t - wr + 0.1) / 0.35));
      raft.position.set(0, -0.05 + Math.sin(t * 2) * 0.04, -3); raft.rotation.set(Math.sin(t * 1.3) * 0.03, 0.2, Math.sin(t * 1.7) * 0.03); raft.scale.set(1, inf, 1);
      rafters.forEach((p, i) => p.set({ mood: t > wr ? (i === 0 ? 'proud' : 'happy') : 'sly', armL: i === 1 ? [140, 20] : [20, 10], legs: 'sit', blink: blink(t, i) }));
      paddle.visible = false;
      shoot(BAY, rafters, V3(-0.6, 1.5, 2.8), V3(0.1, 1.3, 1.4), V3(0, 0.9, -3), V3(0, 1.0, -3), k, LOOKS.night);
      blit();
      const c = clamp((t - Wd('raincoats', 6)) / 0.25); if (c > 0) { ctx.save(); ctx.globalAlpha = c; ctx.font = '900 120px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFC21A'; ctx.strokeStyle = '#1F1C33'; ctx.lineWidth = 14; ctx.translate(540, 520); ctx.scale(eob(c), eob(c)); ctx.strokeText('×50 COATS', 0, 0); ctx.fillText('×50 COATS', 0, 0); ctx.restore(); }
    } });
    cue(st, 'whoosh', { gain: 0.6 }); cue(Wd('raincoats', 6), 'pop', { gain: 0.7 }); cue(wr - 0.1, 'boing', { gain: 0.7 }); }

  // ── 7 · "and paddled into the dark." (camera pulls up and away as the raft paddles off, the lighthouse beam sweeps) ──
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'crane up and back: the raft paddles away into the dark bay, the searchlight beam sweeps past', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); dawn.visible = false; moonDisc.visible = true; beam.visible = true; water.material.color.set('#1E4FB8'); raft.visible = true; paddle.visible = false; 
      raft.scale.set(1, 1, 1); raft.position.set(-lt * 0.8, -0.05 + Math.sin(t * 2) * 0.04, -3 - lt * 1.2); raft.rotation.set(0, 0.6, Math.sin(t * 1.7) * 0.04);
      rafters.forEach((p, i) => p.set({ legs: 'sit', mood: 'worried', armR: [60 + Math.sin(t * 6 + i) * 40, -30], look: [-1, 0] }));
      beam.rotation.z = Math.sin(t * 0.8) * 0.6 + 1.2;
      shoot(BAY, rafters, V3(1.2, 1.6, 2.0), V3(2.5, 4.5, 5.5), V3(-0.5, 0.6, -3.5), V3(-1.5, 0.5, -5), k, LOOKS.night);
      blit();
    } });
    cue(st, 'whoosh', { gain: 0.6 }); for (let x = st + 0.3; x < cut(8); x += 0.6) cue(x, 'plop', { gain: 0.25 }); }

  // ── 8 · "The guards found the heads the next morning." (morning: guard yanks the blanket, shock) ──
  { const st = cut(8), wf = Wd('found', 8);
    add({ id: 'S09', at: st, note: 'morning sun: the guard yanks the blanket off, only a head on the pillow, he gasps; punch-in on "heads"', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); nightCell(false); dust.visible = false; vent.visible = true; ventHole.visible = false;
      const pulled = t > wf; blanket.visible = !pulled;   // with no blanket, just the head on the pillow
      dummy.set({ mood: 'happy', v: 'sleep' });
      clGuard.group.visible = true; clGuard.at(0.35, 0, -CL.depth / 2 - 0.1); clGuard.set({ mood: pulled ? 'shock' : 'angry', armL: pulled ? [150, 20] : [60, -40], armR: pulled ? [150, 20] : [60, -40], look: [1, 0.3], sweat: pulled ? 1 : 0 });
      const punch = clamp((t - Wd('heads', 8)) / 0.2);
      shoot(CL.scene, clPeople, V3(-1.2, 1.6, 0.6), V3(-0.8, 1.5, -0.2), V3(0.9, 1.0, -CL.depth / 2 - 0.6), null, k, { ...LOOKS.room, fov: 38 - punch * 10 });
      blit();
    } });
    cue(st, 'whoosh', { gain: 0.6 }); cue(wf, 'zip', { gain: 0.6 }); cue(Wd('heads', 8), 'slam', { gain: 0.7 }); }

  // ── 9 · "The men were never seen again." (sunrise over the empty bay, one paddle floating) ──
  { const st = cut(9), wn = Wd('never', 9);
    add({ id: 'S10', at: st, note: 'empty bay at dawn, a lone paddle bobbing; slow push; "CASE: UNSOLVED" stamp on "never"', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); raft.visible = false; paddle.visible = true; paddle.position.set(0, 0.03 + Math.sin(t * 2) * 0.03, -3); paddle.rotation.y = 0.6 + Math.sin(t) * 0.1;
      dawn.visible = true; moonDisc.visible = false; beam.visible = false; water.material.color.set('#3A6FD8');
      shoot(BAY, [], V3(0.6, 0.9, 1.6), V3(0.3, 0.7, 0.2), V3(1, 0.6, -12), V3(0.5, 0.4, -10), k, { ...LOOKS.night, exposure: 1.15, fov: 44 });
      blit();
      const sp = clamp((t - wn - 0.1) / 0.18); if (sp > 0) { ctx.save(); ctx.translate(540, 620); ctx.rotate(-0.14); const s = lerp(2.4, 1.15, eo(sp)); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, sp * 1.5);
        ctx.strokeStyle = '#FF3B4E'; ctx.lineWidth = 14; ctx.beginPath(); ctx.roundRect(-320, -100, 640, 200, 22); ctx.stroke(); ctx.fillStyle = '#FF3B4E'; ctx.font = '900 84px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NEVER', 0, -40); ctx.fillText('FOUND', 0, 48); ctx.restore(); }
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(wn + 0.1, 'stamp', { gain: 1 }); cue(wn + 0.12, 'slam', { gain: 0.6 }); }

  return { shots: S, cues: CUES };
}
