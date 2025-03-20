import { useState, useEffect } from 'react'
import { Relic, generateRandomRelic } from '../data/relics'
import './CardReward.css' // 同じスタイルを使用

interface RelicRewardProps {
  onSelectRelic: (relic: Relic) => void
  onSkip: () => void
}

const RelicReward = ({ onSelectRelic, onSkip }: RelicRewardProps) => {
  const [relic, setRelic] = useState<Relic | null>(null)

  // ランダムなレリックを生成
  useEffect(() => {
    const randomRelic = generateRandomRelic()
    setRelic(randomRelic)
  }, [])

  if (!relic) return null

  return (
    <div className="reward-overlay">
      <div className="reward-container">
        <h2 className="reward-header">
          お宝を獲得！
        </h2>

        <div className="relic-display p-6 bg-gray-800/50 rounded-lg border border-yellow-900/30
                      hover:border-yellow-500/50 transition-all cursor-pointer
                      flex flex-col items-center gap-4"
             onClick={() => onSelectRelic(relic)}>
          <div className="text-6xl">
            {relic.image}
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-300 mb-2">
              {relic.name}
            </div>
            <div className="text-gray-300">
              {relic.description}
            </div>
            <div className={`text-sm mt-2 ${
              relic.rarity === 'rare' ? 'text-purple-400' :
              relic.rarity === 'uncommon' ? 'text-blue-400' :
              'text-gray-400'
            }`}>
              {relic.rarity === 'rare' ? 'レア' :
               relic.rarity === 'uncommon' ? 'アンコモン' :
               'コモン'}
            </div>
          </div>
        </div>

        <button
          onClick={onSkip}
          className="skip-button"
        >
          スキップ
        </button>
      </div>
    </div>
  )
}

export default RelicReward