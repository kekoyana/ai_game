import { Character } from '../store/slices/gameGeneralSlice'

export interface EnemyAction {
  type: 'attack' | 'defend' | 'special'
  value: number
  description: string
  specialAction?: string
}

export interface ActionPattern {
  getNextAction: (enemy: Character, currentAction?: Character['enemyAction']) => EnemyAction
}

export const actions: Record<string, EnemyAction> = {
  messyCooking: {
    type: 'special',
    value: 0,
    description: '乱暴な調理 (腐った肉×2)',
    specialAction: 'add_rotten_meat'
  },
  attack14: {
    type: 'attack',
    value: 14,
    description: '攻撃 14'
  },
  defend8: {
    type: 'defend',
    value: 8,
    description: '防御態勢 (8ブロック)'
  },
  attack12: {
    type: 'attack',
    value: 12,
    description: '強襲 12'
  }
}

export const patternTestEnemyBehavior: ActionPattern = {
  getNextAction: (enemy: Character, currentAction?: Character['enemyAction']) => {
    if (!currentAction) {
      return actions.attack14
    } else if (currentAction.type === 'attack' && currentAction.value === 14) {
      return actions.defend8
    } else if (currentAction.type === 'defend') {
      return actions.attack12
    }
    return actions.attack14
  }
}

export const randomBehavior: ActionPattern = {
  getNextAction: (enemy: Character, currentAction?: Character['enemyAction']) => {
    const availableActions = Object.values(actions)
    if (currentAction) {
      const differentActions = availableActions.filter(action =>
        action.type !== currentAction.type || action.value !== currentAction.value
      )
      return differentActions[Math.floor(Math.random() * differentActions.length)]
    }
    return actions.attack14
  }
}

export const basicAttackBehavior: ActionPattern = {
  getNextAction: () => actions.attack14
}

export const messyCookingBehavior: ActionPattern = {
  getNextAction: (enemy: Character, currentAction?: Character['enemyAction']) => {
    if (!currentAction || currentAction.type === 'attack') {
      return actions.messyCooking
    } else {
      return actions.attack14
    }
  }
}

export const getBehaviorForEnemy = (enemyId: string): ActionPattern => {
  console.log(enemyId)
  switch (enemyId) {
    case 'pattern_test_enemy':
      return patternTestEnemyBehavior
    case 'test_enemy':
      return basicAttackBehavior
    case 'zhen_guansi':
      return messyCookingBehavior
    default:
      return randomBehavior
  }
}