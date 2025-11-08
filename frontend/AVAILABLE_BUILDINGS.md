# Available Buildings from FBX_Buildings Pack

This is a comprehensive medieval strategy game asset pack with **building progression system**!

## 🏰 Building Categories

### Town Centers (Main Buildings)
- `TownCenter_FirstAge_Level1.fbx` → `TownCenter_FirstAge_Level3.fbx`
- `TownCenter_SecondAge_Level1.fbx` → `TownCenter_SecondAge_Level3.fbx`
- **Usage:** Main hub building for each town

### Houses (Residential)
**FirstAge - 3 variants, each with 3 levels:**
- `Houses_FirstAge_1_Level1.fbx` → `Houses_FirstAge_1_Level3.fbx`
- `Houses_FirstAge_2_Level1.fbx` → `Houses_FirstAge_2_Level3.fbx`
- `Houses_FirstAge_3_Level1.fbx` → `Houses_FirstAge_3_Level3.fbx`

**SecondAge - 3 variants, each with 3 levels:**
- `Houses_SecondAge_1_Level1.fbx` → `Houses_SecondAge_1_Level3.fbx`
- `Houses_SecondAge_2_Level1.fbx` → `Houses_SecondAge_2_Level3.fbx`
- `Houses_SecondAge_3_Level1.fbx` → `Houses_SecondAge_3_Level3.fbx`

### Military Buildings
**Barracks (Train soldiers)**
- `Barracks_FirstAge_Level1.fbx` → `Barracks_FirstAge_Level3.fbx`
- `Barracks_SecondAge_Level1.fbx` → `Barracks_SecondAge_Level3.fbx`

**Archery (Train archers)**
- `Archery_FirstAge_Level1.fbx` → `Archery_FirstAge_Level3.fbx`
- `Archery_SecondAge_Level1.fbx` → `Archery_SecondAge_Level3.fbx`

**WatchTowers (Defense)**
- `WatchTower_FirstAge_Level1.fbx` → `WatchTower_FirstAge_Level3.fbx`
- `WatchTower_SecondAge_Level1.fbx` → `WatchTower_SecondAge_Level3.fbx`

### Economic Buildings
**Markets (Trade)**
- `Market_FirstAge_Level1.fbx` → `Market_FirstAge_Level3.fbx`
- `Market_SecondAge_Level1.fbx` → `Market_SecondAge_Level3.fbx`

**Storage (Resources)**
- `Storage_FirstAge_Level1.fbx` → `Storage_FirstAge_Level3.fbx`
- `Storage_SecondAge_Level2.fbx` → `Storage_SecondAge_Level3.fbx`

**Ports (Sea trade)**
- `Port_FirstAge_Level1.fbx` → `Port_FirstAge_Level3.fbx`
- `Port_SecondAge_Level1.fbx` → `Port_SecondAge_Level3.fbx`

### Special Buildings
**Wonder (Victory building)**
- `Wonder_FirstAge_Level1.fbx` → `Wonder_FirstAge_Level3.fbx`
- `Wonder_SecondAge_Level1.fbx` → `Wonder_SecondAge_Level3.fbx`

**Resource Production**
- `Windmill_FirstAge.fbx` / `Windmill_SecondAge.fbx`
- `TowerHouse_FirstAge.fbx` / `TowerHouse_SecondAge.fbx`
- `Mine.fbx`
- `Farm_Dirt_Level1.fbx` → `Farm_Dirt_Level3.fbx`

### Defensive Structures
- `Wall_FirstAge.fbx` - Wall segment
- `WallTowers_FirstAge.fbx` - Corner tower
- `WallTowers_Door_FirstAge.fbx` - Gate tower (open)
- `WallTowers_DoorClosed_FirstAge.fbx` - Gate tower (closed)

### Props & Resources
**Docks & Ports**
- `Dock_FirstAge.fbx`

**Storage Props**
- `Barrel.fbx`
- `Crate.fbx`
- `Crate_Stack1.fbx`, `Crate_Stack2.fbx`
- `Crate_Big_Stack2.fbx`
- `Logs.fbx`

**Natural Resources**
- `Resource_Tree1.fbx`, `Resource_Tree2.fbx`
- `Resource_Tree_Group.fbx`, `Resource_Tree_Group_Cut.fbx`
- `Resource_PineTree.fbx`, `Resource_PineTree_Group.fbx`
- `Resource_Rock_1.fbx` → `Resource_Rock_3.fbx`
- `Rock.fbx`, `Rock_Group.fbx`
- `Resource_Gold_1.fbx` → `Resource_Gold_3.fbx`

## 🎮 Currently Used in Game

```
✅ house.fbx           → Houses_FirstAge_1_Level2.fbx
✅ house2.fbx          → Houses_FirstAge_2_Level1.fbx
✅ house3.fbx          → Houses_FirstAge_3_Level1.fbx
✅ tower.fbx           → WatchTower_FirstAge_Level2.fbx
✅ market.fbx          → Market_FirstAge_Level2.fbx
✅ towncenter.fbx      → TownCenter_FirstAge_Level2.fbx
✅ barracks.fbx        → Barracks_FirstAge_Level1.fbx
✅ peasant.glb         → Guard T-Pose (from RTS engine)
```

## 🚀 How to Add More Buildings

### 1. Copy to public folder
```bash
cp asset_packs/FBX_Buildings/[BuildingName].fbx public/assets/models/[shortname].fbx
```

### 2. Add to WorldManager.ts
```typescript
{ name: 'windmill', path: '/assets/models/windmill.fbx' },
```

### 3. Use in world.json
```json
{
  "modelName": "windmill",
  "position": { "x": 15, "y": 0, "z": 10 },
  "rotation": 0,
  "scale": 1.0
}
```

## 🎨 Building Progression System

The asset pack has a **built-in progression system**!

### Ages
- **FirstAge** - Early medieval (simpler, smaller buildings)
- **SecondAge** - Late medieval (more elaborate, larger buildings)

### Levels (1-3)
- **Level 1** - Basic version
- **Level 2** - Upgraded version
- **Level 3** - Fully upgraded version

### Game Mechanic Ideas
Use this for your kingdom optimization game:
- Start with FirstAge buildings
- Upgrade to SecondAge as kingdom progresses
- Each level improves efficiency/capacity
- Visual progression shows kingdom growth

## 📦 File Sizes

Most buildings are **20-300KB** - very efficient!
- Houses: 20-130KB
- Town Centers: 30-330KB
- Markets: 110-320KB
- Military: 45-215KB

Total pack: ~12MB of medieval assets! 🎉

## 💡 Suggested Town Layouts

### Starting Town (FirstAge)
- 1x TownCenter_FirstAge_Level1
- 3-5x Houses_FirstAge (mixed variants)
- 1x Market_FirstAge_Level1
- 1x WatchTower_FirstAge_Level1

### Advanced Town (SecondAge)
- 1x TownCenter_SecondAge_Level3
- 5-8x Houses_SecondAge (mixed variants)
- 1x Market_SecondAge_Level2
- 2x WatchTower_SecondAge_Level2
- 1x Barracks_SecondAge_Level2
- 1x Storage_SecondAge_Level2

### Military Outpost
- 1x Barracks_SecondAge_Level3
- 1x Archery_SecondAge_Level2
- 2x WatchTower_SecondAge_Level3
- Wall segments connecting towers

## 🎯 Perfect for Your Game!

This asset pack is **ideal for a kingdom optimization strategy game** because:
✅ Building progression system (ages + levels)
✅ Multiple building types (economic, military, special)
✅ Resource buildings (farms, mines, windmills)
✅ Defensive structures (walls, towers)
✅ Props for detail (barrels, crates, resources)

You have everything needed to create a deep strategy game! 🏰

