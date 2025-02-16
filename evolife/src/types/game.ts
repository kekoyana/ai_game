// 環境の種類を定義
export type EnvironmentType =
  | 'deep_ocean' // 深海
  | 'shallow_water' // 浅瀬
  | 'wetland' // 湿地
  | 'beach' // 浜辺
  | 'jungle' // 密林
  | 'plains' // 草原
  | 'mountain' // 山岳
  | 'desert' // 砂漠
  | 'cave' // 洞窟
  | 'volcano'; // 火山

// 生物の進化段階を定義
export type EvolutionStage =
  | 'primitive' // 原生生物
  | 'bacteria' // バクテリア
  | 'jellyfish' // クラゲ
  | 'shellfish' // 貝類
  | 'squid' // イカ
  | 'fish' // 魚類
  | 'lungfish' // 肺魚
  | 'amphibian' // 両生類
  | 'insect' // 昆虫
  | 'reptile' // 爬虫類
  | 'dinosaur' // 恐竜
  | 'bird' // 鳥類
  | 'mammal' // 哺乳類
  | 'primate' // 霊長類
  | 'human'; // 人類

// 環境の定義
export interface Environment {
  type: EnvironmentType;
  name: string;
  description: string;
  // 各生物種の適応度（0-100）
  adaptability: {
    [key in EvolutionStage]: number;
  };
  // 生物の自然発生確率（0-1）
  spawnRate: number;
  // 原生生物が発生可能かどうか
  canSpawnPrimitive: boolean;
}

// 生物の定義
export interface Organism {
  stage: EvolutionStage;
  health: number; // 0-100
  age: number;
  adaptationScore: number; // 現在の環境への適応スコア
}

// セルの定義
export interface Cell {
  environment: Environment | null;
  organism: Organism | null;
}

// ゲームの状態
export interface GameState {
  board: Cell[][];
  selectedEnvironment: EnvironmentType | null;
  turn: number;
  isGameCleared: boolean; // クリアフラグ
  humanCount: number; // 人類の数
}

// 進化の経路を定義
export type EvolutionPath = {
  from: EvolutionStage;
  to: EvolutionStage;
  requirements: {
    health: number;
    age: number;
    environments: EnvironmentType[]; // この進化に適した環境
  };
};

// 進化の経路マップ
export const EVOLUTION_PATHS: EvolutionPath[] = [
  {
    from: 'primitive',
    to: 'bacteria',
    requirements: {
      health: 70,
      age: 5,
      environments: ['deep_ocean', 'volcano'],
    },
  },
  {
    from: 'bacteria',
    to: 'jellyfish',
    requirements: {
      health: 75,
      age: 8,
      environments: ['deep_ocean', 'shallow_water'],
    },
  },
  {
    from: 'bacteria',
    to: 'shellfish',
    requirements: {
      health: 75,
      age: 8,
      environments: ['shallow_water', 'beach'],
    },
  },
  {
    from: 'jellyfish',
    to: 'squid',
    requirements: {
      health: 80,
      age: 10,
      environments: ['deep_ocean', 'shallow_water'],
    },
  },
  {
    from: 'shellfish',
    to: 'fish',
    requirements: {
      health: 80,
      age: 12,
      environments: ['shallow_water'],
    },
  },
  {
    from: 'fish',
    to: 'lungfish',
    requirements: {
      health: 85,
      age: 15,
      environments: ['shallow_water', 'wetland'],
    },
  },
  {
    from: 'lungfish',
    to: 'amphibian',
    requirements: {
      health: 85,
      age: 18,
      environments: ['wetland', 'beach'],
    },
  },
  {
    from: 'amphibian',
    to: 'insect',
    requirements: {
      health: 80,
      age: 10,
      environments: ['wetland', 'jungle'],
    },
  },
  {
    from: 'amphibian',
    to: 'reptile',
    requirements: {
      health: 85,
      age: 20,
      environments: ['beach', 'plains'],
    },
  },
  {
    from: 'reptile',
    to: 'dinosaur',
    requirements: {
      health: 90,
      age: 25,
      environments: ['plains', 'jungle'],
    },
  },
  {
    from: 'dinosaur',
    to: 'bird',
    requirements: {
      health: 90,
      age: 30,
      environments: ['mountain', 'plains'],
    },
  },
  {
    from: 'reptile',
    to: 'mammal',
    requirements: {
      health: 85,
      age: 25,
      environments: ['plains', 'cave'],
    },
  },
  {
    from: 'mammal',
    to: 'primate',
    requirements: {
      health: 90,
      age: 30,
      environments: ['jungle', 'plains'],
    },
  },
  {
    from: 'primate',
    to: 'human',
    requirements: {
      health: 95,
      age: 35,
      environments: ['plains', 'cave'],
    },
  },
];