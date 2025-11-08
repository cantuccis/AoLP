export interface TownState {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
}

export interface GoldMineState {
  id: string;
  position: { x: number; y: number; z: number };
}

export interface PeasantState {
  id: string;
  name: string;
  townId: string;
  taskType: 'idle' | 'mine_gold' | 'chop_wood';
  taskState?: {
    phase: 'walking_to_mine' | 'mining' | 'walking_to_town' | 'waiting_at_town' | 'walking_to_tree' | 'chopping' | 'returning_to_town' | 'waiting';
    startTime: number;
    targetMineId?: string;
    targetTreePosition?: { x: number; y: number; z: number };
  };
}

export interface GameState {
  gold: number; // kingdom's current gold
  wood: number; // kingdom's current wood
  towns: TownState[];
  goldMines: GoldMineState[];
  peasants: PeasantState[];
  gameTime: number; // milliseconds since game start
}

export interface GameConfig {
  towns: TownState[];
  goldMines: GoldMineState[];
  peasants: PeasantState[];
}

