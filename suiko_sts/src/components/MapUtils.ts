import { NodeType } from '../data/mapNodes'

export const getNodeIcon = (type: NodeType, level?: number) => {
  switch (type) {
    case 'enemy':
      return level && level > 6 ? '👹' : '👿'
    case 'elite':
      return '💀'
    case 'boss':
      return '🐲'
    case 'item':
      return '🎁'
    case 'rest':
      return '🏠'
    case 'empty':
      return '⭐'
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