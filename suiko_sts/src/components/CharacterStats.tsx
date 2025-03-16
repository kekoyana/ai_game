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
  if (!character) return null;
  
  return (
    <div className={`character-stats ${isEnemy ? 'flex-row-reverse' : ''} 
                    bg-gray-900/50 p-4 rounded-xl border border-yellow-900/30
                    backdrop-blur-sm`}>
      <div className="space-y-2">
        {/* 名前 */}
        <div className="text-2xl font-bold text-yellow-100">{character.name}</div>

        {/* ステータス */}
        <div className="flex items-center gap-3">
          <span className="text-red-400" title="HP">
            ❤️ {character.currentHp}/{character.maxHp}
          </span>
          {character.block > 0 && (
            <span className="text-blue-400" title="ブロック">
              🛡️ {character.block}
            </span>
          )}
          {isEnemy && character.strength !== undefined && character.strength > 0 && (
            <span className="text-orange-400" title="攻撃力">
              ⚔️ {character.strength}
            </span>
          )}
        </div>

        {/* 敵の説明 */}
        {character.description && (
          <div className="text-sm text-gray-400 italic">
            {character.description}
          </div>
        )}

        {/* 敵の次の行動 */}
        {isEnemy && nextMove && (
          <div className="mt-2 p-2 rounded bg-gray-800/50 border border-gray-700/50">
            <div className="text-sm">
              <span className="text-yellow-500">次の行動: </span>
              <span className="text-white">{nextMove.description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CharacterStats