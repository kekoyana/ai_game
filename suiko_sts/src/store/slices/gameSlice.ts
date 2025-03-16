import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Card, initialDeck, shuffleDeck } from '../../data/cards'

export interface Character {
  id: string
  name: string
  maxHp: number
  currentHp: number
  block: number
  strength?: number // 攻撃力
  nextMove?: {
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
  isInBattle: boolean
  turnNumber: number
  deck: Card[]
  isGameCleared: boolean
  isGameOver: boolean
}

const initialState: GameState = {
  player: {
    id: 'player',
    name: '宋江',
    maxHp: 80,
    currentHp: 80,
    block: 0
  },
  enemy: null,
  hand: [],
  drawPile: [],
  discardPile: [],
  energy: {
    current: 3,
    max: 3
  },
  isInBattle: false,
  turnNumber: 0,
  deck: [...initialDeck],
  isGameCleared: false,
  isGameOver: false
}

// 敵の行動パターンを生成する関数
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

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startBattle: (state, action: PayloadAction<Character>) => {
      if (state.isGameOver) return
      
      state.enemy = action.payload
      if (state.enemy) {
        // バトル開始時に最初の行動をセット
        state.enemy.nextMove = generateEnemyMove(state.enemy)
      }
      state.isInBattle = true
      state.energy.current = state.energy.max
      state.turnNumber = 1
      state.drawPile = shuffleDeck([...state.deck])
      state.hand = []
      state.discardPile = []
      
      // 初期手札を引く
      for (let i = 0; i < 5; i++) {
        if (state.drawPile.length === 0) break
        const card = state.drawPile[0]
        state.hand.push(card)
        state.drawPile = state.drawPile.slice(1)
      }
    },

    playCard: (state, action: PayloadAction<Card>) => {
      if (state.isGameOver) return
      
      const card = action.payload
      if (state.energy.current < card.cost) return
      
      state.hand = state.hand.filter(c => c.id !== card.id)
      state.discardPile.push(card)
      state.energy.current -= card.cost
      
      if (card.effects.damage && state.enemy) {
        const damage = Math.max(card.effects.damage - state.enemy.block, 0)
        state.enemy.block = Math.max(state.enemy.block - card.effects.damage, 0)
        state.enemy.currentHp = Math.max(state.enemy.currentHp - damage, 0)
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

    endTurn: (state) => {
      if (state.isGameOver || !state.isInBattle) return
      
      state.turnNumber += 1
      state.energy.current = state.energy.max
      state.player.block = 0
      
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

      // 敵の行動を実行
      if (state.enemy && state.enemy.nextMove) {
        const currentMove = state.enemy.nextMove

        if (currentMove.type === 'attack') {
          const damage = currentMove.value
          if (state.player.block > 0) {
            const blockedDamage = Math.min(state.player.block, damage)
            state.player.block -= blockedDamage
            const remainingDamage = damage - blockedDamage
            if (remainingDamage > 0) {
              state.player.currentHp = Math.max(state.player.currentHp - remainingDamage, 0)
              
              if (state.player.currentHp === 0) {
                state.isGameOver = true
                state.isInBattle = false
              }
            }
          } else {
            state.player.currentHp = Math.max(state.player.currentHp - damage, 0)
            
            if (state.player.currentHp === 0) {
              state.isGameOver = true
              state.isInBattle = false
            }
          }
        } else if (currentMove.type === 'defend') {
          state.enemy.block += currentMove.value
        }

        // 次のターンの行動を決定
        state.enemy.nextMove = generateEnemyMove(state.enemy)
      }
    },

    endBattle: (state) => {
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
      const healAmount = Math.floor(state.player.maxHp * 0.3)
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

    resetGame: () => {
      return initialState
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
  resetGame
} = gameSlice.actions

export default gameSlice.reducer