# Asset Conversion Guide

## FBX Models from RTS ECS Engine Repo

I've copied FBX models to `fbx_models_temp/` from the three.js-rts-ecs-engine repo.

### Available Models:

```
fbx_models_temp/
├── guard/
│   ├── T-Pose.fbx         → Convert to: peasant.glb
│   ├── Walking.fbx        → (Animation for future milestone)
│   └── HappyIdle.fbx      → (Animation for future milestone)
├── buildings/
│   └── house.fbx          → Convert to: house.glb
├── trees/
│   ├── tree1.fbx          → Convert to: tree.glb (optional prop)
│   └── bush1.fbx          → Convert to: bush.glb (optional prop)
└── palm.fbx               → Convert to: palm.glb (optional prop)
```

## Conversion Methods

### Method 1: Online Converter (Easiest)

1. Visit: https://products.aspose.app/3d/conversion/fbx-to-glb
2. Or: https://anyconv.com/fbx-to-glb-converter/
3. Upload FBX file
4. Download GLB file
5. Move to `public/assets/models/`

### Method 2: Blender (Best Quality)

For each model:

1. Open Blender
2. Delete default cube (X key)
3. File → Import → FBX (.fbx)
4. Select your FBX file
5. Select the imported object
6. File → Export → glTF 2.0 (.glb)
7. Settings:
   - Format: GLB (Binary) ✓
   - Include: Selected Objects ✓
   - Transform: Apply ✓
8. Save to `public/assets/models/`

### Method 3: fbx2gltf CLI

```bash
# Install (if not already installed)
npm install -g fbx2gltf

# Convert models
cd /home/cantuccis/Development/PERSONAL/OAL_GAME_3D

fbx2gltf fbx_models_temp/guard/T-Pose.fbx -o public/assets/models/peasant.glb
fbx2gltf fbx_models_temp/buildings/house.fbx -o public/assets/models/house.glb
fbx2gltf fbx_models_temp/trees/tree1.fbx -o public/assets/models/tree.glb

# Clean up temp folder when done
rm -rf fbx_models_temp/
```

## After Conversion

Once you have GLB files in `public/assets/models/`, refresh your browser!

The game will automatically:
- Load `peasant.glb` instead of capsule placeholders
- Load `house.glb` instead of cube placeholders
- Apply proper shadows and materials

## Still Need:

- `tower.glb` - Get from Quaternius or Kenney
- `market.glb` - Get from Quaternius or Kenney

Or update `public/assets/data/world.json` to only use "house" models!

## Quick Edit to world.json

If you only convert the house, you can update your world to use just houses:

```json
{
  "buildings": [
    {
      "modelName": "house",
      "position": { "x": 0, "y": 0, "z": 0 },
      "rotation": 0,
      "scale": 1.0
    }
  ]
}
```

Change all `"tower"` and `"market"` references to `"house"` temporarily!

## License Note

These models are from: https://github.com/andvolodko/three.js-rts-ecs-engine
- Repo is MIT licensed
- Always check asset licenses before commercial use
- These are great for learning and prototyping!

