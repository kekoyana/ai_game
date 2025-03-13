// コマンドの種類を定義
export type CommandCategory = 'domestic' | 'military' | 'personnel' | 'info' | 'other';

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
    id: 'develop_agriculture',
    name: '開発',
    category: 'domestic',
    description: '土地を開墾し、兵糧生産を向上',
    cost: { gold: 500 },
    requirements: { loyalty: 50 }
  },
  {
    id: 'develop_commerce',
    name: '商業',
    category: 'domestic',
    description: '商業を発展させ、収入を向上',
    cost: { gold: 500 },
    requirements: { loyalty: 50 }
  },
  {
    id: 'charity',
    name: '施し',
    category: 'domestic',
    description: '兵糧を分け与え、民の信頼を得る',
    cost: { food: 300 },
  }
];

// 軍事コマンド
// その他のコマンド
// 情報コマンド
export const infoCommands: Command[] = [
  {
    id: 'view_nation',
    name: '他国',
    category: 'info',
    description: '他国の情報を確認します'
  }
];

// 人事コマンド
export const personnelCommands: Command[] = [
  {
    id: 'recruit',
    name: '登用',
    category: 'personnel',
    description: '新しい武将を登用する',
    cost: { gold: 1000 }
  },
  {
    id: 'search',
    name: '捜索',
    category: 'personnel',
    description: '有能な人材を探す',
    cost: { gold: 500 }
  },
  {
    id: 'reward',
    name: '褒美',
    category: 'personnel',
    description: '武将に褒美を与え、忠誠を高める',
    cost: { gold: 1000 }
  }
];

export const otherCommands: Command[] = [
  {
    id: 'end_turn',
    name: '翌月',
    category: 'other',
    description: '今月の命令を終了し、翌月へ進みます'
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
    id: 'conscript',
    name: '徴兵',
    category: 'military',
    description: '新たな兵士を募る',
    cost: { gold: 100 },
    requirements: { loyalty: 40 }
  },
  {
    id: 'train_troops',
    name: '訓練',
    category: 'military',
    description: '兵士の訓練度を向上',
    cost: { gold: 300, food: 1000 },
    requirements: { military: 1000 }
  },
  {
    id: 'improve_arms',
    name: '武器',
    category: 'military',
    description: '兵士の武装を向上',
    cost: { gold: 1000 },
    requirements: { military: 1000 }
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