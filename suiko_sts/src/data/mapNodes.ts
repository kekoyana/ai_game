export type NodeType = 'empty' | 'enemy' | 'elite' | 'boss' | 'item' | 'rest' | 'shop'

export interface MapNode {
  id: string
  type: NodeType
  x: number
  y: number
  connections: string[]
  visited?: boolean
  cleared?: boolean
  enemyType?: string
  itemType?: string
  level?: number
}

export interface MapLevel {
  nodes: MapNode[]
  startNodeId: string
  bossNodeId: string
  stageNumber: number
}

// 敵の種類とその出現階層
const enemyPool = {
  stage1: {
    early: [
      { type: '鎮関西 鄭屠', difficulty: 1 },
      { type: '無毛虎 牛二', difficulty: 1 },
      { type: '李鬼', difficulty: 2 }
    ],
    elite: [
      { type: '蒋門神 蒋忠', difficulty: 3 },
      { type: '西門慶', difficulty: 3 }
    ],
    boss: [
      { type: '王倫', difficulty: 4 }
    ]
  },
  stage2: {
    early: [
      { type: '鄧龍', difficulty: 2 },
      { type: '崔道成', difficulty: 2 },
      { type: '王江', difficulty: 3 }
    ],
    elite: [
      { type: '祝彪', difficulty: 4 },
      { type: '祝朝奉', difficulty: 4 },
      { type: '曾塗', difficulty: 5 },
      { type: '曾弄', difficulty: 5 }
    ],
    boss: [
      { type: '史文恭', difficulty: 6 }
    ]
  },
  stage3: {
    early: [
      { type: '劉夢竜', difficulty: 4 },
      { type: '陸謙', difficulty: 4 },
      { type: '高廉', difficulty: 5 }
    ],
    elite: [
      { type: '童貫', difficulty: 6 },
      { type: '蔡京', difficulty: 6 }
    ],
    boss: [
      { type: '高俅', difficulty: 8 }
    ]
  }
}

// アイテムの種類
const itemTypes = [
  '武器庫',
  '秘伝書',
  '宝物庫',
  '道具箱'
]

// マップ生成のための設定
const MAP_CONFIG = {
  LEVELS_PER_STAGE: 8, // ステージあたりの階層数を8に増やす
  NODES_PER_LEVEL: 3,
  NODE_SPACING: {
    X: 120,
    Y: 80  // Y軸の間隔を少し縮めて全体を表示しやすくする
  },
  PROBABILITIES: {
    early: { // 序盤（1-3層）
      enemy: 0.4,
      item: 0.2,
      rest: 0.15,
      shop: 0.25,
      elite: 0
    },
    mid: { // 中盤（4-6層）
      enemy: 0.35,
      item: 0.2,
      rest: 0.15,
      shop: 0.2,
      elite: 0.1
    },
    late: { // 終盤（7-8層）
      enemy: 0.3,
      item: 0.15,
      rest: 0.15,
      shop: 0.2,
      elite: 0.2
    }
  }
}

// ランダムな要素を配列から選択
const randomChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 指定された確率に基づいてノードタイプを選択
const selectNodeType = (level: number, totalLevels: number): NodeType => {
  const rand = Math.random()
  let probs

  if (level <= totalLevels * 0.3) probs = MAP_CONFIG.PROBABILITIES.early
  else if (level <= totalLevels * 0.6) probs = MAP_CONFIG.PROBABILITIES.mid
  else probs = MAP_CONFIG.PROBABILITIES.late

  let threshold = 0

  threshold += probs.enemy
  if (rand < threshold) return 'enemy'

  threshold += probs.item
  if (rand < threshold) return 'item'

  threshold += probs.rest
  if (rand < threshold) return 'rest'

  threshold += probs.shop
  if (rand < threshold) return 'shop'

  return 'elite'
}

// 敵の種類を選択
const selectEnemyType = (level: number, stageNumber: number): string => {
  const stage = `stage${stageNumber}` as keyof typeof enemyPool
  const pool = enemyPool[stage]
  
  if (level <= 2) return randomChoice(pool.early).type
  return randomChoice(pool.elite).type
}

// 指定されたステージのマップを生成
export const generateMap = (stageNumber: number): MapLevel => {
  const nodes: MapNode[] = []
  const levels: MapNode[][] = []

  // スタートノードの生成（中央に配置）
  const startNode: MapNode = {
    id: `stage${stageNumber}_start`,
    type: 'empty',
    x: MAP_CONFIG.NODE_SPACING.X * 1.5,
    y: 0,
    connections: [],
    level: 0
  }
  nodes.push(startNode)
  levels[0] = [startNode]

  // 中間レベルのノード生成
  for (let level = 1; level < MAP_CONFIG.LEVELS_PER_STAGE - 1; level++) {
    const levelNodes: MapNode[] = []
    const nodesCount = Math.min(3, Math.max(2, Math.floor(Math.random() * 3) + 1))

    for (let i = 0; i < nodesCount; i++) {
      const type = selectNodeType(level, MAP_CONFIG.LEVELS_PER_STAGE)
      const node: MapNode = {
        id: `stage${stageNumber}_node_${level}_${i}`,
        type,
        x: MAP_CONFIG.NODE_SPACING.X * (i - (nodesCount - 1) / 2 + 1.5),
        y: level * MAP_CONFIG.NODE_SPACING.Y,
        connections: [],
        level,
        enemyType: type === 'enemy' || type === 'elite' ? selectEnemyType(level, stageNumber) : undefined,
        itemType: type === 'item' ? randomChoice(itemTypes) : undefined
      }
      nodes.push(node)
      levelNodes.push(node)
    }
    levels[level] = levelNodes
  }

  // ボスノードの生成（中央に配置）
  const stage = `stage${stageNumber}` as keyof typeof enemyPool
  const bossNode: MapNode = {
    id: `stage${stageNumber}_boss`,
    type: 'boss',
    x: MAP_CONFIG.NODE_SPACING.X * 1.5,
    y: (MAP_CONFIG.LEVELS_PER_STAGE - 1) * MAP_CONFIG.NODE_SPACING.Y,
    connections: [],
    enemyType: randomChoice(enemyPool[stage].boss).type,
    level: MAP_CONFIG.LEVELS_PER_STAGE - 1
  }
  nodes.push(bossNode)
  levels[MAP_CONFIG.LEVELS_PER_STAGE - 1] = [bossNode]

  // ノード間の接続を生成
  for (let level = 0; level < levels.length - 1; level++) {
    const currentLevelNodes = levels[level]
    const nextLevelNodes = levels[level + 1]

    currentLevelNodes.forEach(node => {
      // 各ノードから1-2個のランダムな接続を生成
      const connectionCount = Math.floor(Math.random() * 2) + 1
      const possibleConnections = [...nextLevelNodes]
      
      for (let i = 0; i < connectionCount && possibleConnections.length > 0; i++) {
        const targetIndex = Math.floor(Math.random() * possibleConnections.length)
        const targetNode = possibleConnections[targetIndex]
        node.connections.push(targetNode.id)
        possibleConnections.splice(targetIndex, 1)
      }
    })
  }

  return {
    nodes,
    startNodeId: startNode.id,
    bossNodeId: bossNode.id,
    stageNumber
  }
}

// 初期マップの生成（ステージ1から開始）
export const initialMap = generateMap(1)