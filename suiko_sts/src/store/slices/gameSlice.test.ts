import { describe, test, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Card, CardRarity } from '../../data/cards'
import gameReducer, { startBattle, endTurn, playCard } from './gameSlice'
import type { Store } from '@reduxjs/toolkit'

describe('Enemy Defense Behavior', () => {
  let store: Store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: gameReducer
      }
    })
  })

  test('enemy should gain block immediately when choosing defend', () => {
    // 戦闘開始時に敵が防御を選択した場合
    const enemy = {
      id: 'test-enemy',
      name: 'Test Enemy',
      maxHp: 50,
      currentHp: 50,
      block: 0
    }

    // Math.randomをモック化して0.4を返すように設定（防御行動を選択）
    const mockRandom = vi.spyOn(Math, 'random')
    mockRandom.mockReturnValue(0.4)

    store.dispatch(startBattle(enemy))

    const stateAfterStart = store.getState().game
    expect(stateAfterStart.enemy?.block).toBe(8)
    expect(stateAfterStart.enemy?.nextMove?.type).toBe('defend')
    expect(stateAfterStart.enemy?.nextMove?.value).toBe(8)

    mockRandom.mockRestore()
  })

  test('enemy block should reset at the start of each turn', () => {
    const enemy = {
      id: 'test-enemy',
      name: 'Test Enemy',
      maxHp: 50,
      currentHp: 50,
      block: 0
    }

    const mockRandom = vi.spyOn(Math, 'random')
    mockRandom.mockReturnValueOnce(0.4) // 最初の行動：防御を選択
    mockRandom.mockReturnValueOnce(0.1) // 次の行動：攻撃を選択

    // バトル開始
    store.dispatch(startBattle(enemy))
    const stateAfterStart = store.getState().game
    expect(stateAfterStart.enemy?.block).toBe(8)

    // ターン終了と次のターン開始
    store.dispatch(endTurn())
    
    // ターン開始時にブロックがリセットされているか確認
    const stateAfterTurn = store.getState().game
    expect(stateAfterTurn.enemy?.block).toBe(0)
    expect(stateAfterTurn.enemy?.nextMove?.type).toBe('attack')

    mockRandom.mockRestore()
  })

  test('enemy block should be effective in the same turn it is gained', () => {
    const enemy = {
      id: 'test-enemy',
      name: 'Test Enemy',
      maxHp: 50,
      currentHp: 50,
      block: 0
    }

    const mockRandom = vi.spyOn(Math, 'random')
    mockRandom.mockReturnValue(0.4) // 防御を選択

    store.dispatch(startBattle(enemy))

    // プレイヤーの攻撃カード
    const attackCard: Card = {
      id: 'test-attack',
      name: '斬撃',
      type: 'attack' as const,
      cost: 1,
      rarity: 'C' as CardRarity,
      description: '6ダメージを与える',
      effects: {
        damage: 6
      },
      character: '王英',
      flavorText: 'テスト用の攻撃'
    }

    store.dispatch(playCard(attackCard))

    const stateAfterAttack = store.getState().game
    expect(stateAfterAttack.enemy?.block).toBe(2) // 8ブロック - 6ダメージ = 2ブロック
    expect(stateAfterAttack.enemy?.currentHp).toBe(50) // HPは減っていないはず

    mockRandom.mockRestore()
  })
})