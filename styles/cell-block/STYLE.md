# Cell Block 3D: true prison breaks, heists and cons, 9:16

Loud, vivid and cheeky. Flat 2D cartoon people (thick ink outlines, big round white heads, bean bodies, stick limbs)
acting inside glossy, saturated 3D rooms: prison cells, the canteen, the yard, a bank vault, the bay at night. The
camera moves in every shot, faces react on every beat, captions come one word at a time.
Built on Tall Tale 3D's engine with a brighter grade, new character parts and new sets.
Example: `example/` = **THE MEN WHO LEFT THEIR HEADS IN BED** (Alcatraz, 1962; ~30 s, 10 shots). Sheet: `style-sheet.png`.

## 1. Rules
- **People are 2D, the world is 3D.** Every person is a `Toon` cut-out that turns to face the camera and casts a real
  shadow. Never build people in 3D; never draw sets flat.
- **Original cast only.** Use `src/cast.js` (hero, boss, oldtimer, guard, rookie, robber, warden, banker, cop) or mix new
  ones from the parts. Never recreate another channel's characters (same hair + glasses + chain + outfit combo), their
  sets or their shots. Real people in a story are played by cast members, not drawn as look-alikes.
- **Vivid colour.** Grade `sat` 1.32 by default (engine), exposure 1.08. Saturated walls (royal blue, red, purple floors),
  orange jumpsuits, green mattresses, gold vault. No grey or brown scenes; night scenes are deep blue, never black.
- **Faces do the acting.** Change the mood on the beat: `sly` while scheming, `smug` when it works, `shock` + `sweat` when
  caught, `laugh` for the payoff. Blink with `blink(t)`, talk with `talk(t)`.
- One hair OR hat + one signature thing (shades, chain, mask, beard...) per character; same look all video.
- Camera always moving: push-ins, dollies along corridors, crane-ups, a punch-in (fov drop) on the reveal word.
  New shot every 1.5-3 s.
- Captions: one word at a time (short words pair up), white Inter Black, black edge, centre screen (y 1340).
  Big 2D pop-ups for numbers and reveals ("×50 COATS", "?!", ingredient chips, a red stamp at the end). No emoji in
  canvas text (headless Chrome may have no emoji font).
- Story shape: open on the craziest moment ("they left their own heads in bed"), then "See, ..." rewind and show the
  plan step by step, one picture per clause, short reaction beats, end on a punchline or twist that flips the start.
- Narration: upbeat storyteller, `am_michael` x1.05. Music `"bounce"` (caper) or `"tension"` for a darker one. Sounds:
  `whoosh` on cuts, `tock` for digging/scraping, `pop`/`plop` for pop-ups, `zip` for sneaky moves, `slam`/`stamp` on reveals.
- True stories only, checked against good sources (FBI, museums, encyclopaedias, major outlets) and listed in
  `script.json` "sources". No gore, no violence shown, no real victims; keep it a caper.

## 2. Engine map (`example/src/`)
| file | gives you |
|---|---|
| `core/engine.js` | `makeEngine` (neutral tone curve, soft shadows, bloom, depth of field, saturation grade: vivid by default), `camera(fov)` |
| `core/toon.js` | `drawToon(g, look, st)`, `new Toon(look, { height })` (`.at(x,y,z)`, `.set(st)`, `.face(cam)`, `.tint(col)`, `.restyle(patch)`), `PROPS` held in hands |
| `core/jail.js` | sets: `cell(E, { low, up, floor, mattress, number, cash })`, `canteen(E, { tables, tvText, floor })`, `vault(E, { hole, open, opensText })`, `yard(E, { sunset })`; pieces: `bars(w, h)`; textures `TJ.blocks/floor/marble/deposit/chainlink` |
| `core/world.js` | Tall Tale's outdoor kit, still available: `sky, sunlight, clouds, hills, mainStreet, interior, meadow, snapshot, canvasTex, mat, T.*` |
| `core/props.js` | Tall Tale props (house, desk, poster, parcel, train...) |
| `cast.js` | the recurring cast |
| `core/captions.js` | one-word captions, `captionText(text, x, y)` |

Each set returns `{ scene, sun, P }`; `P` holds named spots to place people (`cell.P.door`, `canteen.P.seat(table, k)`,
`vault.P.hole`, `yard.P.fence`). The cell's door is at z = -depth with an open corridor behind it (camera can go there).
The example also builds a one-off set inside `shots.js` (the bay at night: water, moon, island, searchlight, raincoat raft):
build story-specific sets like that, in the same bright look.

**Toon look** (Tall Tale's, plus the new parts in bold):
`{ body, pattern: plain│check│stripes│overalls│vest│apron│stamps│`**`jumpsuit│uniform│suit`**`, patCol, `**`number`**` (jumpsuit patch),
`**`hair: none│tuft│swoop│spikes│curls│bald│long│bob, hairCol`**`, hat: none│cap│bowler│boater│beanie│visor│tophat│bun│flower│bow│mailcap│`**`guard│ballcap│bandana`**`, hatCol, band,
neck: none│bowtie│tie│scarf│collar, neckCol, extra: [mustache, glasses, freckles, blush, pencil, monocle, `**`shades, mask, beard, stubble, chain, headlamp`**`], kid }`.
**Toon state**: `{ mood: neutral│smug│happy│laugh│shock│worried│angry│sad│sly│proud│tired│dizzy, look: [dx, dy], blink, talk,
sweat, tears, armL / armR: [shoulder°, elbow°] (0 = down, 150 = up), legs: stand│walk│run│sit│jump, phase, lean, bob,
holdL / holdR: PROPS.x, flip }`. A prop with arguments (`PROPS.paper('ESCAPE?')`) needs a `v: 'something'` in the state
that changes when the prop changes, so the cut-out redraws.
**New props**: `moneybag, spoon, keys, cards, goldbar, flashlight` (plus Tall Tale's `stack, cash(n), bill, paper(text), cup, key, sign(text)...`).

## 3. Shot anatomy (see `example/src/shots.js`)
Build every set once at the top, give each set its own cut-outs, then per shot: show/hide people and props, `set()`
their state from `t`, `shoot(scene, people, camFrom, camTo, lookFrom, lookTo, k, LOOK)` (moves the camera, turns everyone
to face it, renders with depth of field), `blit()`, then any 2D overlay. Cues go on the word (`cue(Wd('heads', 8), 'slam')`).
**Every shot must be a pure function of `t`**: if a later shot changes a shared object (hides the raft, turns on the dawn
sky, pulls the blanket), every earlier shot that uses it sets it back. Frames are rendered out of order during QA.
Useful tricks from the example: a person "in bed" = a normal cut-out sunk into the bunk (`y ≈ -0.66`) with a blanket box
in front; night = `nightCell(true)` (lower key light, darker background); a punch-in = `fov: 38 - punch * 10`.

## 4. QA pitfalls
- A cut-out seen from the side becomes a sliver: keep the camera within ~60° of facing people (`.face(cam)` handles the rest).
- Bunk posts, bars and table edges right in front of the lens block the shot: check the first frame of every shot.
- People walking along the camera's line of sight stack on top of each other: offset them in depth too.
- Labels and pop-ups stay out of the caption zone (y 1250-1550).
- The vault door is big and shiny: keep `bloom` low (0.12) and the camera back, or it blows out.
- Rendering speed: without a GPU use `SOFTWARE_GL=1 QS='&res=0.6&aa=0&shadow=1024' FPS=24` (≈2 s per frame).
- Style sheet: `node tools/capture.mjs stylesheet ../style-sheet.png` (renders `sheet.html`).
