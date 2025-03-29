import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { moveToNode } from '../store/slices/mapSlice'
import { MapNode as MapNodeType } from '../data/mapNodes'
import MapNode from './MapNode'
import MapConnection from './MapConnection'

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
  const minX = Math.min(...nodes.map((n: MapNodeType) => n.x))
  const maxX = Math.max(...nodes.map((n: MapNodeType) => n.x))
  const minY = Math.min(...nodes.map((n: MapNodeType) => n.y))
  const maxY = Math.max(...nodes.map((n: MapNodeType) => n.y))
  
  // SVG座標系のパラメータ
  const nodeSize = 40 // ノードサイズを小さく
  const padding = 20 // パディングも小さく
  
  // マップ全体のサイズを計算（ノードサイズを考慮）
  const mapWidth = maxX - minX
  const mapHeight = maxY - minY
  const width = Math.min(1024, (mapWidth + 1) * nodeSize + padding * 2)
  const height = Math.min(768, (mapHeight + 1) * nodeSize + padding * 2)
  
  // スケール係数を計算（画面に収まるように）
  const scaleX = (width - padding * 2) / mapWidth
  const scaleY = (height - padding * 2) / mapHeight
  const scale = Math.min(scaleX, scaleY, nodeSize) // nodeSize以上にスケールしない

  // ノードの位置を計算する関数
  const getNodePosition = (x: number, y: number) => ({
    x: (x - minX) * scale + padding + nodeSize / 2,
    y: (y - minY) * scale + padding + nodeSize / 2
  })

  const handleNodeClick = (nodeId: string) => {
    if (availableNodes.includes(nodeId)) {
      dispatch(moveToNode(nodeId))
    }
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
          {nodes.map((node) => 
            node.connections.map((targetId) => {
              const target = nodes.find((n) => n.id === targetId)
              if (!target) return null

              const start = getNodePosition(node.x, node.y)
              const end = getNodePosition(target.x, target.y)

              return (
                <MapConnection
                  key={`${node.id}-${targetId}`}
                  start={start}
                  end={end}
                  nodeSize={nodeSize}
                  isCleared={clearedNodes.includes(node.id) && clearedNodes.includes(targetId)}
                  isAvailable={availableNodes.includes(targetId)}
                />
              )
            })
          )}

          {/* ノード */}
          {nodes.map((node) => {
            const position = getNodePosition(node.x, node.y)
            
            return (
              <MapNode
                key={node.id}
                node={node}
                position={position}
                nodeSize={nodeSize}
                currentNodeId={currentNodeId}
                clearedNodes={clearedNodes}
                availableNodes={availableNodes}
                onClick={handleNodeClick}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default Map