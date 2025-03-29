import { MapNode as MapNodeType } from '../data/mapNodes'
import { getNodeIcon, getNodeColor, getNodeDescription } from './MapUtils'

interface MapNodeProps {
  node: MapNodeType
  position: { x: number; y: number }
  nodeSize: number
  currentNodeId: string
  clearedNodes: string[]
  availableNodes: string[]
  onClick: (nodeId: string) => void
}

const MapNode = ({
  node,
  position,
  nodeSize,
  currentNodeId,
  clearedNodes,
  availableNodes,
  onClick
}: MapNodeProps) => {
  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={() => onClick(node.id)}
      className="cursor-pointer"
    >
      {/* ノードの背景 */}
      <foreignObject
        width={nodeSize}
        height={nodeSize}
        className="overflow-visible"
      >
        <div
          className={`w-full h-full rounded-full flex items-center justify-center
                     transition-all duration-200 transform hover:scale-110
                     shadow-lg ${getNodeColor(node.id, currentNodeId, clearedNodes, availableNodes, node.type, node.level)}`}
          dangerouslySetInnerHTML={getNodeIcon(node.type, node.level)}
>
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
          <div className="font-bold">{getNodeDescription(node)}</div>
          {node.level && node.level > 0 && (
            <div className="text-xs text-gray-400">
              レベル {node.level}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  )
}

export default MapNode