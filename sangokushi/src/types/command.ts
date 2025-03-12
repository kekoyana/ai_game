// コマンドの種類を定義
export type CommandCategory = 'domestic' | 'military' | 'other';

// コマンドの定義
export interface Command {
  id: string;
  name: string;
  category: CommandCategory;
  description: string;
  cost?: {
    gold?: number;
    food?: number;
  };
  requirements?: {
    loyalty?: number;
    military?: number;
  };
}

// 内政コマンド
export const domesticCommands: Command[] = [
  {
    id: 'charity',
    name: '施し',
    category: 'domestic',
    description: '兵糧を分け与え、民の信頼を得る',
    cost: { food: 300 },
  },
  {
    id: 'develop_commerce',
    name: '商業開発',
    category: 'domestic',
    description: '商業を発展させ、収入を向上',
    cost: { gold: 500 },
    requirements: { loyalty: 50 }
  },
  {
    id: 'develop_agriculture',
    name: '土地開発',
    category: 'domestic',
    description: '土地を開墾し、兵糧生産を向上',
    cost: { gold: 500 },
    requirements: { loyalty: 50 }
  },
  {
    id: 'collect_tax',
    name: '徴税',
    category: 'domestic',
    description: '税金を徴収する',
    requirements: { loyalty: 30 }
  },
  {
    id: 'conscript',
    name: '徴兵',
    category: 'domestic',
    description: '新たな兵士を募る',
    cost: { gold: 100 },
    requirements: { loyalty: 40 }
  }
];

// 軍事コマンド
// その他のコマンド
export const otherCommands: Command[] = [
  {
    id: 'end_turn',
    name: '命令終了',
    category: 'other',
    description: '今月の命令を終了し、次の月へ進みます'
  }
];

export interface WarCommand extends Command {
  targetProvinceId?: string;
}

export const militaryCommands: Command[] = [
  {
    id: 'war',
    name: '戦争',
    category: 'military',
    description: '隣接する州に攻め込みます',
    requirements: {
      military: 1000,
      loyalty: 50
    },
    cost: {
      food: 2000
    }
  },
  {
    id: 'train_troops',
    name: '軍事訓練',
    category: 'military',
    description: '兵士の訓練度を向上',
    cost: { gold: 300, food: 1000 },
    requirements: { military: 1000 }
  },
  {
    id: 'improve_arms',
    name: '武器改良',
    category: 'military',
    description: '兵士の武装を向上',
    cost: { gold: 1000 },
    requirements: { military: 1000 }
  },
  {
    id: 'distribute_food',
    name: '兵糧配給',
    category: 'military',
    description: '兵士に兵糧を配給して士気を向上',
    cost: { food: 2000 },
    requirements: { military: 500 }
  }
];

// コマンド実行の結果
export interface CommandResult {
  success: boolean;
  message: string;
  effects?: {
    gold?: number;
    food?: number;
    loyalty?: number;
    commerce?: number;
    agriculture?: number;
    military?: number;
    arms?: number;
    training?: number;
    population?: number;
  };
}