import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { Card, createInitialDeck, shuffleDeck } from '../../data/cards'
import { Relic } from '../../data/relics'

export interface Character {
  id: string
  name: string
  maxHp: number
  currentHp: number
  block: number
  strength?: number
  weaken?: number
  goldReward?: number
  enemyAction?: {
    type: 'attack' | 'defend' | 'buff'
    value: number
    description: string
  }
}

interface GameState {
  player: Character
  enemy: Character | null
  hand: Card[]
  drawPile: Card[]
  discardPile: Card[]
  energy: {
    current: number
    max: number
  }
  gold: number
  isInBattle: boolean
  turnNumber: number
  deck: Card[]
  isGameCleared: boolean
  isGameOver: boolean
  canSpendGold: boolean
  relics: Relic[]
  goldMultiplier: number
  healingMultiplier: number
  activePowers: Card[] // 発動中のパワーカード
}

const initialState: GameState = {
  player: {
    id: 'player',
    name: '宋江',
    maxHp: 80,
    currentHp: 80,
    block: 0,
    strength: 0
  },
  enemy: null,
  hand: [],
  drawPile: [],
  discardPile: [],
  energy: {
    current: 3,
    max: 3
  },
  gold: 200,
  isInBattle: false,
  turnNumber: 0,
  deck: createInitialDeck(),
  isGameCleared: false,
  isGameOver: false,
  canSpendGold: false,
  relics: [],
  goldMultiplier: 1,
  healingMultiplier: 1,
  activePowers: []
}

const generateEnemyMove = (enemy: Character) => {
  const actions = [
    { 
      type: 'attack' as const, 
      value: 12 + (enemy.strength || 0), 
      description: `強襲 (${12 + (enemy.strength || 0)}ダメージ)`
    },
    { 
      type: 'defend' as const, 
      value: 8, 
      description: '防御態勢 (8ブロック)'
    },
    { 
      type: 'attack' as const, 
      value: 8 + (enemy.strength || 0), 
      description: `攻撃 (${8 + (enemy.strength || 0)}ダメージ)`
    }
  ]
  return actions[Math.floor(Math.random() * actions.length)]
}

export const gameSlice: Slice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startBattle: (state, action: PayloadAction<Character>) => {
      if (state.isGameOver) return
      
      const enemy = action.payload
      enemy.goldReward = enemy.strength === 5 ? 100 : 
                        enemy.strength === 3 ? 50 : 
                        25

      state.player.strength = 0
      state.enemy = enemy
      if (state.enemy) {
        const action = generateEnemyMove(state.enemy)
        state.enemy.enemyAction = action
        
        // 最初の行動が防御なら即座に適用
        if (action.type === 'defend') {
          state.enemy.block = action.value
        }
      }

      state.isInBattle = true
      state.energy.current = state.energy.max
      state.turnNumber = 1
      state.drawPile = shuffleDeck([...state.deck])
      state.hand = []
      state.discardPile = []
      state.activePowers = []

      state.relics.forEach((relic: Relic) => {
        if (relic.effect.type === 'strength') {
          state.player.strength = (state.player.strength || 0) + relic.effect.value
        }
      })

      const initialDraw = 5 + state.relics.reduce((bonus: number, relic: Relic) =>
        relic.effect.type === 'draw' ? bonus + relic.effect.value : bonus, 0
      )
      
      for (let i = 0; i < initialDraw; i++) {
        if (state.drawPile.length === 0) break
        const card = state.drawPile[0]
        state.hand.push(card)
        state.drawPile = state.drawPile.slice(1)
      }
    },

    endTurn: (state) => {
      if (state.isGameOver || !state.isInBattle) return

      if (state.enemy && state.enemy.enemyAction) {
        // 現在の行動を実行
        const currentAction = state.enemy.enemyAction
        if (currentAction.type === 'attack') {
          const incomingDamage = currentAction.value
            
          if (state.player.block > 0) {
            const blockedDamage = Math.min(state.player.block, incomingDamage)
            const remainingDamage = incomingDamage - blockedDamage
            if (remainingDamage > 0) {
              state.player.currentHp = Math.max(0, state.player.currentHp - remainingDamage)
            }
          } else {
            state.player.currentHp = Math.max(0, state.player.currentHp - incomingDamage)
          }
          
          if (state.player.currentHp === 0) {
            state.isGameOver = true
            state.isInBattle = false
          }
        }

        // 弱体化カウンターを減少（ターン終了時）
        if (state.enemy.weaken && state.enemy.weaken > 0) {
          state.enemy.weaken -= 1
        }

        // 既存のブロック値をリセット
        state.player.block = 0
        state.enemy.block = 0

        // 次のターンの行動を決定
        const nextAction = generateEnemyMove(state.enemy)
        state.enemy.enemyAction = nextAction

        // 次の行動が防御なら即座に適用（弱体化を考慮）
        if (nextAction.type === 'defend') {
          let blockValue = nextAction.value
          if (state.enemy.weaken && state.enemy.weaken > 0) {
            const reduction = Math.floor(blockValue * 0.25)
            blockValue -= reduction
          }
          state.enemy.block = blockValue
        }
      }

      // その他のターン終了時の処理
      state.turnNumber += 1
      state.energy.current = state.energy.max

      // アクティブなパワーカードの効果を適用
      state.activePowers.forEach((card: Card) => {
        if (card.effects) {
          // 覇王の威厳タイプ（毎ターン腕力+1）のカード
          if (card.effects.strength && card.cost === 3) {
            state.player.strength = (state.player.strength || 0) + 1
          }
          // ブロック付与系のパワーカード
          if (card.effects.block) {
            state.player.block = (state.player.block || 0) + card.effects.block
          }
        }
      })
      
      state.discardPile = [...state.discardPile, ...state.hand]
      state.hand = []
      
      for (let i = 0; i < 5; i++) {
        if (state.drawPile.length === 0) {
          state.drawPile = shuffleDeck([...state.discardPile])
          state.discardPile = []
        }
        if (state.drawPile.length > 0) {
          const card = state.drawPile[0]
          state.hand.push(card)
          state.drawPile = state.drawPile.slice(1)
        }
      }
    },

    playCard: (state, action: PayloadAction<Card>) => {
      if (state.isGameOver) return
      
      const card = action.payload
      if (state.energy.current < card.cost) return

      // 首切りの使用条件チェック
      if (card.id === 'attack_kubi_kiri') {
        // 現在の手札から対象のカードを除いた残りの手札をチェック
        const otherCards = state.hand.filter(c => c.id !== card.id)
        const isAllAttacks = otherCards.length === 0 || otherCards.every(c => c.type === 'attack')
        if (!isAllAttacks) return
      }
      
      state.hand = state.hand.filter((c: Card) => c.id !== card.id)
      state.energy.current -= card.cost

      // 即時効果の適用
      if (card.effects.block) {
        state.player.block += card.effects.block
      }

      // パワーカードの場合は特別な処理
      if (card.type === 'power') {
        state.activePowers.push(card)
      } else {
        // 通常のカードは捨て札に追加
        state.discardPile.push(card)

        if (card.effects.strength) {
          state.player.strength = (state.player.strength || 0) + card.effects.strength
        }
      }
      
      // 敵への効果を適用
      if (state.enemy) {
        // ダメージ処理を実行
        if ('damage' in card.effects) {
          let totalDamage = card.effects.damage || 0
          
          // ブロック値をダメージに加算
          if (card.effects.blockAsDamage) {
            totalDamage += state.player.block || 0
          }

          if (state.player.strength) {
            totalDamage += state.player.strength
          }

          const hitCount = card.effects.multiply || 1
          for (let i = 0; i < hitCount; i++) {
            if (state.enemy.block > 0) {
              const blockedDamage = Math.min(state.enemy.block, totalDamage)
              state.enemy.block = Math.max(0, state.enemy.block - totalDamage)
              const remainingDamage = totalDamage - blockedDamage
              if (remainingDamage > 0) {
                state.enemy.currentHp = Math.max(0, state.enemy.currentHp - remainingDamage)
              }
            } else {
              state.enemy.currentHp = Math.max(0, state.enemy.currentHp - totalDamage)
            }
          }
        }

        // 弱体化効果の適用
        if (card.effects.weaken) {
          state.enemy.weaken = (state.enemy.weaken || 0) + card.effects.weaken
        }
      }
      
      // カードドロー効果の適用
      if (card.effects.draw) {
        for (let i = 0; i < card.effects.draw; i++) {
          if (state.drawPile.length === 0) {
            state.drawPile = shuffleDeck([...state.discardPile])
            state.discardPile = []
          }
          if (state.drawPile.length > 0) {
            const drawnCard = state.drawPile[0]
            state.hand.push(drawnCard)
            state.drawPile = state.drawPile.slice(1)
          }
        }
      }
    },

    endBattle: (state) => {
      if (state.enemy && state.enemy.goldReward) {
        state.gold += state.enemy.goldReward
      }
      state.enemy = null
      state.isInBattle = false
      state.hand = []
      state.discardPile = []
      state.drawPile = []
      state.turnNumber = 0
      state.player.strength = 0
      state.activePowers = []
    },

    addCardToDeck: (state, action: PayloadAction<Card>) => {
      if (state.isGameOver) return
      state.deck.push(action.payload)
    },

    restAtCampfire: (state) => {
      if (state.isGameOver) return
      const healAmount = Math.floor(state.player.maxHp * 0.3 * state.healingMultiplier)
      state.player.currentHp = Math.min(
        state.player.currentHp + healAmount,
        state.player.maxHp
      )
    },

    setGameCleared: (state, action: PayloadAction<boolean>) => {
      state.isGameCleared = action.payload
    },

    setGameOver: (state, action: PayloadAction<boolean>) => {
      state.isGameOver = action.payload
    },

    checkCanSpendGold: (state, action: PayloadAction<number>) => {
      state.canSpendGold = state.gold >= action.payload
    },

    spendGold: (state, action: PayloadAction<number>) => {
      const amount = action.payload
      if (state.gold >= amount) {
        state.gold -= amount
        state.canSpendGold = false
      }
    },

    gainGold: (state, action: PayloadAction<number>) => {
      const amount = Math.floor(action.payload * state.goldMultiplier)
      state.gold += amount
    },

    resetGame: () => initialState,

    upgradeCard: (state, action: PayloadAction<Card>) => {
      if (state.isGameOver) return
      const upgradedCard = action.payload
      const index = state.deck.findIndex((card: Card) => card.id === upgradedCard.id)
      if (index !== -1) {
        state.deck[index] = upgradedCard
      }
    },

    addRelic: (state, action: PayloadAction<Relic>) => {
      if (state.isGameOver) return
      const relic = action.payload

      state.relics.push(relic)

      switch (relic.effect.type) {
        case 'maxHp':
          state.player.maxHp += relic.effect.value
          state.player.currentHp += relic.effect.value
          break
        case 'energy':
          state.energy.max += relic.effect.value
          break
        case 'gold':
          state.goldMultiplier += relic.effect.value
          break
        case 'healing':
          state.healingMultiplier += relic.effect.value
          break
      }
    }
  }
})

export const {
  startBattle,
  playCard,
  endTurn,
  endBattle,
  addCardToDeck,
  restAtCampfire,
  setGameCleared,
  setGameOver,
  checkCanSpendGold,
  spendGold,
  gainGold,
  resetGame,
  upgradeCard,
  addRelic
} = gameSlice.actions

export default gameSlice.reducer