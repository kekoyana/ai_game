import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Card, shuffleDeck } from '../../data/cards'
import { Relic } from '../../data/relics'
import { Character } from './gameGeneralSlice'

interface BattleState {
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
  activePowers: Card[]
  activeSkills: Card[]
  incomingDamage: number
  tempUpgradedCards: Card[]
  isSelectingCardForUpgrade: boolean
}

const getUpgradedEffect = (effects: Card['effects']): Card['effects'] => {
  const upgraded: Card['effects'] = { ...effects }
  if (effects.damage) upgraded.damage = effects.damage + 3
  if (effects.block) upgraded.block = effects.block + 3
  if (effects.draw) upgraded.draw = effects.draw + 1
  return upgraded
}

const getUpgradedDescription = (card: Card): string => {
  const effects = getUpgradedEffect(card.effects)
  let desc = ''
  
  if (effects.block) desc = `${effects.block}ブロックを得る (+3)`
  else if (effects.damage) desc = `${effects.damage}ダメージを与える (+3)`
  else if (effects.draw) desc = `カードを${effects.draw}枚引く (+1)`
  else desc = card.description

  return `[強化] ${desc}`
}

const initialState: BattleState = {
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
  activePowers: [],
  activeSkills: [],
  incomingDamage: 0,
  tempUpgradedCards: [],
  isSelectingCardForUpgrade: false
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

export const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    startBattle: (state, action: PayloadAction<{ enemy: Character, deck: Card[], player: Character, relics: Relic[] }>) => {
      const { enemy, deck, relics } = action.payload
      enemy.goldReward = enemy.strength === 5 ? 100 :
                        enemy.strength === 3 ? 50 :
                        25

      state.enemy = enemy
      if (state.enemy) {
        const action = generateEnemyMove(state.enemy)
        state.enemy.enemyAction = action
        
        if (action.type === 'defend') {
          state.enemy.block = action.value
        }
      }

      state.isInBattle = true
      state.energy.current = state.energy.max
      state.turnNumber = 1
      state.drawPile = shuffleDeck([...deck])
      state.hand = []
      state.discardPile = []
      state.activePowers = []
      state.activeSkills = []
      state.incomingDamage = 0
      state.tempUpgradedCards = []
      state.isSelectingCardForUpgrade = false

      const initialDraw = 5 + relics.reduce((bonus: number, relic: Relic) =>
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
      if (!state.isInBattle) return

      if (state.enemy?.enemyAction?.type === 'attack') {
        state.incomingDamage = state.enemy.enemyAction.value
      }

      if (state.enemy) {
        if (state.enemy.weaken && state.enemy.weaken > 0) {
          state.enemy.weaken -= 1
        }

        state.enemy.block = 0

        const nextAction = generateEnemyMove(state.enemy)
        state.enemy.enemyAction = nextAction

        if (nextAction.type === 'defend') {
          let blockValue = nextAction.value
          if (state.enemy.weaken && state.enemy.weaken > 0) {
            const reduction = Math.floor(blockValue * 0.25)
            blockValue -= reduction
          }
          state.enemy.block = blockValue
        }
      }

      state.turnNumber += 1
      state.energy.current = state.energy.max

      // ディスカードする際にアップグレード状態を維持
      const cardsToDiscard = state.hand.map(card => {
        const upgradedCard = state.tempUpgradedCards.find(uc => uc.id === card.id)
        return upgradedCard || card
      })
      state.discardPile = [...state.discardPile, ...cardsToDiscard]
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

      state.activeSkills = []
    },

    playCard: (state, action: PayloadAction<{ card: Card }>) => {
      const { card } = action.payload
      if (!state.isInBattle || state.energy.current < card.cost) return

      // 鍛冶カードの特別処理
      if (card.id === 'skill_kanji') {
        state.hand = state.hand.filter((c: Card) => c.id !== card.id)
        state.energy.current -= card.cost
        state.discardPile.push(card)
        state.isSelectingCardForUpgrade = true
        return
      }

      if (card.id === 'attack_kubi_kiri') {
        const otherCards = state.hand.filter(c => c.id !== card.id)
        const isAllAttacks = otherCards.length === 0 || otherCards.every(c => c.type === 'attack')
        if (!isAllAttacks) return
      }


      state.hand = state.hand.filter((c: Card) => c.id !== card.id)
      state.energy.current -= card.cost

      // アップグレードされたカードを探す
      const upgradedCard = state.tempUpgradedCards.find(c => c.id === card.id)
      const cardToPlay = upgradedCard || card
      let effects = { ...cardToPlay.effects }

      if (cardToPlay.type === 'power') {
        state.activePowers.push({ ...cardToPlay, effects })
      } else {
        state.discardPile.push({ ...cardToPlay, effects })
        if (effects.turnEnd) {
          state.activeSkills.push({ ...cardToPlay, effects })
        }
      }

      if (state.enemy && 'damage' in effects) {
        let totalDamage = effects.damage || 0
        const hitCount = effects.multiply || 1

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

        if (effects.weaken) {
          state.enemy.weaken = (state.enemy.weaken || 0) + effects.weaken
        }
      }

      if (effects.draw) {
        for (let i = 0; i < effects.draw; i++) {
          if (state.drawPile.length === 0) {
            state.drawPile = shuffleDeck([...state.discardPile])
            state.discardPile = []
          }
          if (state.drawPile.length > 0) {
            const drawnCard = state.drawPile[0]
            // アップグレード状態を確認
            const upgradedCard = state.tempUpgradedCards.find(uc => uc.id === drawnCard.id)
            state.hand.push(upgradedCard || drawnCard)
            state.drawPile = state.drawPile.slice(1)
          }
        }
      }
    },

    endBattle: (state) => {
      state.enemy = null
      state.isInBattle = false
      state.hand = []
      state.discardPile = []
      state.drawPile = []
      state.turnNumber = 0
      state.activePowers = []
      state.activeSkills = []
      state.incomingDamage = 0
      state.tempUpgradedCards = []
      state.isSelectingCardForUpgrade = false
    },

    setEnergyMax: (state, action: PayloadAction<number>) => {
      state.energy.max = action.payload
      state.energy.current = action.payload
    },

    upgradeCardTemp: (state, action: PayloadAction<Card>) => {
      if (!state.isInBattle) return
      
      const isAlreadyUpgraded = state.tempUpgradedCards.some(card => card.id === action.payload.id)
      if (!isAlreadyUpgraded) {
        const upgradedEffects = getUpgradedEffect({ ...action.payload.effects })
        const upgradedDescription = getUpgradedDescription(action.payload)
        const upgradedCard = {
          ...action.payload,
          effects: upgradedEffects,
          description: upgradedDescription,
          isUpgraded: true
        }
        
        state.tempUpgradedCards.push(upgradedCard)
        state.hand = state.hand.map(card =>
          card.id === action.payload.id ? { ...upgradedCard } : card
        )
      }
      state.isSelectingCardForUpgrade = false
    },

    cancelCardUpgradeSelection: (state) => {
      state.isSelectingCardForUpgrade = false
    }
  }
})

export const {
  startBattle,
  playCard,
  endTurn,
  endBattle,
  setEnergyMax,
  upgradeCardTemp,
  cancelCardUpgradeSelection
} = battleSlice.actions

export default battleSlice.reducer