import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { moveToNode } from '../store/slices/mapSlice'
import { NodeType, MapNode } from '../data/mapNodes'

const getNodeIcon = (type: NodeType, level?: number) => {
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

const getNodeColor = (
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

const Map = () => {
  const dispatch = useDispatch()
  const mapState = useSelector((state: RootState) => state.map)
  const {
    currentMap,
    currentNodeId,
    clearedNodes,
    availableNodes
  } = mapState

  // マップの寸法を計算
  const nodes = currentMap.nodes
  const minX = Math.min(...nodes.map((n: MapNode) => n.x))
  const maxX = Math.max(...nodes.map((n: MapNode) => n.x))
  const minY = Math.min(...nodes.map((n: MapNode) => n.y))
  const maxY = Math.max(...nodes.map((n: MapNode) => n.y))
  
  // SVG座標系のパラメータ
  const nodeSize = 40 // ノードサイズを小さく
  const padding = 20 // パディングも小さく
  
  // マップ全体のサイズを計算
  const width = Math.min(1024, maxX - minX + nodeSize + padding * 2)
  const height = Math.min(768, maxY - minY + nodeSize + padding * 2)
  
  // スケール係数を計算（画面に収まるように）
  const scaleX = (width - padding * 2) / (maxX - minX + nodeSize)
  const scaleY = (height - padding * 2) / (maxY - minY + nodeSize)
  const scale = Math.min(scaleX, scaleY)

  // ノードの位置を計算する関数
  const getNodePosition = (x: number, y: number) => ({
    x: (x - minX) * scale + padding,
    y: (y - minY) * scale + padding
  })

  const handleNodeClick = (nodeId: string) => {
    if (availableNodes.includes(nodeId)) {
      dispatch(moveToNode(nodeId))
    }
  }

  // ノードの説明文を生成
  const getNodeDescription = (node: MapNode) => {
    if (node.type === 'empty') return 'スタート地点'
    if (node.type === 'enemy') return `敵: ${node.enemyType}`
    if (node.type === 'elite') return `強敵: ${node.enemyType}`
    if (node.type === 'boss') return `ボス: ${node.enemyType}`
    if (node.type === 'item') return `アイテム: ${node.itemType}`
    if (node.type === 'rest') return '休憩所'
    return ''
  }

  return (
    <div className="w-full flex justify-center">
      <div className="relative overflow-hidden rounded-lg">
        <svg
          width={width}
          height={height}
          className="bg-gray-900"
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* 接続線 */}
          {nodes.map((node: MapNode) => 
            node.connections.map((targetId: string) => {
              const target = nodes.find((n: MapNode) => n.id === targetId)
              if (!target) return null

              const start = getNodePosition(node.x, node.y)
              const end = getNodePosition(target.x, target.y)

              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={start.x + nodeSize/2}
                  y1={start.y + nodeSize/2}
                  x2={end.x + nodeSize/2}
                  y2={end.y + nodeSize/2}
                  stroke={
                    clearedNodes.includes(node.id) && clearedNodes.includes(targetId)
                      ? '#22c55e'
                      : availableNodes.includes(targetId)
                      ? '#3b82f6'
                      : '#374151'
                  }
                  strokeWidth={2}
                />
              )
            })
          )}

          {/* ノード */}
          {nodes.map((node: MapNode) => {
            const pos = getNodePosition(node.x, node.y)
            const description = getNodeDescription(node)
            
            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => handleNodeClick(node.id)}
                className="cursor-pointer"
              >
                {/* ノードの背景 */}
                <foreignObject
                  width={nodeSize}
                  height={nodeSize}
                  className="overflow-visible"
                >
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center text-xl
                               transition-all duration-200 transform hover:scale-110
                               shadow-lg ${getNodeColor(node.id, currentNodeId, clearedNodes, availableNodes, node.type, node.level)}`}
                  >
                    {getNodeIcon(node.type, node.level)}
                  </div>
                </foreignObject>

                {/* ノードの説明（ホバー時に表示） */}
                <foreignObject
                  x={-80}
                  y={nodeSize}
                  width={200}
                  height={60}
                  className="pointer-events-none"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity
                                bg-black/80 text-white p-2 rounded text-center text-xs">
                    <div className="font-bold">{description}</div>
                    {node.level && node.level > 0 && (
                      <div className="text-xs text-gray-400">
                        レベル {node.level}
                      </div>
                    )}
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default Map