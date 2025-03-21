import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { Card, initialDeck, shuffleDeck } from '../../data/cards'
import { Relic } from '../../data/relics'

export interface Character {
  id: string
  name: string
  maxHp: number
  currentHp: number
  block: number
  strength?: number
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
  deck: [...initialDeck],
  isGameCleared: false,
  isGameOver: false,
  canSpendGold: false,
  relics: [],
  goldMultiplier: 1,
  healingMultiplier: 1
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
        // 現在の行動を実行（攻撃のみ。防御は次のターンの行動として設定される）
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

        // 既存のブロック値をリセット
        state.player.block = 0
        state.enemy.block = 0

        // 次のターンの行動を決定
        const nextAction = generateEnemyMove(state.enemy)
        state.enemy.enemyAction = nextAction

        // 次の行動が防御なら即座に適用
        if (nextAction.type === 'defend') {
          state.enemy.block = nextAction.value
        }
      }

      // その他のターン終了時の処理
      state.turnNumber += 1
      state.energy.current = state.energy.max

      const hasPowerCard = state.deck.some((card: Card) =>
        card.type === 'power' && card.name === '覇王の威厳'
      )
      if (hasPowerCard) {
        state.player.strength = (state.player.strength || 0) + 1
      }
      
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
      
      state.hand = state.hand.filter((c: Card) => c.id !== card.id)
      state.discardPile.push(card)
      state.energy.current -= card.cost
      
      if (card.effects.damage && state.enemy) {
        let totalDamage = card.effects.damage
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

      if (card.effects.strength) {
        state.player.strength = (state.player.strength || 0) + card.effects.strength
      }
      
      if (card.effects.block) {
        state.player.block += card.effects.block
      }
      
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