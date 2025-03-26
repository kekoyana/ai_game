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
  if (effects.block) return `${effects.block}ブロックを得る`
  if (effects.damage) return `${effects.damage}ダメージを与える`
  if (effects.draw) return `カードを${effects.draw}枚引く`
  return card.description
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

      state.activeSkills = []
    },

    playCard: (state, action: PayloadAction<{ card: Card }>) => {
      const { card } = action.payload
      if (!state.isInBattle || state.energy.current < card.cost) return

      console.log('=== playCard ===')
      console.log('Playing card:', card.name)

      // 鍛冶カードの特別処理
      if (card.id === 'skill_kanji') {
        console.log('Processing forge card')
        state.hand = state.hand.filter((c: Card) => c.id !== card.id)
        state.energy.current -= card.cost
        
        // カードをディスカードパイルに追加
        state.discardPile.push(card)

        // isSelectingCardForUpgradeフラグを設定
        state.isSelectingCardForUpgrade = true
        console.log('Set isSelectingCardForUpgrade to true')
        return
      }

      if (card.id === 'attack_kubi_kiri') {
        const otherCards = state.hand.filter(c => c.id !== card.id)
        const isAllAttacks = otherCards.length === 0 || otherCards.every(c => c.type === 'attack')
        if (!isAllAttacks) return
      }


      state.hand = state.hand.filter((c: Card) => c.id !== card.id)
      state.energy.current -= card.cost

      let effects = { ...card.effects }
      const upgradedCard = state.tempUpgradedCards.find(c => c.id === card.id)
      if (upgradedCard) {
        console.log('Using upgraded card effects for:', card.name)
        effects = { ...upgradedCard.effects }
        console.log('Upgraded effects:', effects)
      } else {
        console.log('Using normal card effects for:', card.name)
        console.log('Normal effects:', effects)
      }

      if (card.type === 'power') {
        state.activePowers.push({ ...card, effects })
      } else {
        state.discardPile.push({ ...card, effects })
        if (effects.turnEnd) {
          state.activeSkills.push({ ...card, effects })
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
            state.hand.push(drawnCard)
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
      console.log('Attempting to upgrade card:', action.payload.name)
      if (!state.isInBattle) {
        console.log('Not in battle, upgrade cancelled')
        return
      }
      
      const isAlreadyUpgraded = state.tempUpgradedCards.some(card => card.id === action.payload.id)
      if (!isAlreadyUpgraded) {
        const upgradedEffects = getUpgradedEffect({ ...action.payload.effects })
        const upgradedDescription = getUpgradedDescription(action.payload)
        const upgradedCard = {
          ...action.payload,
          effects: upgradedEffects,
          description: upgradedDescription
        }
        console.log('Original effects:', action.payload.effects)
        console.log('Upgraded effects:', upgradedCard.effects)
        state.tempUpgradedCards.push(upgradedCard)
        console.log('Added card to tempUpgradedCards:', upgradedCard)
      } else {
        console.log('Card already upgraded')
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