import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoleActions } from '../useRoleActions';
import { type GameState } from '../../types/game';

describe('useRoleActions', () => {
  const createTestGameState = (): GameState => ({
    players: [
      {
        id: 1,
        name: "Player 1",
        money: 2,
        victoryPoints: 0,
        goods: {
          corn: 1,
          indigo: 1,
          sugar: 1,
          tobacco: 0,
          coffee: 0
        },
        plantations: [
          { type: "corn", colonists: 1, maxColonists: 1 },
          { type: "indigo", colonists: 1, maxColonists: 1 }
        ],
        buildings: [
          { type: "smallIndigoPlant", colonists: 1, maxColonists: 1, victoryPoints: 1 }
        ],
        colonists: 1
      }
    ],
    currentPlayer: 0,
    phase: "選択待ち",
    victoryPointsRemaining: 75,
    colonistsRemaining: 55,
    colonistsOnShip: 0,
    availablePlantations: [
      { type: "corn", colonists: 0, maxColonists: 1 }
    ],
    availableRoles: [
      { role: "開拓者", money: 0, used: false },
      { role: "市長", money: 0, used: false }
    ],
    selectedRole: "開拓者",
    ships: [
      { cargo: "", capacity: 4, filled: 0 }
    ],
    tradeShip: {
      cargo: null,
      value: 0
    }
  });

  it('開拓者アクションを正しく実行できる', () => {
    const initialState = createTestGameState();
    const setGameState = vi.fn();

    const { result } = renderHook(() => useRoleActions(initialState, setGameState));

    expect(result.current.canExecuteAction).toBe(true);

    act(() => {
      result.current.executeAction({
        plantation: initialState.availablePlantations[0]
      });
    });

    expect(setGameState).toHaveBeenCalledWith(expect.objectContaining({
      players: expect.arrayContaining([
        expect.objectContaining({
          plantations: expect.arrayContaining([
            expect.objectContaining({ type: 'corn' })
          ])
        })
      ]),
      availablePlantations: expect.arrayContaining([])
    }));
  });

  it('生産アクションで適切に商品を生産できる', () => {
    const initialState = createTestGameState();
    initialState.selectedRole = "監督";
    const setGameState = vi.fn();

    const { result } = renderHook(() => useRoleActions(initialState, setGameState));

    expect(result.current.canExecuteAction).toBe(true);

    act(() => {
      result.current.executeAction({});
    });

    expect(setGameState).toHaveBeenCalledWith(expect.objectContaining({
      players: expect.arrayContaining([
        expect.objectContaining({
          goods: expect.objectContaining({
            corn: 2,  // コーンプランテーションから1つ生産
            indigo: 2 // インディゴ工場から1つ生産
          })
        })
      ])
    }));
  });

  it('商人アクションで商品を売却できる', () => {
    const initialState = createTestGameState();
    initialState.selectedRole = "商人";
    const setGameState = vi.fn();

    const { result } = renderHook(() => useRoleActions(initialState, setGameState));

    expect(result.current.canExecuteAction).toBe(true);

    act(() => {
      result.current.executeAction({ goodType: 'corn' });
    });

    expect(setGameState).toHaveBeenCalledWith(expect.objectContaining({
      players: expect.arrayContaining([
        expect.objectContaining({
          goods: expect.objectContaining({ corn: 0 }),
          money: expect.any(Number)
        })
      ]),
      tradeShip: expect.objectContaining({
        cargo: 'corn'
      })
    }));
  });

  it('アクション説明が正しく返される', () => {
    const initialState = createTestGameState();
    const setGameState = vi.fn();

    initialState.selectedRole = "開拓者";
    const { result } = renderHook(() => useRoleActions(initialState, setGameState));
    expect(result.current.getActionDescription()).toBe("プランテーションを1つ選択してください");

    initialState.selectedRole = "市長";
    const { result: result2 } = renderHook(() => useRoleActions(initialState, setGameState));
    expect(result2.current.getActionDescription()).toBe("入植者を配置してください");
  });
});