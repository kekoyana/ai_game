import { motion } from 'framer-motion'

interface CardProps {
  id: string
  name: string
  cost: number
  description: string
  type: 'attack' | 'skill' | 'power'
  character: string
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

export const Card = ({ name, cost, description, type, character, flavorText, onClick }: CardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      className="game-card w-48 h-72"
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
    </motion.div>
  )
}

export default Card