import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect } from 'vitest'
import battleReducer, { startBattle, endTurn } from '../store/slices/battleSlice'
import gameGeneralReducer, {
  addBlock,
  takeDamage,
  resetBlock
} from '../store/slices/gameGeneralSlice'
import { Card } from '../data/cards'

const createTestStore = () => {
  const player = {
    id: 'player',
    name: 'テストプレイヤー',
    maxHp: 80,
    currentHp: 80,
    block: 0,
    strength: 0
  }

  return configureStore({
    reducer: {
      battle: battleReducer,
      gameGeneral: gameGeneralReducer
    },
    preloadedState: {
      battle: {
        enemy: null,
        hand: [],
        drawPile: [],
        discardPile: [],
        energy: { current: 3, max: 3 },
        isInBattle: false,
        turnNumber: 0,
        activePowers: [],
        activeSkills: [],
        incomingDamage: 0,
        tempUpgradedCards: [],
        isSelectingCardForUpgrade: false
      },
      gameGeneral: {
        player,
        deck: [],
        gold: 0,
        isGameCleared: false,
        isGameOver: false,
        canSpendGold: false,
        relics: [],
        goldMultiplier: 1,
        healingMultiplier: 1,
        isSelectingCardToUpgrade: false
      }
    }
  })
}

describe('Battle System', () => {
  it('基本的な戦闘フローのテスト', () => {
    const store = createTestStore()
    
    // 戦闘開始
    store.dispatch(startBattle({
     enemy: {
       id: 'test_enemy',
       name: 'テストエネミー',
       maxHp: 100,
       currentHp: 100,
       block: 0,
       strength: 0,
       // テストの初期行動を明示的に設定
       enemyAction: {
         type: 'attack',
         value: 14,
         description: '攻撃 14'
       }
     },
      deck: [],
      player: store.getState().gameGeneral.player,
      relics: []
    }))

    // 1ターン目：初期状態の確認
    let state = store.getState()
    expect(state.gameGeneral.player.currentHp).toBe(80)
    expect(state.battle.enemy?.enemyAction?.type).toBe('attack')
    expect(state.battle.enemy?.enemyAction?.value).toBe(14)
    expect(state.battle.incomingDamage).toBe(14)

    // ブロック5を追加して防御
    store.dispatch(addBlock(5))
    state = store.getState()
    expect(state.gameGeneral.player.block).toBe(5)


    // ダメージ計算とブロックリセット
    store.dispatch(takeDamage(14))
    store.dispatch(resetBlock())
    store.dispatch(endTurn())
    
    state = store.getState()
    expect(state.gameGeneral.player.currentHp).toBe(71) // 80 - (14 - 5)

    // 2ターン目：15ブロックで完全防御
    state = store.getState()
    expect(state.battle.enemy?.enemyAction?.type).toBe('attack')
    expect(state.battle.incomingDamage).toBe(14)
    expect(state.gameGeneral.player.currentHp).toBe(71) // 前のターンのダメージ反映

    store.dispatch(addBlock(15))
    state = store.getState()
    expect(state.gameGeneral.player.block).toBe(15)

    // ダメージ計算（15ブロックで14ダメージを完全防御）
    store.dispatch(takeDamage(14))
    store.dispatch(resetBlock())
    store.dispatch(endTurn())

    state = store.getState()
    expect(state.gameGeneral.player.currentHp).toBe(71) // ダメージを受けていない

    // 3ターン目：10ブロックで完全防御
    state = store.getState()
    expect(state.battle.enemy?.enemyAction?.type).toBe('attack')
    expect(state.battle.incomingDamage).toBe(14)
    expect(state.gameGeneral.player.currentHp).toBe(71)

    store.dispatch(addBlock(10))
    state = store.getState()
    expect(state.gameGeneral.player.block).toBe(10)

    // ダメージ計算（10ブロックで14ダメージを防御）
    store.dispatch(takeDamage(14))
    store.dispatch(resetBlock())
    store.dispatch(endTurn())

    state = store.getState()
    expect(state.gameGeneral.player.currentHp).toBe(67) // 14 - 10 = 4ダメージを受ける
  })

  it('敵の攻撃パターンの変化テスト', () => {
    const store = createTestStore()
    
    // 明示的な初期行動（攻撃）で戦闘開始
    store.dispatch(startBattle({
      enemy: {
        id: 'test_enemy',
        name: 'テストエネミー',
        maxHp: 100,
        currentHp: 100,
        block: 0,
        strength: 0,
        enemyAction: {
          type: 'attack',
          value: 14,
          description: '攻撃 14'
        }
      },
      deck: [],
      player: store.getState().gameGeneral.player,
      relics: []
    }))

    let state = store.getState()
    const initialAction = state.battle.enemy?.enemyAction
    expect(initialAction?.type).toBe('attack')
    expect(initialAction?.value).toBe(14)
    
    // ターン終了処理
    store.dispatch(takeDamage(state.battle.enemy?.enemyAction?.value || 0))
    store.dispatch(resetBlock())
    store.dispatch(endTurn())
  })
})