// src/components/__tests__/Actions.test.tsx
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameContext } from '../../store/GameContext';
import Actions from '../Actions';
import { jest } from '@jest/globals';
import { createInitialGameState } from '../../store/gameStore';

// モックのゲーム状態
const mockGameState = createInitialGameState();

// モックのディスパッチ関数
const mockDispatch = jest.fn();

// カスタムレンダリング関数
const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <GameContext.Provider value={{ state: mockGameState, dispatch: mockDispatch }}>
      {ui}
    </GameContext.Provider>
  );
};

describe('Actions component', () => {
  beforeEach(() => {
    // 各テストの前にモックをリセット
    mockDispatch.mockClear();
  });

  it('should render role selection buttons when in role_selection phase', () => {
    renderWithProvider(<Actions />);
    
    // 役割選択ボタンが表示されていることを確認
    expect(screen.getByText('建築士')).toBeInTheDocument();
    expect(screen.getByText('監督')).toBeInTheDocument();
    // ... 他の役割ボタンも同様に確認
  });

  it('should dispatch SELECT_ROLE action when a role button is clicked', () => {
    renderWithProvider(<Actions />);
    
    // 建築士ボタンをクリック
    fireEvent.click(screen.getByText('建築士'));
    
    // 正しいアクションがディスパッチされたか確認
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SELECT_ROLE',
      params: { role: 'builder' }
    });
  });

  // TODO: アクション実行フェーズのテストを追加
  // TODO: ラウンド終了フェーズのテストを追加
});