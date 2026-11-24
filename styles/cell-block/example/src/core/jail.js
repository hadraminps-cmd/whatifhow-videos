// Cell Block sets: bright, saturated cartoon 3D rooms for prison / heist / con stories.
//   cell(E, opts)     -> { scene, sun, bunk, door, P }   a block-wall prison cell: bunk bed, barred door, shelf, window light
//   canteen(E, opts)  -> { scene, sun, tables, P }       the prison canteen: round tables + stools, two tiers of cells, TV
//   vault(E, opts)    -> { scene, sun, door, hole, cart, P }  a bank vault: round gold door, deposit-box wall, cash cart, tunnel hole
//   yard(E, opts)     -> { scene, sun, P }               outdoor yard: fence + razor wire, guard tower, basketball hoop
// P = handy named positions ({ x, y, z } arrays) for placing people. People stand at y 0.
// Everything is drawn in code (canvas textures); colours are pushed brighter than Tall Tale.
import * as THREE from 'three';
import { canvasTex, mat, T, sky, sunlight, clouds, hills } from './world.js';

const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const shade = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
const box = (w, h, d, m, x = 0, y = 0, z = 0, parent) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; if (parent) parent.add(b); return b; };
const cyl = (r1, r2, h, m, x, y, z, parent, seg = 16) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); c.position.set(x, y, z); c.castShadow = c.receiveShadow = true; if (parent) parent.add(c); return c; };
const metal = (color = '#5B6478') => mat({ color, metalness: 0.55, roughness: 0.35 });

// ---------- painted textures ----------
export const TJ = {
  /** two-tone painted cinder blocks (lower band colour + upper colour) */
  blocks: (low = '#3D63C9', up = '#EEF2FA', band = 0.38, rep = [1, 1]) => canvasTex('blk' + low + up + band, 512, 512, (g, w, h) => {
    const bh = 42, bw = 128, split = h * (1 - band);
    for (let r = 0; r < h / bh; r++) for (let c = -1; c < w / bw + 1; c++) {
      const x = c * bw + (r % 2) * bw / 2, y = r * bh, col = y + bh / 2 > split ? low : up;
      g.fillStyle = shade(col, 0.72); g.fillRect(x, y, bw, bh); g.fillStyle = shade(col, 0.94 + rnd(r * 17 + c) * 0.1); g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
    }
    g.fillStyle = shade(low, 0.8); g.fillRect(0, split - 6, w, 12);
  }, rep),
  /** glossy epoxy floor */
  floor: (col = '#6B4FB0', rep = [1, 1]) => canvasTex('fl' + col, 512, 512, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) { g.fillStyle = shade(col, 0.8 + rnd(i) * 0.4); g.globalAlpha = 0.35; g.fillRect(rnd(i * 2.1) * w, rnd(i * 3.3) * h, 3, 3); }
    g.globalAlpha = 0.12; g.fillStyle = '#FFFFFF'; for (let i = 0; i < 6; i++) g.fillRect(rnd(i * 9) * w, 0, 30 + rnd(i) * 40, h); g.globalAlpha = 1;
  }, rep),
  /** marble tiles in a fan pattern (vault / bank) */
  marble: (a = '#F1E6CF', b = '#C9B48A', rep = [1, 1]) => canvasTex('mb' + a + b, 512, 512, (g, w, h) => {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g.fillStyle = (r + c) % 2 ? a : b; g.fillRect(c * 128, r * 128, 128, 128); }
    g.strokeStyle = 'rgba(120,100,80,0.35)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { g.beginPath(); const x = rnd(i) * w, y = rnd(i * 3) * h; g.moveTo(x, y); g.bezierCurveTo(x + 40, y + 20, x + 60, y - 30, x + 110, y + 10); g.stroke(); }
    g.strokeStyle = 'rgba(80,60,40,0.5)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke(); }
  }, rep),
  /** a wall of safe-deposit boxes */
  deposit: (col = '#D9A93A', rep = [1, 1]) => canvasTex('dep' + col, 512, 512, (g, w, h) => {
    g.fillStyle = shade(col, 0.55); g.fillRect(0, 0, w, h);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { const x = c * 128 + 6, y = r * 64 + 5; const gr = g.createLinearGradient(0, y, 0, y + 54); gr.addColorStop(0, shade(col, 1.15)); gr.addColorStop(1, shade(col, 0.85)); g.fillStyle = gr; g.fillRect(x, y, 116, 54);
      g.fillStyle = shade(col, 0.5); g.beginPath(); g.arc(x + 58, y + 27, 6, 0, 7); g.fill(); g.fillRect(x + 14, y + 22, 22, 10); }
  }, rep),
  chainlink: () => canvasTex('chain', 128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#C9D2DE'; g.lineWidth = 4; for (let i = -2; i < 4; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 + 128, 128); g.moveTo(i * 32 + 128, 0); g.lineTo(i * 32, 128); g.stroke(); } }, [1, 1]),
};

/** a row of vertical bars (a cell door / window), w wide, h tall, centred at x, base at y 0 */
export function bars(w = 1.8, h = 2.4, { col = '#3B4A7A', n = 0 } = {}) {
  const g = new THREE.Group(), m = metal(col), k = n || Math.round(w / 0.16);
  for (let i = 0; i <= k; i++) cyl(0.025, 0.025, h, m, -w / 2 + i * w / k, h / 2, 0, g, 8);
  [0.08, h * 0.55, h - 0.06].forEach((y) => box(w + 0.06, 0.07, 0.07, m, 0, y, 0, g));
  return g;
}
function bunkBed({ frame = '#E8ECF4', mattress = '#3BA55C', two = true } = {}) {
  const g = new THREE.Group(), m = metal(frame);
  [[-0.95, -0.42], [0.95, -0.42], [-0.95, 0.42], [0.95, 0.42]].forEach(([x, z]) => cyl(0.035, 0.035, two ? 1.95 : 0.7, m, x, (two ? 1.95 : 0.7) / 2, z, g, 8));
  const deck = (y) => { box(1.95, 0.06, 0.9, m, 0, y, 0, g); const mt = box(1.86, 0.16, 0.82, mat({ color: mattress, roughness: 0.9 }), 0, y + 0.11, 0, g); return mt; };
  deck(0.42); if (two) { deck(1.42); box(1.95, 0.05, 0.05, m, 0, 1.75, 0.42, g); }
  const pil = box(0.42, 0.1, 0.6, mat({ color: '#FFFFFF' }), -0.68, 0.58, 0, g); pil.rotation.z = 0.08;
  return g;
}
function cashStack(n = 6, col = '#7ED957') {
  const g = new THREE.Group(), body = mat({ color: col }), band = mat({ color: '#F2C230' });
  for (let i = 0; i < n; i++) { const x = (i % 3) * 0.2, z = Math.floor(i / 3) * 0.11, y = 0; const b = box(0.18, 0.1, 0.09, body, x, y + 0.05, z, g); box(0.04, 0.102, 0.092, band, x, y + 0.05, z, g); }
  return g;
}
function tv(text = '$$$') {
  const g = new THREE.Group(); box(1.3, 0.8, 0.12, mat({ color: '#1F1C33' }), 0, 0, 0, g);
  const scr = canvasTex('tv' + text, 512, 300, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#B13BE6'); gr.addColorStop(1, '#E83B9E'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#F2C230'; c.beginPath(); c.arc(w / 2, 130, 80, 0, 7); c.fill(); c.fillStyle = '#B8862F'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.fillText(text, w / 2, 152); c.fillStyle = '#FFFFFF'; c.font = '900 34px Inter'; c.fillText('SPIN TO WIN', w / 2, 270); });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.68), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false })); s.position.z = 0.065; g.add(s);
  return g;
}
function hangLamp(scene, x, y, z, col = '#FFE7A8') {
  cyl(0.01, 0.01, 1.2, mat({ color: '#333' }), x, y + 0.6, z, scene, 4);
  const shadeM = mat({ color: '#2F3A5A', metalness: 0.3, roughness: 0.5, side: THREE.DoubleSide });
  const s = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.26, 20, 1, true), shadeM); s.position.set(x, y, z); scene.add(s);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshStandardMaterial({ color: '#FFF6DA', emissive: col, emissiveIntensity: 3 })); b.position.set(x, y - 0.1, z); scene.add(b);
  const pl = new THREE.PointLight(col, 5, 9, 1.5); pl.position.set(x, y - 0.25, z); scene.add(pl);
}
function roomLight(scene, { key = '#FFF1D8', keyI = 2.6, pos = [2, 7, 4], target = [0, 0, -2], box: bx = 7, hemiSky = '#E8F0FF', hemiGround = '#6A4FA0', hemi = 1.35 } = {}) {
  const k = new THREE.DirectionalLight(key, keyI); k.position.set(...pos); k.target.position.set(...target); k.castShadow = true;
  k.shadow.mapSize.set(2048, 2048); Object.assign(k.shadow.camera, { left: -bx, right: bx, top: bx, bottom: -bx, near: 0.5, far: 40 }); k.shadow.bias = -0.0006; k.shadow.radius = 4; k.shadow.camera.updateProjectionMatrix();
  scene.add(k, k.target); scene.add(new THREE.HemisphereLight(hemiSky, hemiGround, hemi));
  return { key: k };
}

/** a prison cell, looking from inside toward the barred door (door at z = -depth). */
export function cell(E, { w = 3.6, depth = 5, h = 3.2, low = '#3D63C9', up = '#EEF2FA', floor = '#6B4FB0', mattress = '#3BA55C', number = 'C-1-24', cash = false } = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1A2340'); scene.environment = E.envMap; scene.environmentIntensity = 0.4;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, depth + 4), mat({ map: TJ.floor(floor, [2, 3]), roughness: 0.35 })); fl.rotation.x = -Math.PI / 2; fl.position.z = -depth / 2 + 1; fl.receiveShadow = true; scene.add(fl);
  const wm = (len) => mat({ map: TJ.blocks(low, up, 0.38, [len / 2.2, 1]) });
  [-1, 1].forEach((s) => box(0.2, h, depth + 3, wm(depth + 3), s * w / 2, h / 2, -depth / 2 + 1.5, scene));          // side walls end at the door, so the corridor stays open
  box(w, 0.2, depth + 3, mat({ color: '#D9DFEA' }), 0, h + 0.1, -depth / 2 + 1.5, scene);
  // back: barred door + corridor beyond
  const door = bars(w - 0.2, h, { col: '#2E3D6E' }); door.position.set(0, 0, -depth); scene.add(door);
  const cor = new THREE.Group(); cor.position.z = -depth - 2.4; scene.add(cor);
  box(w + 6, h + 1, 0.2, mat({ map: TJ.blocks('#2E4E9E', '#DDE5F5', 0.35, [4, 1.2]) }), 0, (h + 1) / 2, 0, cor);
  const cfl = new THREE.Mesh(new THREE.PlaneGeometry(w + 6, 3), mat({ map: TJ.floor('#5A4596', [3, 1.5]), roughness: 0.35 })); cfl.rotation.x = -Math.PI / 2; cfl.position.set(0, 0.001, -depth - 1.2); cfl.receiveShadow = true; scene.add(cfl);
  // bunk on the right wall, shelf + window on the left
  const bunk = bunkBed({ mattress }); bunk.rotation.y = Math.PI / 2; bunk.position.set(w / 2 - 0.55, 0, -depth / 2 - 0.2); scene.add(bunk);
  const plate = canvasTex('plate' + number, 256, 96, (g) => { g.fillStyle = '#2E8A5A'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#E9F5EC'; g.font = '900 48px Inter'; g.textAlign = 'center'; g.fillText(number, 128, 64); });
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.26), mat({ map: plate })); pm.rotation.y = -Math.PI / 2; pm.position.set(w / 2 - 0.11, 0.9, -depth / 2 - 0.2); scene.add(pm);
  const shelf = new THREE.Group(); shelf.position.set(-w / 2 + 0.25, 1.75, -depth / 2 - 0.6); scene.add(shelf);
  box(0.3, 0.04, 1.2, mat({ color: '#E8ECF4' }), 0, 0, 0, shelf);
  ['#E2344A', '#F28C28', '#F2C230', '#3C6FE0'].forEach((c, i) => box(0.18, 0.06, 0.26, mat({ color: c }), 0, 0.05 + i * 0.06, 0.2, shelf));
  cyl(0.08, 0.08, 0.18, mat({ color: '#FFFFFF' }), 0, 0.11, -0.3, shelf);
  const stool = cyl(0.22, 0.22, 0.06, metal('#E8ECF4'), -w / 2 + 0.7, 0.48, -1.6, scene); cyl(0.04, 0.04, 0.46, metal('#9AA4B8'), -w / 2 + 0.7, 0.23, -1.6, scene); cyl(0.18, 0.18, 0.03, metal('#9AA4B8'), -w / 2 + 0.7, 0.015, -1.6, scene);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshBasicMaterial({ color: '#CFEFFF', toneMapped: false })); win.rotation.y = Math.PI / 2; win.position.set(-w / 2 + 0.11, 2.4, -depth / 2 + 0.6); scene.add(win);
  const wb = bars(0.9, 0.6, { col: '#2E3D6E', n: 5 }); wb.rotation.y = Math.PI / 2; wb.position.set(-w / 2 + 0.13, 2.1, -depth / 2 + 0.6); scene.add(wb);
  let stash = null; if (cash) { stash = cashStack(18); stash.scale.set(1.4, 1.4, 1.4); stash.position.set(w / 2 - 1.0, 0.55, -depth / 2 - 0.75); scene.add(stash); }
  const sun = roomLight(scene, { key: '#FFF4E0', keyI: 2.4, pos: [-4, 6, -depth / 2 + 1], target: [0.5, 0, -depth / 2], box: 6 });
  hangLamp(scene, 0, h - 0.4, -depth / 2 + 0.5, '#FFE7B8');
  const corridorLight = new THREE.PointLight('#BFD6FF', 14, 14, 1.2); corridorLight.position.set(0, h - 0.3, -depth - 1.2); scene.add(corridorLight);
  hangLamp(scene, -2.2, h - 0.3, -depth - 1.2, '#FFE2A8');
  return { scene, sun, bunk, door, stash, w, depth, h, P: { center: [0, 0, -depth / 2 + 0.6], door: [0, 0, -depth + 0.6], bunkFront: [w / 2 - 1.3, 0, -depth / 2 - 0.2], stool: [-w / 2 + 0.7, 0, -1.6] } };
}

/** the prison canteen: round tables with stools, two tiers of cells behind, a TV on the wall */
export function canteen(E, { tables = [[0, -3], [-3.2, -5.5], [3.2, -5.5], [0, -8]], tvText = '$$$', floor = '#8A6BD0' } = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#16203A'); scene.environment = E.envMap; scene.environmentIntensity = 0.45;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), mat({ map: TJ.floor(floor, [8, 8]), roughness: 0.3 })); fl.rotation.x = -Math.PI / 2; fl.position.z = -6; fl.receiveShadow = true; scene.add(fl);
  // painted yellow walkway line
  box(14, 0.005, 0.12, mat({ color: '#F2C230' }), 0, 0.003, -1.0, scene);
  // two tiers of cells on the back wall (z -12)
  const back = new THREE.Group(); back.position.z = -12; scene.add(back);
  box(30, 8, 0.3, mat({ map: TJ.blocks('#2E4E9E', '#C9D4EC', 0.3, [10, 2.6]) }), 0, 4, -0.5, back);
  for (let tier = 0; tier < 2; tier++) for (let i = -5; i <= 5; i++) { const b = bars(1.8, 2.6, { col: '#25335E' }); b.position.set(i * 2.2, tier * 3.1, 0); back.add(b); box(0.3, 2.7, 0.3, mat({ color: '#3A4A7E' }), i * 2.2 + 1.1, tier * 3.1 + 1.35, 0, back); }
  box(26, 0.15, 1.2, mat({ color: '#3A4A7E' }), 0, 2.95, 0.5, back);                         // walkway
  for (let i = -12; i <= 12; i += 0.4) cyl(0.015, 0.015, 0.9, metal('#9AA4B8'), i, 3.45, 1.08, back, 6);
  box(26, 0.05, 0.05, metal('#C9D2DE'), 0, 3.9, 1.08, back);
  // TV on a side wall
  const t = tv(tvText); t.position.set(2.2, 4.4, -11.3); scene.add(t);
  // tables: round top + pedestal + 4 swing-out stools on arms
  const tableList = tables.map(([x, z]) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const top = cyl(0.85, 0.85, 0.07, mat({ color: '#2A2F45', roughness: 0.4 }), 0, 0.78, 0, g, 32);
    cyl(0.09, 0.12, 0.76, metal('#2A2F45'), 0, 0.38, 0, g);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; const sx = Math.cos(a) * 1.15, sz = Math.sin(a) * 1.15;
      const arm = box(1.15, 0.05, 0.08, metal('#2A2F45'), sx / 2, 0.12, sz / 2, g); arm.rotation.y = -a;
      cyl(0.24, 0.24, 0.06, mat({ color: '#2A2F45', roughness: 0.4 }), sx, 0.5, sz, g, 20); cyl(0.04, 0.04, 0.44, metal('#2A2F45'), sx, 0.27, sz, g, 8); }
    return g;
  });
  // stacks of chips/snacks on the first table (prison poker)
  ['#E2344A', '#F2C230', '#3C6FE0'].forEach((c, i) => { for (let j = 0; j < 5; j++) box(0.22, 0.03, 0.14, mat({ color: j % 2 ? c : '#FFFFFF' }), -0.35 + i * 0.35, 0.83 + j * 0.032, 0.1, tableList[0]); });
  [-6, -2, 2, 6].forEach((x) => hangLamp(scene, x, 5.2, -6, '#FFE2A0'));
  const sun = roomLight(scene, { key: '#FFF2DC', keyI: 2.3, pos: [3, 9, 5], target: [0, 0, -4], box: 9, hemi: 1.4 });
  return { scene, sun, tables: tableList, P: { seat: (ti, k) => { const [x, z] = tables[ti]; const a = k * Math.PI / 2 + Math.PI / 4; return [x + Math.cos(a) * 1.15, 0, z + Math.sin(a) * 1.15]; } } };
}

/** a bank vault: the big round door on the back wall, deposit boxes on the right, a cash cart, and (hole: true) a tunnel hole in the floor */
export function vault(E, { hole = true, open = 0, opensText = 'OPENS 9:00 AM MON' } = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#121A33'); scene.environment = E.envMap; scene.environmentIntensity = 0.6;
  // marble floor (with a round hole cut out where the tunnel comes up)
  const HX = -0.9, HZ = -2.2, shp = new THREE.Shape(); shp.moveTo(-8, -4); shp.lineTo(8, -4); shp.lineTo(8, 8); shp.lineTo(-8, 8); shp.closePath();
  if (hole) { const hp = new THREE.Path(); hp.absarc(HX, -HZ, 0.62, 0, Math.PI * 2, true); shp.holes.push(hp); }
  const fl = new THREE.Mesh(new THREE.ShapeGeometry(shp, 48), mat({ map: TJ.marble('#F1E6CF', '#C9B48A', [0.25, 0.25]), roughness: 0.3 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const wallM = mat({ color: '#8C93A8', metalness: 0.4, roughness: 0.5 });
  box(12, 6, 0.3, wallM, 0, 3, -7, scene);
  [-1, 1].forEach((s) => box(0.3, 6, 12, s > 0 ? mat({ map: TJ.deposit('#D9A93A', [3, 3]), metalness: 0.5, roughness: 0.35 }) : wallM, s * 4.5, 3, -2, scene));
  // the door: steel ring, gold face, spoked wheel, dials, hinge bolts
  const door = new THREE.Group(); door.position.set(0, 2.3, -6.8); scene.add(door);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.28, 16, 48), metal('#AEB6C8')); door.add(ring);
  const face = cyl(1.85, 1.85, 0.3, mat({ color: '#D9A52E', metalness: 0.6, roughness: 0.4 }), 0, 0, 0.1, door, 48); face.rotation.x = Math.PI / 2;
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; const sp = box(0.03, 1.1, 0.02, mat({ color: '#B8862F', metalness: 0.6 }), Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0.26, door); sp.rotation.z = a - Math.PI / 2; }
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const b = cyl(0.08, 0.08, 0.12, metal('#6A7286'), Math.cos(a) * 2.05, Math.sin(a) * 2.05, 0.2, door, 10); b.rotation.x = Math.PI / 2; }
  const wheel = new THREE.Group(); wheel.position.z = 0.36; door.add(wheel);
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 10, 40), metal('#D7DCE4')));
  for (let i = 0; i < 6; i++) { const sp = box(0.05, 1.44, 0.05, metal('#D7DCE4'), 0, 0, 0, wheel); sp.rotation.z = i * Math.PI / 6 * 2 / 2 * 2; }
  const hub = cyl(0.14, 0.14, 0.12, mat({ color: '#E2B43A', metalness: 0.8, roughness: 0.25 }), 0, 0, 0.04, wheel, 20); hub.rotation.x = Math.PI / 2;
  const dialT = canvasTex('dial', 128, 128, (g) => { g.fillStyle = '#F5F1E6'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.strokeStyle = '#1F1C33'; g.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; g.beginPath(); g.moveTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50); g.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58); g.stroke(); } g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(96, 40); g.stroke(); });
  for (let i = 0; i < 4; i++) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), mat({ map: dialT })); d.position.set(-0.57 + i * 0.38, 1.3, 0.27); door.add(d); }
  const lbl = canvasTex('opens' + opensText, 512, 64, (g) => { g.fillStyle = '#F5F1E6'; g.fillRect(0, 0, 512, 64); g.fillStyle = '#B5372E'; g.font = '900 36px Inter'; g.textAlign = 'center'; g.fillText(opensText, 256, 46); });
  const lm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.11), mat({ map: lbl })); lm.position.set(0, 1.0, 0.27); door.add(lm);
  door.rotation.y = open * -1.4;
  // cash cart (metal frame, green shelves, stacks of cash)
  const cart = new THREE.Group(); cart.position.set(2.4, 0, -4.2); cart.rotation.y = -0.4; scene.add(cart);
  [[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]].forEach(([x, z]) => { cyl(0.025, 0.025, 1.0, metal('#C9D2DE'), x, 0.55, z, cart, 8); const wh = cyl(0.07, 0.07, 0.05, mat({ color: '#1F1C33' }), x, 0.07, z, cart, 12); wh.rotation.z = Math.PI / 2; });
  [0.3, 0.95].forEach((y) => box(1.3, 0.04, 0.8, mat({ color: '#2E9E5A' }), 0, y, 0, cart));
  const cs = cashStack(9); cs.position.set(-0.3, 0.97, -0.15); cs.scale.set(1.5, 1.5, 1.5); cart.add(cs);
  const cs2 = cashStack(6); cs2.position.set(-0.3, 0.32, -0.15); cs2.scale.set(1.5, 1.5, 1.5); cart.add(cs2);
  const bag = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), mat({ color: '#D9B98A' })); bag.scale.set(1, 1.15, 1); bag.position.set(-1.4, 0.32, -5); bag.castShadow = true; scene.add(bag);
  // the tunnel hole: dark pit + rim of lifted tiles + dirt crumbs
  let holeG = null;
  if (hole) {
    holeG = new THREE.Group(); holeG.position.set(HX, 0, HZ); scene.add(holeG);
    const pit = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 1.2, 32, 1, true), mat({ color: '#5A3A22', side: THREE.BackSide })); pit.position.y = -0.6; holeG.add(pit);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ color: '#120A06' })); bottom.rotation.x = -Math.PI / 2; bottom.position.y = -1.0; holeG.add(bottom);
    const rim = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.95, 32), mat({ color: '#9C6A3A' })); rim.rotation.x = -Math.PI / 2; rim.position.y = 0.006; holeG.add(rim);
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28 + rnd(i); const tl = box(0.36, 0.05, 0.3, mat({ map: TJ.marble('#F1E6CF', '#C9B48A', [0.3, 0.3]) }), Math.cos(a) * (0.9 + rnd(i * 3) * 0.3), 0.06, Math.sin(a) * (0.9 + rnd(i * 3) * 0.3), holeG); tl.rotation.set((rnd(i) - 0.5) * 0.6, a, (rnd(i * 5) - 0.5) * 0.5); }
    for (let i = 0; i < 26; i++) { const a = rnd(i * 7) * 6.28, r = 0.9 + rnd(i * 11) * 0.9; const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04 + rnd(i) * 0.04, 0), mat({ color: '#6A4426' })); c.position.set(Math.cos(a) * r, 0.03, Math.sin(a) * r); holeG.add(c); }
  }
  const sun = roomLight(scene, { key: '#FFF0D0', keyI: 2.2, pos: [3, 8, 4], target: [0, 0, -3], box: 7, hemiSky: '#FFF2D8', hemiGround: '#5A4A7A', hemi: 1.2 });
  hangLamp(scene, 0, 5.0, -3.5, '#FFE2A0');
  const glow = new THREE.PointLight('#FFD27A', 2.5, 6, 1.6); glow.position.set(0, 2.4, -5.2); scene.add(glow);
  return { scene, sun, door, wheel, hole: holeG, cart, w: 9, P: { hole: [-0.9, 0, -2.2], cart: [2.0, 0, -3.6], door: [0, 0, -5.2], center: [0, 0, -2.5] } };
}

/** the prison yard by day: chain-link fence with razor wire, guard tower, basketball hoop, painted lines */
export function yard(E, { sunset = false } = {}) {
  const scene = new THREE.Scene();
  sky(scene, sunset ? { top: '#5B4FA8', horizon: '#FF9E6E' } : { top: '#2F86F0', horizon: '#BEE8FF' });
  const sun = sunlight(scene, E, sunset ? { col: '#FFB27A', i: 2.5, pos: [-12, 5, -14], box: 14, sky: '#C9A6E0', ground: '#6A4A3A' } : { pos: [8, 12, 6], box: 14, i: 2.9 });
  clouds(scene, [[-30, 24, -90, 14], [25, 30, -100, 18], [60, 20, -80, 11]], sunset ? '#FFB8A0' : '#FFFFFF');
  hills(scene, { z: -80 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), mat({ map: TJ.floor('#9AA3B5', [16, 16]), roughness: 0.8 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const court = new THREE.Mesh(new THREE.PlaneGeometry(10, 14), mat({ color: '#E8734A', roughness: 0.8 })); court.rotation.x = -Math.PI / 2; court.position.set(0, 0.004, -6); court.receiveShadow = true; scene.add(court);
  const lineM = mat({ color: '#FFFFFF' }); box(10, 0.006, 0.08, lineM, 0, 0.006, -6, scene); const circ = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.5, 40), lineM); circ.rotation.x = -Math.PI / 2; circ.position.set(0, 0.007, -6); scene.add(circ);
  // fence
  const fenceM = new THREE.MeshStandardMaterial({ map: TJ.chainlink(), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.4, roughness: 0.4 }); fenceM.map.repeat.set(30, 4);
  const fz = -14, fence = new THREE.Mesh(new THREE.PlaneGeometry(40, 4.5), fenceM); fence.position.set(0, 2.25, fz); scene.add(fence);
  for (let x = -20; x <= 20; x += 3) cyl(0.06, 0.06, 5, metal('#9AA4B8'), x, 2.5, fz, scene, 8);
  for (let i = 0; i < 40; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.015, 6, 16), metal('#D7DCE4')); r.position.set(-20 + i, 4.85, fz); r.rotation.y = 0.5; scene.add(r); }
  // guard tower
  const tw = new THREE.Group(); tw.position.set(8, 0, fz - 2); scene.add(tw);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(0.18, 7, 0.18, mat({ color: '#6A7286' }), x, 3.5, z, tw));
  box(2.8, 1.4, 2.8, mat({ map: TJ.blocks('#3D63C9', '#EEF2FA', 0.4, [1.5, 0.7]) }), 0, 7.7, 0, tw); box(3.2, 0.2, 3.2, mat({ color: '#E2344A' }), 0, 8.5, 0, tw);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), new THREE.MeshStandardMaterial({ color: '#FFF6DA', emissive: '#FFE7A0', emissiveIntensity: 2 })); lamp.position.set(-1.3, 8.6, 1.3); tw.add(lamp);
  // hoop
  const hp = new THREE.Group(); hp.position.set(-3, 0, -11.5); scene.add(hp);
  cyl(0.08, 0.08, 3.2, metal('#3A4A7E'), 0, 1.6, 0, hp); box(1.6, 1.0, 0.06, mat({ color: '#FFFFFF' }), 0, 3.3, 0.3, hp);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 8, 24), mat({ color: '#F28C28' })); rim.rotation.x = Math.PI / 2; rim.position.set(0, 3.0, 0.6); hp.add(rim);
  return { scene, sun, P: { center: [0, 0, -5], fence: [0, 0, fz + 1.5] } };
}
