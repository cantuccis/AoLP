# Quick Start Guide

This guide will help you get the Medieval Kingdom 3D game running in just a few minutes.

## Prerequisites

- Node.js 16+ (pnpm is already available on your system)

## Installation & Running

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Open http://localhost:3000 in your browser
```

## What You'll See

On first run, you'll see:
- A medieval world with 3 towns (using placeholder cube buildings)
- Roads connecting the towns
- 8 peasants placed around the towns (using capsule placeholders)
- A grass-colored ground plane
- FPS stats in the top-left corner
- Grid and axes helpers for reference

## Controls

- **Mouse**: Left-drag to rotate, right-drag to pan, scroll to zoom
- **H key**: Toggle debug helpers (grid/axes)
- **S key**: Toggle FPS stats

## Next Steps

### Option 1: Use Placeholder Geometry (Already Working!)
The game works perfectly with placeholder geometry. You can:
- Edit `public/assets/data/world.json` to add more towns
- Adjust building positions and rotations
- Add more peasants
- Modify road paths

### Option 2: Add Real 3D Models

1. Download free low-poly medieval assets:
   - **Quaternius Medieval Pack**: https://quaternius.com/packs/ultimatemedieval.html
   - **Kenney Medieval Kit**: https://kenney.nl/assets/medieval-kit

2. Convert models to GLB format (if needed):
   - Open Blender
   - Import your FBX/OBJ file
   - Export as glTF 2.0 Binary (.glb)

3. Place models in `public/assets/models/`:
   - `house.glb`
   - `tower.glb`
   - `market.glb`
   - `peasant.glb`

4. Refresh the page - models will automatically load!

### Option 3: Just Explore the World

Use the camera controls to:
- Zoom out to see all three towns
- Rotate around to see the roads connecting them
- Find the peasants placed around the towns
- Notice the soft shadows cast by the sun

## Customization

### Edit World Layout

Open `public/assets/data/world.json` to:
- Move towns to different positions
- Add or remove buildings
- Change road paths
- Place peasants in different locations

Changes are loaded on page refresh.

### Adjust Visuals

In `src/scene/GameScene.ts`:
- Change sky color (line 27): `0x87ceeb` (light blue)
- Adjust camera position (line 40)
- Modify fog distance (line 30)

In `src/scene/Lighting.ts`:
- Adjust sun position (line 13)
- Change shadow quality (line 17-18)
- Modify ambient light intensity (line 29)

## Performance

The game is optimized for medium-low hardware:
- Pixel ratio capped at 1.5x
- Shadow maps at 2048x2048
- Frustum culling enabled
- Fog limits draw distance

Target: 60 FPS with 50+ objects on screen.

## Troubleshooting

### Black screen
- Check browser console (F12) for errors
- Make sure `world.json` is valid JSON

### Models not loading
- Check that files are in `public/assets/models/`
- Verify files are `.glb` format
- Check browser console for 404 errors

### Low FPS
- Press H to hide debug helpers
- Reduce shadow map size in `src/scene/Lighting.ts`
- Adjust camera far plane in `src/scene/GameScene.ts`

## Development

### Project Structure
```
src/
  core/          - Game loop
  scene/         - Scene, camera, lighting
  world/         - Towns, roads, peasants
  assets/        - Asset loading
  debug/         - Stats and helpers
```

### Building for Production
```bash
pnpm build
pnpm preview
```

## Next Milestones

Future features planned:
- Animated peasants walking along roads
- Kingdom management mechanics
- Resource system
- Interactive buildings
- Day/night cycle

Enjoy building your medieval kingdom! 🏰

