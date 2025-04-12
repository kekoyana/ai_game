import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameFlow } from '../useGameFlow';
import { type GameState, type Player } from '../../types/game';

describe('useGameFlow', () => {
  const createTestPlayer = (override: Partial<Player> = {}): Player => ({
    id: 1,
    name: "Player 1",
    money: 2,
    victoryPoints: 0,
    goods: {
      corn: 0,
      indigo: 0,
      sugar: 0,
      tobacco: 0,
      coffee: 0
    },
    plantations: [],
    buildings: [],
    colonists: 1,
    ...override
  });

  const createTestGameState = (override: Partial<GameState> = {}): GameState => ({
    players: [createTestPlayer()],
    currentPlayer: 0,
    phase: "選択待ち",
    victoryPointsRemaining: 75,
    colonistsRemaining: 55,
    colonistsOnShip: 0,
    availablePlantations: [],
    availableRoles: [
      { role: "開拓者", money: 0, used: false },
      { role: "市長", money: 0, used: false }
    ],
    selectedRole: null,
    ships: [],
    tradeShip: { cargo: null, value: 0 },
    ...override
  });

  it('ラウンド終了を正しく判定する', () => {
    const state = createTestGameState({
      availableRoles: [
        { role: "開拓者", money: 0, used: true },
        { role: "市長", money: 0, used: true }
      ]
    });
    const setGameState = vi.fn();

    const { result } = renderHook(() => useGameFlow(state, setGameState));

    expect(result.current.isRoundEnd).toBe(true);
  });

  it('次のプレイヤーに手番を移動する', () => {
    const state = createTestGameState({
      players: [
        createTestPlayer({ id: 1, name: "Player 1" }),
        createTestPlayer({ id: 2, name: "Player 2" })
      ],
      currentPlayer: 0
    });
    const setGameState = vi.fn();

    const { result } = renderHook(() => useGameFlow(state, setGameState));

    act(() => {
      result.current.moveToNextPlayer();
    });

    expect(setGameState).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPlayer: 1
      })
    );
  });

  it('ラウンド終了時に未選択の役割カードにドブロンを追加し、すべての役割をリセットする', () => {
    const state = createTestGameState({
      players: [createTestPlayer()],
      availableRoles: [
        { role: "開拓者", money: 0, used: true },
        { role: "市長", money: 0, used: false }
      ],
      currentPlayer: 0
    });
    const setGameState = vi.fn();

    const { result } = renderHook(() => useGameFlow(state, setGameState));

    act(() => {
      result.current.moveToNextPlayer();
    });

    expect(setGameState).toHaveBeenCalledWith({
      ...state,
      availableRoles: [
        { role: "開拓者", money: 0, used: false },
        { role: "市長", money: 1, used: false }
      ],
      selectedRole: null,
      currentPlayer: 0
    });
  });

  describe('ゲーム終了条件', () => {
    it('勝利点が尽きた場合', () => {
      const state = createTestGameState({ victoryPointsRemaining: 0 });
      const { result } = renderHook(() => useGameFlow(state, vi.fn()));

      expect(result.current.gameEndState.isGameEnd).toBe(true);
      expect(result.current.gameEndState.reason).toBe("勝利点が尽きました");
    });

    it('入植者が不足している場合', () => {
      const state = createTestGameState({ colonistsRemaining: 0 });
      const { result } = renderHook(() => useGameFlow(state, vi.fn()));

      expect(result.current.gameEndState.isGameEnd).toBe(true);
      expect(result.current.gameEndState.reason).toBe("入植者が不足しています");
    });

    it('12区画の建物が建設された場合', () => {
      const state = createTestGameState({
        players: [createTestPlayer({
          buildings: Array.from({ length: 12 }, () => ({
            type: "smallIndigoPlant",
            colonists: 0,
            maxColonists: 1,
            victoryPoints: 1
          }))
        })]
      });
      const { result } = renderHook(() => useGameFlow(state, vi.fn()));

      expect(result.current.gameEndState.isGameEnd).toBe(true);
      expect(result.current.gameEndState.reason).toBe("12区画の建物が建設されました");
    });
  });
});