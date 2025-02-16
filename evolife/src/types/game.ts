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
  | 'jellyfish' // クラゲ
  | 'shellfish' // 貝類
  | 'fish' // 魚類
  | 'lungfish' // 肺魚
  | 'amphibian' // 両生類
  | 'reptile' // 爬虫類
  | 'dinosaur' // 恐竜
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
}