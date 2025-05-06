// 建物カードデータ
import { BuildingCard } from './GameTypes';

export const BuildingCards: BuildingCard[] = [
  // 生産施設
  ...Array(10).fill(null).map((_, i) => ({
    id: `indigo_${i+1}`,
    name: 'インディゴ染料工場',
    cost: 1,
    basePoint: 1,
    category: 'production' as const,
    effect: 'インディゴを生産'
  })),
  ...Array(8).fill(null).map((_, i) => ({
    id: `sugar_${i+1}`,
    name: 'サトウ精製所',
    cost: 2,
    basePoint: 1,
    category: 'production' as const,
    effect: 'サトウを生産'
  })),
  ...Array(8).fill(null).map((_, i) => ({
    id: `tobacco_${i+1}`,
    name: 'タバコ保存所',
    cost: 3,
    basePoint: 2,
    category: 'production' as const,
    effect: 'タバコを生産'
  })),
  ...Array(8).fill(null).map((_, i) => ({
    id: `coffee_${i+1}`,
    name: 'コーヒー焙煎場',
    cost: 4,
    basePoint: 2,
    category: 'production' as const,
    effect: 'コーヒーを生産'
  })),
  ...Array(8).fill(null).map((_, i) => ({
    id: `silver_${i+1}`,
    name: 'シルバー精錬所',
    cost: 5,
    basePoint: 3,
    category: 'production' as const,
    effect: 'シルバーを生産'
  })),
  // 都市施設・記念施設（枚数・効果は省略せず明示）
  // コスト1
  ...Array(3).fill(null).map((_, i) => ({
    id: `smithy_${i+1}`,
    name: '鍛冶屋',
    cost: 1,
    basePoint: 1,
    category: 'city' as const,
    effect: '生産施設建設コスト-1'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `mine_${i+1}`,
    name: '金鉱',
    cost: 1,
    basePoint: 1,
    category: 'city' as const,
    effect: '金鉱掘り時に4枚めくり重複なければ1枚入手'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `museum_${i+1}`,
    name: '資料館',
    cost: 1,
    basePoint: 1,
    category: 'city' as const,
    effect: '参事会議員で捨てるカードを手札からも選べる'
  })),
  // コスト2
  ...Array(3).fill(null).map((_, i) => ({
    id: `well_${i+1}`,
    name: '井戸',
    cost: 2,
    basePoint: 1,
    category: 'city' as const,
    effect: '2枚以上生産物を置いたとき1枚引く'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `stall_${i+1}`,
    name: '屋台',
    cost: 2,
    basePoint: 1,
    category: 'city' as const,
    effect: '2枚以上生産物を売却時に追加で1枚引く'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `blackmarket_${i+1}`,
    name: '闇市',
    cost: 2,
    basePoint: 1,
    category: 'city' as const,
    effect: '建設時に生産物を2枚まで1コスト分として使える'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `crane_${i+1}`,
    name: 'クレーン',
    cost: 2,
    basePoint: 1,
    category: 'city' as const,
    effect: '建設時に既存建物を建て替えできる'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `market_${i+1}`,
    name: '交易所',
    cost: 2,
    basePoint: 1,
    category: 'city' as const,
    effect: '売却時に1枚追加で生産物を売れる'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `almshouse_${i+1}`,
    name: '救貧院',
    cost: 2,
    basePoint: 1,
    category: 'city' as const,
    effect: '建設後手札が1枚以下なら1枚引く'
  })),
  // コスト3
  ...Array(3).fill(null).map((_, i) => ({
    id: `furniture_${i+1}`,
    name: '家具製作所',
    cost: 3,
    basePoint: 2,
    category: 'city' as const,
    effect: '都市建物建設時1枚引く'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `governor_${i+1}`,
    name: '知事官舎',
    cost: 3,
    basePoint: 2,
    category: 'city' as const,
    effect: '参事会議員で手札に残すカード+1'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `aqueduct_${i+1}`,
    name: '水道橋',
    cost: 3,
    basePoint: 2,
    category: 'city' as const,
    effect: '生産時に生産物+1'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `tower_${i+1}`,
    name: '塔',
    cost: 3,
    basePoint: 2,
    category: 'city' as const,
    effect: '手札上限12枚'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `chapel_${i+1}`,
    name: '礼拝堂',
    cost: 3,
    basePoint: 2,
    category: 'city' as const,
    effect: 'ターンエンドにカード1枚を1点として埋められる'
  })),
  // コスト4
  ...Array(3).fill(null).map((_, i) => ({
    id: `marketplus_${i+1}`,
    name: 'マーケット',
    cost: 4,
    basePoint: 2,
    category: 'city' as const,
    effect: '生産物売却時追加で1枚引く'
  })),
  ...Array(3).fill(null).map((_, i) => ({
    id: `quarry_${i+1}`,
    name: '石切場',
    cost: 4,
    basePoint: 2,
    category: 'city' as const,
    effect: '都市施設建設コスト-1'
  })),
  // コスト5
  ...Array(3).fill(null).map((_, i) => ({
    id: `library_${i+1}`,
    name: '図書館',
    cost: 5,
    basePoint: 3,
    category: 'city' as const,
    effect: '特権効果を倍にする'
  })),
  // コスト6（2枚ずつ）
  ...Array(2).fill(null).map((_, i) => ({
    id: `guildhall_${i+1}`,
    name: 'ギルドホール',
    cost: 6,
    basePoint: 0,
    category: 'city' as const,
    effect: '生産施設×2点'
  })),
  ...Array(2).fill(null).map((_, i) => ({
    id: `cityhall_${i+1}`,
    name: '市役所',
    cost: 6,
    basePoint: 0,
    category: 'city' as const,
    effect: '都市施設×1点'
  })),
  ...Array(2).fill(null).map((_, i) => ({
    id: `palace_${i+1}`,
    name: '宮殿',
    cost: 6,
    basePoint: 0,
    category: 'city' as const,
    effect: '総得点4点につき1点'
  })),
  ...Array(2).fill(null).map((_, i) => ({
    id: `triumph_${i+1}`,
    name: '凱旋門',
    cost: 6,
    basePoint: 0,
    category: 'city' as const,
    effect: '記念施設数で得点'
  })),
  // 記念施設
  { id: 'statue', name: '彫像', cost: 3, basePoint: 3, category: 'monument' as const, effect: '記念施設' },
  { id: 'victorytower', name: '勝利記念塔', cost: 4, basePoint: 4, category: 'monument' as const, effect: '記念施設' },
  { id: 'knightstatue', name: '騎士像', cost: 5, basePoint: 5, category: 'monument' as const, effect: '記念施設' },
];