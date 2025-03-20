import { useEffect, useState } from 'react'
import './EnergyDisplay.css'

interface EnergyDisplayProps {
  current: number
  max: number
}

const EnergyDisplay = ({ current, max }: EnergyDisplayProps) => {
  const [prevEnergy, setPrevEnergy] = useState(current)
  const [showChange, setShowChange] = useState(false)
  const [isIncrease, setIsIncrease] = useState(false)

  useEffect(() => {
    if (current !== prevEnergy) {
      setIsIncrease(current > prevEnergy)
      setShowChange(true)
      setPrevEnergy(current)

      const timer = setTimeout(() => {
        setShowChange(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [current, prevEnergy])

  return (
    <div className="energy-crystal group">
      {/* 輝き効果 */}
      <div className="energy-glow" />

      {/* クリスタル本体 */}
      <div className={`energy-body ${showChange ? 
        isIncrease ? 'energy-increase' : 'energy-decrease' : ''}`}>
        {current}/{max}
      </div>

      {/* ツールチップ */}
      <div className="energy-tooltip">
        エネルギー: {current}/{max}
      </div>
    </div>
  )
}

export default EnergyDisplay