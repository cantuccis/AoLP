# Asset Requirements

This file documents the assets needed for the game. Currently, the game uses placeholder geometry when models are not found.

## Required Models

Place these files in `public/assets/models/`:

### Buildings
- `house.glb` - Basic house model (low-poly, ~500-1000 triangles)
- `tower.glb` - Tower or defensive structure (low-poly)
- `market.glb` - Market stall or trading building (low-poly)

### Characters
- `peasant.glb` - Peasant character model (low-poly, ~300-500 triangles)
  - Optional: Include idle and walk animations

### Props (Optional)
- `cart.glb` - Wooden cart
- `barrel.glb` - Storage barrel
- `fence.glb` - Fence section
- `tree.glb` - Simple tree

## Required Textures

Place these files in `public/assets/textures/`:

- `grass.jpg` - Tileable grass texture (512x512 or 1024x1024)
- `road.jpg` - Dirt road texture (optional, currently using solid color)

## Recommended Sources

### Free CC0 Assets

1. **Quaternius** (https://quaternius.com)
   - Ultimate Medieval Pack
   - All CC0, no attribution required
   - Already in GLB format

2. **Kenney** (https://kenney.nl)
   - Medieval Kit
   - Various prop packs
   - Available in multiple formats

3. **PolyHaven** (https://polyhaven.com)
   - High-quality PBR textures
   - All CC0 license
   - Free for any use

## Asset Specifications

### Models
- Format: GLB (binary glTF)
- Poly count: 300-1500 triangles per model
- Origin: Center bottom (for buildings/characters)
- Scale: 1 unit = 1 meter
- Up axis: Y-up
- Materials: PBR (Metallic-Roughness workflow)

### Textures
- Format: JPG or PNG
- Size: 512x512 to 2048x2048 (power of 2)
- Tileable: Yes (for ground/road textures)
- Color space: sRGB

## Current Status

Without custom assets, the game will:
- Use brown placeholder cubes for buildings
- Use capsule shapes for peasants
- Use solid grass-green color for ground
- Use brown color for roads

The game is fully functional with placeholders and will automatically use custom models when available.

