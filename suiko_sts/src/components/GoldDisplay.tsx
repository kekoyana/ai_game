import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

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

  return (
    <div className="fixed top-4 right-4 bg-gray-900/80 p-2 rounded-lg border border-yellow-700 
                    flex items-center gap-2">
      {/* 所持金表示 */}
      <div className="flex items-center">
        <span className="text-yellow-500 text-2xl mr-1">💰</span>
        <span className="text-yellow-100 font-bold">{amount}</span>
      </div>

      {/* 増減表示のアニメーション */}
      <AnimatePresence>
        {showChange && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0 }}
            className={`absolute -top-2 right-0 font-bold text-lg
                      ${changeAmount > 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            {changeAmount > 0 ? `+${changeAmount}` : changeAmount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ツールチップ */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 
                    transition-opacity bg-black/80 text-white text-sm px-2 py-1 rounded">
        所持金
      </div>
    </div>
  )
}

export default GoldDisplay