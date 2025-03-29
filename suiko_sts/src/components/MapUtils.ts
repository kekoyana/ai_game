import { NodeType } from '../data/mapNodes'
import mapIconUrl from '../assets/map_icon.png'

// アイコンのスプライト位置を取得する関数
const getIconPosition = (type: NodeType, level?: number): { x: number; y: number } => {
  switch (type) {
    case 'rest':
      return { x: 0, y: 0 } // 宿屋
    case 'shop':
      return { x: 1, y: 0 } // お店
    case 'enemy':
      return level && level > 6 ? { x: 2, y: 1 } : { x: 2, y: 0 } // レベルが6より上はエリート敵、それ以外は弱い敵
    case 'boss':
      return { x: 0, y: 1 } // 大ボス
    case 'elite':
      return { x: 2, y: 1 } // エリート敵
    case 'item':
      return { x: 2, y: 2 } // プレゼント
    case 'empty':
      return { x: 0, y: 2 } // 何も無い
    default:
      return { x: 1, y: 1 } // イベント
  }
}

export const getNodeIcon = (type: NodeType, level?: number) => {
  const { x, y } = getIconPosition(type, level)
  const iconSize = 32 // アイコンの1つのサイズ（ピクセル）
  
  const iconStyle = `
    display: inline-block;
    width: ${iconSize}px;
    height: ${iconSize}px;
    background-image: url(${mapIconUrl});
    background-position: -${x * iconSize}px -${y * iconSize}px;
    background-size: ${iconSize * 3}px ${iconSize * 3}px;
    image-rendering: pixelated;
  `
  
  return {
    __html: `<div style="${iconStyle}"></div>`
  }
}

export const getNodeColor = (
  nodeId: string,
  currentNodeId: string,
  clearedNodes: string[],
  availableNodes: string[],
  type: NodeType,
  level?: number
) => {
  if (nodeId === currentNodeId) return 'ring-4 ring-yellow-400 bg-yellow-700'
  if (clearedNodes.includes(nodeId)) return 'bg-green-700'
  if (availableNodes.includes(nodeId)) {
    if (type === 'boss') return 'bg-red-600 animate-pulse'
    if (type === 'elite') return 'bg-purple-600 animate-pulse'
    if (level && level > 6) return 'bg-orange-600 animate-pulse'
    return 'bg-blue-600 animate-pulse'
  }
  
  switch (type) {
    case 'boss':
      return 'bg-red-900/50'
    case 'elite':
      return 'bg-purple-900/50'
    case 'enemy':
      return level && level > 6 ? 'bg-orange-900/50' : 'bg-gray-700/50'
    default:
      return 'bg-gray-700/50'
  }
}

export const getNodeDescription = (node: { type: NodeType; enemyType?: string; itemType?: string; level?: number }) => {
  if (node.type === 'empty') return 'スタート地点'
  if (node.type === 'enemy') return `敵: ${node.enemyType}`
  if (node.type === 'elite') return `強敵: ${node.enemyType}`
  if (node.type === 'boss') return `ボス: ${node.enemyType}`
  if (node.type === 'item') return `アイテム: ${node.itemType}`
  if (node.type === 'rest') return '休憩所'
  return ''
}