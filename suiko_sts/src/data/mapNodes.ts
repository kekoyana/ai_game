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
}

// 敵の種類とその出現階層
const enemyPool = {
  early: [ // 序盤（レベル1-3）
    { type: '山賊', difficulty: 1 },
    { type: '官兵', difficulty: 1 },
    { type: '密偵', difficulty: 2 },
    { type: '脱獄囚', difficulty: 2 }
  ],
  mid: [ // 中盤（レベル4-6）
    { type: '賊将', difficulty: 3 },
    { type: '武芸者', difficulty: 3 },
    { type: '流れ者', difficulty: 3 },
    { type: '山賊頭', difficulty: 4 }
  ],
  late: [ // 終盤（レベル7-9）
    { type: '軍師', difficulty: 4 },
    { type: '将軍', difficulty: 5 },
    { type: '侠客', difficulty: 5 }
  ],
  elite: [ // エリート敵
    { type: '高級官兵', difficulty: 6 },
    { type: '辺境の将', difficulty: 7 },
    { type: '朝廷の刺客', difficulty: 8 }
  ],
  boss: [ // ボス
    { type: '高俅', difficulty: 10 }
  ]
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
  TOTAL_LEVELS: 12,
  NODES_PER_LEVEL: 3,
  NODE_SPACING: {
    X: 120,
    Y: 100
  },
  PROBABILITIES: {
    early: {
      enemy: 0.4,
      item: 0.2,
      rest: 0.15,
      shop: 0.25,
      elite: 0
    },
    mid: {
      enemy: 0.35,
      item: 0.2,
      rest: 0.15,
      shop: 0.2,
      elite: 0.1
    },
    late: {
      enemy: 0.3,
      item: 0.15,
      rest: 0.15,
      shop: 0.2,
      elite: 0.2
    },
    final: {
      enemy: 0.25,
      item: 0.15,
      rest: 0.15,
      shop: 0.2,
      elite: 0.25
    }
  }
}

// ランダムな要素を配列から選択
const randomChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 指定された確率に基づいてノードタイプを選択
const selectNodeType = (level: number): NodeType => {
  const rand = Math.random()
  let probs

  if (level <= 3) probs = MAP_CONFIG.PROBABILITIES.early
  else if (level <= 6) probs = MAP_CONFIG.PROBABILITIES.mid
  else if (level <= 9) probs = MAP_CONFIG.PROBABILITIES.late
  else probs = MAP_CONFIG.PROBABILITIES.final

  let threshold = 0

  // 戦闘
  threshold += probs.enemy
  if (rand < threshold) return 'enemy'

  // アイテム
  threshold += probs.item
  if (rand < threshold) return 'item'

  // 休憩所
  threshold += probs.rest
  if (rand < threshold) return 'rest'

  // ショップ
  threshold += probs.shop
  if (rand < threshold) return 'shop'

  // エリート（残りの確率）
  return 'elite'
}

// 敵の種類を選択
const selectEnemyType = (level: number): string => {
  if (level <= 3) return randomChoice(enemyPool.early).type
  else if (level <= 6) return randomChoice(enemyPool.mid).type
  else if (level <= 9) return randomChoice(enemyPool.late).type
  else return randomChoice(enemyPool.elite).type
}

// マップのランダム生成
export const generateMap = (): MapLevel => {
  const nodes: MapNode[] = []
  const levels: MapNode[][] = []

  // スタートノードの生成（中央に配置）
  const startNode: MapNode = {
    id: 'start',
    type: 'empty',
    x: MAP_CONFIG.NODE_SPACING.X * 1.5,
    y: 0,
    connections: []
  }
  nodes.push(startNode)
  levels[0] = [startNode]

  // 中間レベルのノード生成
  for (let level = 1; level < MAP_CONFIG.TOTAL_LEVELS - 1; level++) {
    const levelNodes: MapNode[] = []
    const nodesCount = Math.min(3, Math.max(2, Math.floor(Math.random() * 3) + 1))

    for (let i = 0; i < nodesCount; i++) {
      const type = selectNodeType(level)
      const node: MapNode = {
        id: `node_${level}_${i}`,
        type,
        x: MAP_CONFIG.NODE_SPACING.X * (i - (nodesCount - 1) / 2 + 1.5),
        y: level * MAP_CONFIG.NODE_SPACING.Y,
        connections: [],
        level,
        enemyType: type === 'enemy' || type === 'elite' ? selectEnemyType(level) : undefined,
        itemType: type === 'item' ? randomChoice(itemTypes) : undefined
      }
      nodes.push(node)
      levelNodes.push(node)
    }
    levels[level] = levelNodes
  }

  // ボスノードの生成（中央に配置）
  const bossNode: MapNode = {
    id: 'boss',
    type: 'boss',
    x: MAP_CONFIG.NODE_SPACING.X * 1.5,
    y: (MAP_CONFIG.TOTAL_LEVELS - 1) * MAP_CONFIG.NODE_SPACING.Y,
    connections: [],
    enemyType: randomChoice(enemyPool.boss).type
  }
  nodes.push(bossNode)
  levels[MAP_CONFIG.TOTAL_LEVELS - 1] = [bossNode]

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
    bossNodeId: bossNode.id
  }
}

// 初期マップの生成
export const initialMap = generateMap()