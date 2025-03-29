import './CharacterStats.css'

interface CharacterStatsProps { 
  character: {
    name: string
    currentHp: number
    maxHp: number
    block: number
    strength?: number
    weaken?: number
    heavyArmor?: number
    description?: string
  } | null
  isEnemy?: boolean
  enemyAction?: {
    type: 'attack' | 'defend' | 'buff'
    value: number
    description: string
  }
}

const CharacterStats = ({ character, isEnemy = false, enemyAction }: CharacterStatsProps) => {
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

{character.strength !== undefined && character.strength > 0 && (
  <span className="stats-strength" title="攻撃力">
    <span className="status-icon">⚔️</span>
    {character.strength}
  </span>
)}
{character.weaken !== undefined && character.weaken > 0 && (
  <span className="stats-weaken" title="弱体化 (防御力-25%)">
    <span className="status-icon">💫</span>
    {character.weaken}
  </span>
)}

{character.heavyArmor !== undefined && character.heavyArmor > 0 && (
  <span className="stats-heavy-armor" title="重装備 (ターン終了時にブロック獲得)">
    <span className="status-icon">️🏯</span>
    {character.heavyArmor}
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
        {isEnemy && enemyAction && (
          <div className="enemy-action">
            <div className="text-sm">
              <span className="enemy-action-label">敵の行動: </span>
              <span className="enemy-action-description">{enemyAction.description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CharacterStats