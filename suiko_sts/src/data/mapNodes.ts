export type NodeType = 'enemy' | 'elite' | 'boss' | 'item' | 'rest'

export interface MapNode {
  id: string
  type: NodeType
  x: number
  y: number
  connections: string[] // 接続されているノードのID
  visited?: boolean
  cleared?: boolean
  enemyType?: string // 敵の種類（敵ノードの場合）
  itemType?: string  // アイテムの種類（アイテムノードの場合）
}

export interface MapLevel {
  nodes: MapNode[]
  startNodeId: string
  bossNodeId: string
}

// 例：最初のマップ
export const initialMap: MapLevel = {
  startNodeId: 'start',
  bossNodeId: 'boss',
  nodes: [
    {
      id: 'start',
      type: 'rest',
      x: 0,
      y: 0,
      connections: ['enemy1', 'item1'],
    },
    {
      id: 'enemy1',
      type: 'enemy',
      x: 1,
      y: -1,
      connections: ['elite1', 'enemy2'],
      enemyType: '山賊'
    },
    {
      id: 'item1',
      type: 'item',
      x: 1,
      y: 1,
      connections: ['enemy2', 'enemy3'],
      itemType: '武器庫'
    },
    {
      id: 'enemy2',
      type: 'enemy',
      x: 2,
      y: 0,
      connections: ['elite1', 'rest1'],
      enemyType: '官兵'
    },
    {
      id: 'enemy3',
      type: 'enemy',
      x: 2,
      y: 2,
      connections: ['rest1'],
      enemyType: '山賊'
    },
    {
      id: 'elite1',
      type: 'elite',
      x: 3,
      y: -1,
      connections: ['rest1'],
      enemyType: '高級官兵'
    },
    {
      id: 'rest1',
      type: 'rest',
      x: 3,
      y: 1,
      connections: ['boss']
    },
    {
      id: 'boss',
      type: 'boss',
      x: 4,
      y: 0,
      connections: [],
      enemyType: '高俅'
    }
  ]
}