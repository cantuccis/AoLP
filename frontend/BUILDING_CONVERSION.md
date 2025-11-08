# Building Assets Conversion Guide

You have excellent medieval building models in the `Buildings/` folder!

## Available Buildings

```
Buildings/FBX/
├── House_1.fbx      → house.glb (PRIMARY)
├── House_2.fbx      → house2.glb (variant)
├── House_3.fbx      → house3.glb (variant)
├── House_4.fbx      → house4.glb (variant)
├── Bell_Tower.fbx   → tower.glb (PRIMARY)
├── Inn.fbx          → market.glb (PRIMARY)
├── Blacksmith.fbx   → blacksmith.glb (optional)
├── Stable.fbx       → stable.glb (optional)
├── Mill.fbx         → mill.glb (optional)
└── Sawmill.fbx      → sawmill.glb (optional)
```

## Priority Conversions

These 3 buildings will immediately work with your current world.json:

### 1. House_1.fbx → house.glb
**Used by:** All 9 buildings in your world (currently all set to "house")
**Priority:** ⭐⭐⭐ CRITICAL

### 2. Bell_Tower.fbx → tower.glb
**Used by:** tower references in world_backup.json
**Priority:** ⭐⭐ HIGH

### 3. Inn.fbx → market.glb  
**Used by:** market references in world_backup.json
**Priority:** ⭐⭐ HIGH

## Conversion Methods

### Method 1: Online Converter (Easiest - 5 minutes each)

**Recommended:** https://products.aspose.app/3d/conversion/fbx-to-glb

1. Visit the link above
2. Upload `Buildings/FBX/House_1.fbx`
3. Click "Convert"
4. Download the GLB file
5. Move to: `public/assets/models/house.glb`
6. Refresh browser!

Repeat for Bell_Tower and Inn.

### Method 2: Install fbx2gltf CLI

```bash
# Install Node.js converter (if you want to batch convert)
npm install -g fbx2gltf

# Convert the priority buildings
cd /home/cantuccis/Development/PERSONAL/OAL_GAME_3D

fbx2gltf Buildings/FBX/House_1.fbx -o public/assets/models/house.glb
fbx2gltf Buildings/FBX/Bell_Tower.fbx -o public/assets/models/tower.glb
fbx2gltf Buildings/FBX/Inn.fbx -o public/assets/models/market.glb

# Bonus: Convert variants
fbx2gltf Buildings/FBX/House_2.fbx -o public/assets/models/house2.glb
fbx2gltf Buildings/FBX/Blacksmith.fbx -o public/assets/models/blacksmith.glb
```

### Method 3: Blender (Best Quality)

For each building:

1. Open Blender
2. Delete default cube (X key)
3. File → Import → FBX (.fbx)
4. Select your building (e.g., House_1.fbx)
5. File → Export → glTF 2.0 (.glb)
6. Settings:
   - Format: **GLB (Binary)** ✓
   - Include: **Selected Objects** ✓
   - Transform: **Apply** ✓
7. Save to `public/assets/models/house.glb`

## After Converting

Once you have the 3 primary buildings converted:

```bash
public/assets/models/
├── peasant.glb       ✅ Already have
├── house.glb         ⭐ Convert House_1.fbx
├── tower.glb         ⭐ Convert Bell_Tower.fbx
└── market.glb        ⭐ Convert Inn.fbx
```

Then restore the full world:

```bash
# Restore original world with all building types
cp public/assets/data/world_backup.json public/assets/data/world.json
```

Refresh browser and you'll see:
- 3 different towns
- 9 buildings (mix of houses, towers, markets)
- 8 peasant guards
- All with real 3D models!

## Adding Building Variety

Want to use different house models? Update world.json:

```json
{
  "modelName": "house2",     // or house3, house4
  "position": { "x": 8, "y": 0, "z": 0 },
  "rotation": 0.5,
  "scale": 0.9
}
```

Just convert the additional house variants and reference them by name!

## Quick Test - Convert Just One

To test the system, start with just House_1:

1. Convert `Buildings/FBX/House_1.fbx` to GLB
2. Save as `public/assets/models/house.glb`
3. Refresh http://localhost:3000
4. You should see real houses instead of cubes!

Then convert the rest when you're ready.

