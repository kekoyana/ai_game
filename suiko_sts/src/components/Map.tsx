import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { moveToNode } from '../store/slices/mapSlice'
import { NodeType, MapNode } from '../data/mapNodes'

const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case 'enemy':
      return '👿'
    case 'elite':
      return '👹'
    case 'boss':
      return '🐉'
    case 'item':
      return '🎁'
    case 'rest':
      return '🏠'
  }
}

const getNodeColor = (
  nodeId: string,
  currentNodeId: string,
  clearedNodes: string[],
  availableNodes: string[]
) => {
  if (nodeId === currentNodeId) return 'ring-4 ring-yellow-400 bg-yellow-700'
  if (clearedNodes.includes(nodeId)) return 'bg-green-700'
  if (availableNodes.includes(nodeId)) return 'bg-blue-600 animate-pulse'
  return 'bg-gray-700'
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
  
  // SVG座標系に変換するための関数
  const nodeSize = 60
  const padding = 40
  const width = (maxX - minX + 1) * (nodeSize + padding)
  const height = (maxY - minY + 1) * (nodeSize + padding)
  
  const getNodePosition = (x: number, y: number) => ({
    x: (x - minX) * (nodeSize + padding) + nodeSize / 2 + padding,
    y: (y - minY) * (nodeSize + padding) + nodeSize / 2 + padding
  })

  const handleNodeClick = (nodeId: string) => {
    if (availableNodes.includes(nodeId)) {
      dispatch(moveToNode(nodeId))
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={width + padding * 2}
        height={height + padding * 2}
        className="bg-gray-900 rounded-lg"
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
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={
                  clearedNodes.includes(node.id) && clearedNodes.includes(targetId)
                    ? '#22c55e' // 緑色（クリア済み）
                    : availableNodes.includes(targetId)
                    ? '#3b82f6' // 青色（移動可能）
                    : '#374151' // グレー（通常）
                }
                strokeWidth={3}
              />
            )
          })
        )}

        {/* ノード */}
        {nodes.map((node: MapNode) => {
          const pos = getNodePosition(node.x, node.y)
          return (
            <g
              key={node.id}
              transform={`translate(${pos.x - nodeSize/2}, ${pos.y - nodeSize/2})`}
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
                  className={`w-full h-full rounded-full flex items-center justify-center text-2xl
                             transition-all duration-200 transform hover:scale-110
                             shadow-lg ${getNodeColor(node.id, currentNodeId, clearedNodes, availableNodes)}`}
                >
                  {getNodeIcon(node.type)}
                </div>
              </foreignObject>

              {/* ノードの説明（ホバー時に表示） */}
              <foreignObject
                x={-100}
                y={nodeSize}
                width={260}
                height={100}
                className="pointer-events-none"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity
                              bg-black/80 text-white p-2 rounded text-center text-sm">
                  {node.enemyType || node.itemType || 
                   (node.type === 'rest' ? '休憩所' : '')}
                </div>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default Map