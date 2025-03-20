import { useState, useEffect } from 'react'
import './GoldDisplay.css'

interface GoldDisplayProps {
  amount: number
}

const GoldDisplay = ({ amount }: GoldDisplayProps) => {
  const [prevAmount, setPrevAmount] = useState(amount)
  const [showChange, setShowChange] = useState(false)
  const [changeAmount, setChangeAmount] = useState(0)

  useEffect(() => {
    if (amount !== prevAmount) {
      const diff = amount - prevAmount
      setChangeAmount(diff)
      setShowChange(true)
      setPrevAmount(amount)

      // アニメーション終了後に非表示
      const timer = setTimeout(() => {
        setShowChange(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [amount, prevAmount])

  const formatGold = (value: number) => {
    return new Intl.NumberFormat().format(value)
  }

  return (
    <div className="gold-container group">
      {/* メインの表示 */}
      <div className="gold-display">
        <span className="gold-icon">💰</span>
        <span className="gold-amount">{formatGold(amount)}</span>
      </div>

      {/* 金額変動表示 */}
      {showChange && (
        <div
          className={`gold-change animate-float-up
                    ${changeAmount > 0 ? 'gold-increase' : 'gold-decrease'}`}
        >
          {changeAmount > 0 ? `+${formatGold(changeAmount)}` : formatGold(changeAmount)}
        </div>
      )}

      {/* ツールチップ */}
      <div className="gold-tooltip">
        所持金: {formatGold(amount)} G
      </div>
    </div>
  )
}

export default GoldDisplay