interface MapConnectionProps {
  start: { x: number; y: number }
  end: { x: number; y: number }
  nodeSize: number
  isCleared: boolean
  isAvailable: boolean
}

const MapConnection = ({ start, end, nodeSize, isCleared, isAvailable }: MapConnectionProps) => {
  return (
    <line
      x1={start.x + nodeSize/2}
      y1={start.y + nodeSize/2}
      x2={end.x + nodeSize/2}
      y2={end.y + nodeSize/2}
      stroke={
        isCleared
          ? '#22c55e'
          : isAvailable
          ? '#3b82f6'
          : '#374151'
      }
      strokeWidth={2}
    />
  )
}

export default MapConnection