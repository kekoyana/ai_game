import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import BattleScreen from '../components/BattleScreen'
import { Card } from '../data/cards'
import battleReducer from '../store/slices/battleSlice'
import gameGeneralReducer from '../store/slices/gameGeneralSlice'

// モックデータ
const mockForgeCard: Card = {
  id: `forge_${Date.now()}`,  // ユニークなIDを生成
  name: '鍛冶',
  cost: 1,
  type: 'skill',
  rarity: 'C',
  description: '5ブロックを得る。戦闘終了まで手札のカード1枚をアップグレードする。',
  effects: { block: 5 },
  character: '金銭豹子 湯隆'
}

const mockNormalCard: Card = {
  id: 'attack_test',
  name: 'テスト攻撃',
  cost: 1,
  type: 'attack',
  rarity: 'C',
  description: '6ダメージを与える',
  effects: { damage: 6 },
  character: 'テストキャラクター'
}

const mockCharacter = {
  id: 'test',
  name: 'テストプレイヤー',
  maxHp: 80,
  currentHp: 80,
  block: 0,
  strength: 0,
  dexterity: 0
}

// テストストアの初期状態
const testBattleState = {
  enemy: null,
  hand: [],
  drawPile: [],
  discardPile: [],
  energy: { current: 3, max: 3 },
  isInBattle: true,
  turnNumber: 0,
  activePowers: [],
  activeSkills: [],
  incomingDamage: 0,
  tempUpgradedCards: [],
  isSelectingCardForUpgrade: false
}

const testGameGeneralState = {
  player: mockCharacter,
  deck: [],
  gold: 0,
  relics: [],
  isGameOver: false,
  isGameCleared: false,
  canSpendGold: false,
  goldMultiplier: 1,
  healingMultiplier: 1,
  isSelectingCardToUpgrade: false
}

// テスト用のストアを作成
const createTestStore = () => configureStore({
  reducer: {
    battle: battleReducer,
    gameGeneral: gameGeneralReducer
  },
  preloadedState: {
    battle: testBattleState,
    gameGeneral: testGameGeneralState
  }
})

// テストケース
describe('BattleScreen', () => {
  it('鍛冶カード使用時にアップグレード選択UIが表示される', () => {
    console.log('=== Test: 鍛冶カード使用時のUI表示 ===')
    
    const store = createTestStore()
    const mockOnPlayCard = vi.fn()
    const mockOnEndTurn = vi.fn()

    const { container } = render(
      <Provider store={store}>
        <BattleScreen
          enemy={mockCharacter}
          player={mockCharacter}
          energy={{ current: 3, max: 3 }}
          hand={[mockForgeCard, mockNormalCard]}
          turnNumber={1}
          onEndTurn={mockOnEndTurn}
          onPlayCard={mockOnPlayCard}
        />
      </Provider>
    )

    // 初期状態では選択UIは表示されていない
    expect(screen.queryByText('一時的にアップグレードするカードを選択')).toBeNull()
    console.log('初期状態: 選択UIは非表示')

    // 鍛冶カードをクリック
    const forgeCard = screen.getByText('鍛冶')
    console.log('鍛冶カードをクリック')
    fireEvent.click(forgeCard)

    // 選択UIが表示されることを確認
    const upgradeUI = screen.getByText('一時的にアップグレードするカードを選択')
    expect(upgradeUI).toBeInTheDocument()
    console.log('選択UIが表示された')

    // 通常カードが選択可能なことを確認
    const normalCard = screen.getAllByText('テスト攻撃')[0]
    expect(normalCard).toBeInTheDocument()
    console.log('通常カードが選択可能')
  })

  it('アップグレード選択後に正しく処理が実行される', () => {
    console.log('=== Test: アップグレード選択後の処理 ===')
    
    const store = createTestStore()
    const mockOnPlayCard = vi.fn()
    const mockOnEndTurn = vi.fn()

    const { container } = render(
      <Provider store={store}>
        <BattleScreen
          enemy={mockCharacter}
          player={mockCharacter}
          energy={{ current: 3, max: 3 }}
          hand={[mockForgeCard, mockNormalCard]}
          turnNumber={1}
          onEndTurn={mockOnEndTurn}
          onPlayCard={mockOnPlayCard}
        />
      </Provider>
    )

    // 鍛冶カードをクリック
    const forgeCard = screen.getByText('鍛冶')
    console.log('鍛冶カードをクリック')
    fireEvent.click(forgeCard)

    // 通常カードを選択
    const normalCard = screen.getAllByText('テスト攻撃')[0]
    console.log('通常カードを選択')
    fireEvent.click(normalCard)

    // onPlayCardが1回呼ばれることを確認
    expect(mockOnPlayCard).toHaveBeenCalledTimes(1)
    console.log('onPlayCard呼び出し回数:', mockOnPlayCard.mock.calls.length)
  })
})