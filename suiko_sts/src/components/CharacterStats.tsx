import './CharacterStats.css'

interface CharacterStatsProps { 
  character: { 
    name: string
    currentHp: number
    maxHp: number
    block: number
    strength?: number
    description?: string
  } | null
  isEnemy?: boolean
  nextMove?: {
    type: 'attack' | 'defend' | 'buff'
    value: number
    description: string
  }
}

const CharacterStats = ({ character, isEnemy = false, nextMove }: CharacterStatsProps) => {
  if (!character) return null
  
  return (
    <div className={`stats-container ${isEnemy ? 'stats-container-enemy' : ''}`}>
      <div className="space-y-2">
        {/* 名前 */}
        <div className="stats-name">
          {character.name}
        </div>

        {/* ステータス値 */}
        <div className="stats-values">
          <span className="stats-hp" title="HP">
            <span className="status-icon">❤️</span>
            {character.currentHp}/{character.maxHp}
          </span>

          {character.block > 0 && (
            <span className="stats-block" title="ブロック">
              <span className="status-icon">🛡️</span>
              {character.block}
            </span>
          )}

          {isEnemy && character.strength !== undefined && character.strength > 0 && (
            <span className="stats-strength" title="攻撃力">
              <span className="status-icon">⚔️</span>
              {character.strength}
            </span>
          )}
        </div>

        {/* 説明文 */}
        {character.description && (
          <div className="stats-description">
            {character.description}
          </div>
        )}

        {/* 敵の行動 */}
        {isEnemy && nextMove && (
          <div className="next-move">
            <div className="text-sm">
              <span className="next-move-label">敵の行動: </span>
              <span className="next-move-description">{nextMove.description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CharacterStats