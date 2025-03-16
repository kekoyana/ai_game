import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Card, initialDeck, shuffleDeck } from '../../data/cards'

interface Character {
  id: string
  name: string
  maxHp: number
  currentHp: number
  block: number
  description?: string // 敵の説明文
  nextMove?: {
    type: 'attack' | 'defend' | 'buff'
    value: number
    description: string
  }
}

export const enemies: Character[] = [
  {
    id: 'corrupt-officer',
    name: '貪官',
    maxHp: 45,
    currentHp: 45,
    block: 0,
    description: '賄賂で蓄えた財を鎧として身につけている'
  },
  {
    id: 'bandit-leader',
    name: '山賊頭',
    maxHp: 60,
    currentHp: 60,
    block: 0,
    description: '梁山泊対抗の山賊集団のリーダー'
  },
  {
    id: 'royal-guard',
    name: '朝廷の侍衛',
    maxHp: 50,
    currentHp: 50,
    block: 0,
    description: '高度な武芸の心得がある'
  }
]

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
}

const initialState: GameState = {
  player: {
    id: 'player',
    name: '宋江',
    maxHp: 80,
    currentHp: 80,
    block: 0,
    description: '梁山泊の総帥、天罡星の主将'
  },
  enemy: null,
  hand: [],
  drawPile: shuffleDeck([...initialDeck]),
  discardPile: [],
  energy: {
    current: 3,
    max: 3
  },
  isInBattle: false,
  turnNumber: 0
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    drawCard: (state) => {
      if (state.drawPile.length === 0) {
        state.drawPile = shuffleDeck([...state.discardPile])
        state.discardPile = []
      }
      if (state.drawPile.length > 0) {
        const card = state.drawPile[0]
        state.hand.push(card)
        state.drawPile = state.drawPile.slice(1)
      }
    },

    playCard: (state, action: PayloadAction<Card>) => {
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

    startBattle: (state, action: PayloadAction<Character>) => {
      state.enemy = action.payload
      state.isInBattle = true
      state.energy.current = state.energy.max
      state.turnNumber = 1
      
      // 初期手札を引く
      for (let i = 0; i < 5; i++) {
        if (state.drawPile.length === 0) break
        const card = state.drawPile[0]
        state.hand.push(card)
        state.drawPile = state.drawPile.slice(1)
      }
    },

    endTurn: (state) => {
      if (!state.isInBattle) return
      
      state.turnNumber += 1
      state.energy.current = state.energy.max
      state.player.block = 0
      
      state.discardPile = [...state.discardPile, ...state.hand]
      state.hand = []
      
      // 新しい手札を引く
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

      // 敵の行動
      if (state.enemy) {
        // ランダムな行動を選択
        const actions = [
          { type: 'attack' as const, value: 12, description: '強襲' },
          { type: 'defend' as const, value: 8, description: '防御態勢' },
          { type: 'attack' as const, value: 8, description: '通常攻撃' }
        ]
        state.enemy.nextMove = actions[Math.floor(Math.random() * actions.length)]

        if (state.enemy.nextMove.type === 'attack') {
          const damage = state.enemy.nextMove.value
          if (state.player.block > 0) {
            const blockedDamage = Math.min(state.player.block, damage)
            state.player.block -= blockedDamage
            const remainingDamage = damage - blockedDamage
            if (remainingDamage > 0) {
              state.player.currentHp = Math.max(state.player.currentHp - remainingDamage, 0)
            }
          } else {
            state.player.currentHp = Math.max(state.player.currentHp - damage, 0)
          }
        } else if (state.enemy.nextMove.type === 'defend') {
          state.enemy.block += state.enemy.nextMove.value
        }
      }
    },

    endBattle: (state) => {
      state.enemy = null
      state.isInBattle = false
      state.hand = []
      state.discardPile = []
      state.drawPile = shuffleDeck([...initialDeck])
      state.turnNumber = 0
    }
  }
})

export const {
  drawCard,
  playCard,
  startBattle,
  endTurn,
  endBattle
} = gameSlice.actions

export default gameSlice.reducer