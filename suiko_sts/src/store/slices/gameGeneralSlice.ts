import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Card, createInitialDeck } from '../../data/cards'
import { Relic } from '../../data/relics'
import { startBattle } from './battleSlice'
import { endBattle } from './battleSlice'

export interface Character {
  id: string
  name: string
  maxHp: number
  currentHp: number
  block: number
  strength?: number
  weaken?: number
  heavyArmor?: number  // 重装備の値
  goldReward?: number
  enemyAction?: {
    type: 'attack' | 'defend' | 'buff'
    value: number
    description: string
  }
}

interface GameGeneralState {
  player: Character
  deck: Card[]
  gold: number
  isGameCleared: boolean
  isGameOver: boolean
  canSpendGold: boolean
  relics: Relic[]
  goldMultiplier: number
  healingMultiplier: number
  isSelectingCardToUpgrade: boolean
}

const initialState: GameGeneralState = {
  player: {
    id: 'player',
    name: '宋江',
    maxHp: 80,
    currentHp: 80,
    block: 0,
    strength: 0
  },
  deck: createInitialDeck(),
  gold: 200,
  isGameCleared: false,
  isGameOver: false,
  canSpendGold: false,
  relics: [],
  goldMultiplier: 1,
  healingMultiplier: 1,
  isSelectingCardToUpgrade: false
}

export const gameGeneralSlice = createSlice({
  name: 'gameGeneral',
  initialState,
  reducers: {
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

    removeCardFromDeck: (state, action: PayloadAction<Card>) => {
      if (state.isGameOver) return
      const index = state.deck.findIndex(card => card.id === action.payload.id)
      if (index !== -1) {
        state.deck.splice(index, 1)
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
        case 'gold':
          state.goldMultiplier += relic.effect.value
          break
        case 'healing':
          state.healingMultiplier += relic.effect.value
          break
      }
    },
// プレイヤーへのダメージ処理
takeDamage: (state, action: PayloadAction<number>) => {
  if (state.isGameOver) return
  const incomingDamage = action.payload
  const effectiveBlock = (state.player.block || 0) + (state.player.heavyArmor || 0)
  const blockedDamage = Math.min(effectiveBlock, incomingDamage)
  const remainingDamage = incomingDamage - blockedDamage
  state.player.currentHp = Math.max(0, state.player.currentHp - remainingDamage)
  if (state.player.currentHp === 0) {
    state.isGameOver = true
  }
},
    // プレイヤーのブロックをリセット
    resetBlock: (state) => {
      if (state.isGameOver) return
      state.player.block = 0
    },

    // プレイヤーの腕力を増加
    addStrength: (state, action: PayloadAction<number>) => {
      if (state.isGameOver) return
      state.player.strength = (state.player.strength || 0) + action.payload
    },

    // プレイヤーのブロックを増加
    addBlock: (state, action: PayloadAction<number>) => {
      if (state.isGameOver) return
      state.player.block = (state.player.block || 0) + action.payload
    },
    addHeavyArmor: (state, action: PayloadAction<number>) => {
      if (state.isGameOver) return
      state.player.heavyArmor = (state.player.heavyArmor || 0) + action.payload
    },

    // 重装備の効果を適用
    applyHeavyArmor: (state) => {
      if (state.isGameOver || !state.player.heavyArmor) return
      state.player.block += state.player.heavyArmor
    },

    // 重装備をリセット
    resetHeavyArmor: (state) => {
      if (state.isGameOver) return
      state.player.heavyArmor = 0
    },

    // パワーカードの効果をリセット
    resetPowerEffects: (state) => {
      if (state.isGameOver) return
      state.player.strength = 0
      state.player.heavyArmor = 0
    }
  }
  ,
  extraReducers: (builder) => {
    builder.addCase(startBattle, (state, action) => {
      state.player = { ...action.payload.player, heavyArmor: action.payload.player.heavyArmor !== undefined ? action.payload.player.heavyArmor : 0 }
    })
    builder.addCase(endBattle, (state) => {
      // Reset power card effects when battle ends
      state.player.strength = 0
      state.player.heavyArmor = 0
    })
  }
})

export const {
  addCardToDeck,
  restAtCampfire,
  setGameCleared,
  setGameOver,
  checkCanSpendGold,
  spendGold,
  gainGold,
  resetGame,
  upgradeCard,
  addRelic,
  removeCardFromDeck,
  takeDamage,
  resetBlock,
  addStrength,
  addBlock,
  addHeavyArmor,
  applyHeavyArmor,
  resetHeavyArmor,
  resetPowerEffects
} = gameGeneralSlice.actions

export default gameGeneralSlice.reducer
