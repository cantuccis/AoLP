# Medieval Kingdom 3D

A 3D strategy game built with Three.js where you manage and optimize a medieval kingdom.

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open your browser at `http://localhost:3000`

### Build

```bash
pnpm build
```

## Project Structure

```
src/
  core/          - Game loop and core systems
  scene/         - Scene, camera, lighting, ground
  world/         - World data, towns, roads, peasants
  assets/        - Asset loading utilities
  debug/         - Debug tools (stats, helpers)
public/
  assets/
    models/      - 3D models (.glb files)
    textures/    - Textures and materials
    data/        - World configuration (world.json)
```

## Current Features (Milestone 1)

- ✅ Fixed-timestep game loop (60Hz updates)
- ✅ RTS-style camera with pan/zoom/tilt controls
- ✅ Directional lighting with shadows
- ✅ Ground plane with grass material
- ✅ JSON-driven world configuration
- ✅ Town placement system (2-3 buildings per town)
- ✅ Road system connecting towns (spline-based)
- ✅ Static peasant placement
- ✅ Performance optimizations for medium-low hardware
- ✅ FPS counter and debug helpers

## Adding 3D Assets

The game currently uses placeholder geometry. To add proper low-poly medieval assets:

### Recommended Asset Packs (CC0 License)

1. **Quaternius - Ultimate Medieval Pack**
   - Download: https://quaternius.com/packs/ultimatemedieval.html
   - Contains: Buildings, characters, props, all low-poly
   - Format: FBX (convert to GLB using Blender)

2. **Kenney - Medieval Kit**
   - Download: https://kenney.nl/assets/medieval-kit
   - Contains: Buildings, props, weapons
   - Format: OBJ/FBX (convert to GLB)

3. **Kenney - Character Pack**
   - Download: https://kenney.nl/assets/modular-characters
   - Contains: Simple character models
   - Format: OBJ/FBX (convert to GLB)

### Converting Assets to GLB

1. Open Blender
2. File > Import > FBX/OBJ
3. Select your model
4. File > Export > glTF 2.0 (.glb)
5. In export settings:
   - Format: GLB (Binary)
   - Include: Selected Objects
   - Transform: Apply transforms
6. Save to `public/assets/models/`

### Asset Naming

Place your converted models in `public/assets/models/` with these names:
- `house.glb` - Generic house model
- `tower.glb` - Tower/defensive structure
- `market.glb` - Market stall or building
- `peasant.glb` - Peasant character

Or update the model names in `public/assets/data/world.json` to match your files.

### Grass Texture

For the ground plane, add a grass texture:
- Download a tileable grass texture from PolyHaven: https://polyhaven.com/textures
- Save as `public/assets/textures/grass.jpg`
- The texture will automatically load and tile across the ground

## Controls

### Camera
- **Left Click + Drag** - Rotate camera around target
- **Right Click + Drag** - Pan camera
- **Mouse Wheel** - Zoom in/out

### Keyboard
- **H** - Toggle debug helpers (axes and grid)
- **S** - Toggle stats display (FPS counter)

## Configuration

Edit `public/assets/data/world.json` to:
- Add or modify towns
- Change building positions and rotations
- Adjust road paths
- Place peasants around the world

## Performance Tips

- The renderer pixel ratio is clamped to 1.5x
- Shadow map size is set to 2048x2048
- Fog is used to limit draw distance
- Camera far plane limits visible distance

## Next Steps (Future Milestones)

- [ ] Animated peasants walking along roads
- [ ] Game logic and kingdom management
- [ ] Resource system
- [ ] UI for decision making
- [ ] Daylight cycle
- [ ] Interactive buildings

## License

Code: MIT License
Assets: Use CC0 licensed assets as recommended above

