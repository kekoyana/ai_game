import { motion } from 'framer-motion'
import { CardRarity } from '../data/cards'

interface CardProps {
  id: string
  name: string
  cost: number
  description: string
  type: 'attack' | 'skill' | 'power'
  character: string
  rarity: CardRarity
  flavorText?: string
  onClick?: () => void
}

const getTypeColor = (type: CardProps['type']) => {
  switch (type) {
    case 'attack':
      return 'from-red-800 to-red-950'
    case 'skill':
      return 'from-emerald-800 to-emerald-950'
    case 'power':
      return 'from-blue-800 to-blue-950'
  }
}

const getTypeIcon = (type: CardProps['type']) => {
  switch (type) {
    case 'attack':
      return '⚔️'
    case 'skill':
      return '🛡️'
    case 'power':
      return '⚡'
  }
}

const getRarityStyles = (rarity: CardRarity) => {
  switch (rarity) {
    case 'SSR':
      return {
        border: 'border-2 border-rose-500',
        glow: 'shadow-lg shadow-rose-500/50',
        gradient: 'bg-gradient-to-br from-rose-400/20 to-yellow-400/20',
        animation: 'animate-pulse'
      }
    case 'SR':
      return {
        border: 'border-2 border-purple-500',
        glow: 'shadow-lg shadow-purple-500/50',
        gradient: 'bg-gradient-to-br from-purple-400/20 to-pink-400/20',
        animation: ''
      }
    case 'R':
      return {
        border: 'border-2 border-blue-500',
        glow: 'shadow-lg shadow-blue-500/30',
        gradient: 'bg-gradient-to-br from-blue-400/10 to-cyan-400/10',
        animation: ''
      }
    case 'C':
      return {
        border: 'border-2 border-gray-600',
        glow: 'shadow-lg shadow-gray-800/30',
        gradient: '',
        animation: ''
      }
  }
}

export const Card = ({ 
  name, 
  cost, 
  description, 
  type, 
  character, 
  rarity,
  flavorText, 
  onClick 
}: CardProps) => {
  const rarityStyles = getRarityStyles(rarity)

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      className={`game-card w-48 h-72 relative ${rarityStyles.border} 
                 ${rarityStyles.glow} ${rarityStyles.gradient} ${rarityStyles.animation}
                 overflow-hidden`}
      onClick={onClick}
    >
      {/* カードの背景グラデーション */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getTypeColor(type)} opacity-50`} />

      {/* 装飾的な背景パターン */}
      <div className="absolute inset-0 opacity-10 bg-repeat"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 10h10v10H10V10zM0 10h10v10H0V10z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`
           }} />

      {/* コスト */}
      <div className="card-cost">
        {cost}
      </div>

      {/* カードタイプアイコン */}
      <div className="card-type-icon">
        {getTypeIcon(type)}
      </div>

      {/* カード名 */}
      <div className="card-name">
        {name}
      </div>

      {/* キャラクター名 */}
      <div className="card-character">
        {character}
      </div>

      {/* 説明文 */}
      <div className="card-description">
        {description}
      </div>

      {/* フレーバーテキスト */}
      {flavorText && (
        <div className="card-flavor">
          {flavorText}
        </div>
      )}

      {/* レア度表示 (左下) */}
      <div className={`absolute bottom-2 left-2 text-sm font-bold
                    ${rarity === 'SSR' ? 'text-rose-400' :
                      rarity === 'SR' ? 'text-purple-400' :
                      rarity === 'R' ? 'text-blue-400' :
                      'text-gray-400'}`}>
        {rarity}
      </div>
    </motion.div>
  )
}

export default Card