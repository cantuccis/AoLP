**Milestone 1: world setup** in Three.js (medieval towns + roads + peasants walking). Each item has a brief description and a clear deliverable.

# 0) Project scaffolding

* **Task:** Create a Vite + TypeScript Three.js project; add basic lint/format.
* **Deliverable:** `npm run dev` shows a blank scene with stats overlay.

# 1) Engine skeleton (logic/render separation)

* **Task:** Implement a **fixed-timestep game loop** (`update()` @ 60Hz) and a decoupled `render()`.
* **Deliverable:** Two loops in place; console logs confirm fixed updates even if FPS varies.

# 2) Scene & camera baseline

* **Task:** Add `Scene`, `WebGLRenderer`, and a **RTS-style camera** (pan/zoom/tilt, clamped to map bounds).
* **Deliverable:** You can move around an empty plane smoothly.

# 3) World data model

* **Task:** Define JSON schemas for **towns**, **roads**, and **spawn points** (positions/rotations/scales).
* **Deliverable:** `world.json` (or `world/*.json`) loaded at runtime to place content.

# 4) Asset pipeline (GLTF-first)

* **Task:** Pick CC0 low-poly packs (buildings, peasants). Convert anything non-GLTF to **GLB**. Normalize units/origin, bake transforms, and assign PBR materials.
* **Deliverable:** `/assets/models/{buildings,peasants,props}.glb` load correctly with `GLTFLoader`.

# 5) Lighting & environment

* **Task:** Directional “sun” + ambient; optional HDRI sky; simple shadow settings (filtered, medium map size).
* **Deliverable:** Buildings cast/receive soft shadows; outdoor look reads “midday”.

# 6) Terrain & ground materials

* **Task:** Start with a single large plane + **grass/dirt PBR**; later swap to a splat/blend material.
* **Deliverable:** Ground with visible texture tiling control (UV scaling), correct gamma/encoding.

# 7) Town placement system

* **Task:** A loader that instantiates **town prefabs** (clusters of houses, a well, market, etc.) from JSON; random small variation (rotation/scale seeds).
* **Deliverable:** 2–3 distinct towns placed via data, not hardcoded.

# 8) Road system (spline)

* **Task:** Implement **Catmull-Rom/B-spline** roads between towns; sample a ribbon mesh along spline; add “packed dirt” material; optional decals.
* **Deliverable:** Roads curve naturally between towns; no z-fighting; width adjustable.

# 9) World props pass

* **Task:** Place a handful of props (fences, carts, crates, trees near edges) via JSON with density rules.
* **Deliverable:** The world feels alive without tanking performance (basic frustum culling/instancing).

# 10) Peasant characters (models + animation)

* **Task:** Load 2–3 peasant variants (male/female). Ensure they have **idle** and **walk** clips (Mixamo if needed). Use **AnimationMixer** and a small wrapper to play clips by name.
* **Deliverable:** Spawning a peasant plays Idle by default; Walk plays on command.

# 11) Path network for walkers

* **Task:** Build a **nav graph** from road splines (sampled points become graph nodes). Store as adjacency list.
* **Deliverable:** `navGraph.json` generated or built on load; debug draw shows nodes/edges along roads.

# 12) Crowd “walker” system (non-interactive)

* **Task:** Spawn peasants at town spawners. Pick random town-to-town routes using the nav graph; **path follow** with constant speed + basic turn smoothing; loop behavior (arrive → idle → pick next route).
* **Deliverable:** Dozens of peasants strolling along roads continuously.

# 13) Animation state & sync

* **Task:** Blend **Idle ↔ Walk** based on velocity; simple 0–1 cross-fade.
* **Deliverable:** Natural animation changes when peasants start/stop.

# 14) Performance pass

* **Task:** Use **GPU instancing** for repeated props/trees; enable frustum culling; cap shadow distance; set anisotropy reasonably; move non-critical work off the main tick.
* **Deliverable:** Smooth camera movement with target crowd size (e.g., 30–100 walkers) on a mid machine.

# 15) Visual polish (non-gameplay)

* **Task:** Add subtle ground fog, color grading (ACES), gentle directional light animation; optional ambient birds/city SFX using WebAudio.
* **Deliverable:** A pleasant, coherent medieval ambience.

# 16) Debug & tools

* **Task:** Toggleable **debug HUD** (FPS, entity counts), **gizmo** layers (splines, nav nodes), and a simple **reload world** button for hot iteration on JSON.
* **Deliverable:** Can iterate placement/roads without code rebuilds.

# 17) Packaging

* **Task:** Production build settings (renderer pixel ratio clamp, texture compression if needed).
* **Deliverable:** `dist/` that runs from a static server.

---

## Suggested directory layout

```
src/
  core/                # loop, time, events, loaders
  scene/               # camera, lights, environment, shadows
  world/               # world json, town/road loaders, props
  nav/                 # road splines -> nav graph, path sampling
  actors/              # peasants: spawn, controller, animation
  assets/              # central asset manifest (paths)
  debug/               # gizmos, stats, toggles
assets/
  models/{buildings,peasants,props}.glb
  textures/{ground,roads,hdr}.*
  data/{world.json, navGraph.json}
```

---

## Acceptance criteria for Milestone 1

* Camera pans/tilts/zooms over a **medieval environment**.
* At least **two small towns** with buildings placed from data.
* **Roads** smoothly connect the towns (visible meshes).
* **Peasants** spawn and **walk along roads** between towns, idling briefly on arrival.
* Stable performance with multiple walkers and props.

---

## Nice-to-have stretch goals

* Simple **daylight cycle** (sun color/intensity lerp).
* **Billboard VFX** (dust on roads, chimney smoke).
* **LOD** for buildings at distance.
* **Terrain blend**: darken ground under buildings/roads with a decal pass.
