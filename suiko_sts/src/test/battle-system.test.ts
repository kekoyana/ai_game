import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect } from 'vitest'
import battleReducer, {
  startBattle,
  endTurn,
  setHand,
  setEnergyCurrent
} from '../store/slices/battleSlice'
import gameGeneralReducer, {
  addBlock,
  takeDamage,
  resetBlock,
  applyHeavyArmor
} from '../store/slices/gameGeneralSlice'
import { Card, allCards } from '../data/cards'

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
  it('attack_kubi_kiriのテスト', () => {
    const store = createTestStore()
    
    // 戦闘開始（敵の設定は任意）
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
    const kubiKiri = allCards.find(card => card.id === 'attack_kubi_kiri')!
    const attackCard: Card = {
      id: 'test_attack',
      name: 'テスト攻撃',
      type: 'attack',
      cost: 1,
      effects: { damage: 6 },
      description: '6ダメージを与える',
      rarity: 'C',
      character: 'テストキャラクター'
    }
    const skillCard: Card = {
      id: 'test_skill',
      name: 'テストスキル',
      type: 'skill',
      cost: 1,
      effects: { block: 5 },
      description: '5ブロックを得る',
      rarity: 'C',
      character: 'テストキャラクター'
    }

    // ケース1: 手札が空の場合（使用可能）
    store.dispatch(setHand([kubiKiri]))
    store.dispatch(setEnergyCurrent(2))
    store.dispatch({ type: 'battle/playCard', payload: { card: kubiKiri } })
    state = store.getState()
    expect(state.battle.hand).toHaveLength(0)

    // ケース2: 手札が全てアタックカードの場合（使用可能）
    store.dispatch(setHand([kubiKiri, attackCard]))
    store.dispatch(setEnergyCurrent(2))
    store.dispatch({ type: 'battle/playCard', payload: { card: kubiKiri } })
    state = store.getState()
    expect(state.battle.hand).toHaveLength(1)
    expect(state.battle.hand[0].id).toBe('test_attack')

    // ケース3: 手札にスキルカードが含まれる場合（使用不可）
    store.dispatch(setHand([kubiKiri, attackCard, skillCard]))
    store.dispatch(setEnergyCurrent(2))
    store.dispatch({ type: 'battle/playCard', payload: { card: kubiKiri } })
    state = store.getState()
    expect(state.battle.hand).toHaveLength(3) // カードが使用されていないことを確認
  })

  it('敵の行動パターンと実行のテスト', () => {
    const store = createTestStore()
    
    // 戦闘開始
    store.dispatch(startBattle({
      enemy: {
        id: 'pattern_test_enemy',
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

    // 1ターン目：攻撃14
    let state = store.getState()
    expect(state.battle.enemy?.enemyAction?.type).toBe('attack')
    expect(state.battle.enemy?.enemyAction?.value).toBe(14)
    expect(state.battle.incomingDamage).toBe(14)

    // ターン終了：14ダメージを受ける
    store.dispatch(takeDamage(14))
    store.dispatch(resetBlock())
    store.dispatch(endTurn())
    
    state = store.getState()
    expect(state.gameGeneral.player.currentHp).toBe(66) // 80 - 14

    // 2ターン目：防御8
    expect(state.battle.enemy?.enemyAction?.type).toBe('defend')
    expect(state.battle.enemy?.enemyAction?.value).toBe(8)
    expect(state.battle.incomingDamage).toBe(0)
    expect(state.battle.enemy?.block).toBe(8)

    // ターン終了：ダメージを受けない
    store.dispatch(takeDamage(0))
    store.dispatch(resetBlock())
    store.dispatch(endTurn())
    
    state = store.getState()
    expect(state.gameGeneral.player.currentHp).toBe(66) // 変化なし

    // 3ターン目：攻撃12
    expect(state.battle.enemy?.enemyAction?.type).toBe('attack')
    expect(state.battle.enemy?.enemyAction?.value).toBe(12)
    expect(state.battle.incomingDamage).toBe(12)

    // ターン終了：12ダメージを受ける
    store.dispatch(takeDamage(12))
    store.dispatch(resetBlock())
    store.dispatch(endTurn())
    
    state = store.getState()
    expect(state.gameGeneral.player.currentHp).toBe(54) // 66 - 12
  })

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
        id: 'pattern_test_enemy',
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
    expect(state.battle.enemy?.enemyAction?.type).toBe('attack')
    expect(state.battle.enemy?.enemyAction?.value).toBe(14)
    expect(state.battle.incomingDamage).toBe(14)
    
    // ターン終了処理で次の行動が防御8になることを確認
    store.dispatch(takeDamage(14))
    store.dispatch(resetBlock())
    store.dispatch(endTurn())
    
    state = store.getState()
    expect(state.battle.enemy?.enemyAction?.type).toBe('defend')
    expect(state.battle.enemy?.enemyAction?.value).toBe(8)
    expect(state.battle.incomingDamage).toBe(0)
    expect(state.battle.enemy?.block).toBe(8)
  })

  it('重装備バフのテスト', () => {
    const store = createTestStore()
    
    // 戦闘開始：プレイヤーに重装備3を設定
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
      player: {
        ...store.getState().gameGeneral.player,
        heavyArmor: 3  // 重装備+3の状態
      },
      relics: []
    }))

    let state = store.getState()
    expect(state.gameGeneral.player.heavyArmor).toBe(3)
    expect(state.gameGeneral.player.block).toBe(0)

    // 1ターン目：ターン終了時に重装備の効果でブロック+3
    store.dispatch(addBlock(5))  // 通常の防御
    state = store.getState()
    expect(state.gameGeneral.player.block).toBe(5)
store.dispatch(takeDamage(14))
store.dispatch(resetBlock())
store.dispatch(applyHeavyArmor()) // 重装備の効果を適用
store.dispatch(endTurn())

state = store.getState()
expect(state.gameGeneral.player.block).toBe(3)  // 重装備の効果で+3
expect(state.gameGeneral.player.currentHp).toBe(74)  // 80 - (14 - 8[5+3])

// 2ターン目：重装備の効果が持続
store.dispatch(takeDamage(14))
store.dispatch(resetBlock())
store.dispatch(applyHeavyArmor()) // 重装備の効果を適用
store.dispatch(endTurn())

state = store.getState()
expect(state.gameGeneral.player.block).toBe(3)  // 再度重装備の効果で+3
    expect(state.gameGeneral.player.block).toBe(3)  // 再度重装備の効果で+3
  })
})

it('腐った肉カードの状態リセットテスト', () => {
  const store = createTestStore()
  
  // テスト用の初期デッキを作成（既存のカードを使用）
  const testDeck = [allCards.find(card => card.id === 'attack_bokutou_ryoudan')!]

  // 1回目の戦闘開始: 腐った肉を追加する敵
  store.dispatch(startBattle({
    enemy: {
      id: 'zhen_guansi',
      name: '鎮関司',
      maxHp: 100,
      currentHp: 100,
      block: 0,
      strength: 0,
      // 初期行動を乱暴な調理に設定
      enemyAction: {
        type: 'special',
        value: 0,
        specialAction: 'add_rotten_meat',
        description: '乱暴な調理 (腐った肉×2)'
      }
    },
    deck: testDeck,
    player: store.getState().gameGeneral.player,
    relics: []
  }))

  // 腐った肉が追加される特殊行動を実行
  store.dispatch(endTurn())
  
  let state = store.getState()
  
  // 鎮関司の特殊行動（乱暴な調理）で腐った肉が2枚追加されていることを確認
  const rottenMeatCards = state.battle.drawPile.filter(card => card.id === 'status_rotten_meat')
  expect(rottenMeatCards).toHaveLength(2)
  expect(rottenMeatCards[0].type).toBe('trap')

  // 戦闘終了
  store.dispatch({ type: 'battle/endBattle' })
  state = store.getState()
  expect(state.battle.drawPile).toHaveLength(0)
  expect(state.battle.discardPile).toHaveLength(0)
  expect(state.battle.hand).toHaveLength(0)

  // 2回目の戦闘開始: 通常の敵
  store.dispatch(startBattle({
    enemy: {
      id: 'normal_enemy',
      name: 'テストエネミー2',
      maxHp: 100,
      currentHp: 100,
      block: 0,
      strength: 0,
      enemyAction: {
        type: 'attack',
        value: 10,
        description: '攻撃 10'
      }
    },
    deck: testDeck,
    player: store.getState().gameGeneral.player,
    relics: []
  }))

  state = store.getState()
  // 新しい戦闘開始時に腐った肉カードが含まれていないことを確認
  expect(state.battle.drawPile.filter(card => card.id === 'status_rotten_meat')).toHaveLength(0)
})