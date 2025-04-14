// src/store/__tests__/gameReducer.test.ts
import { gameReducer } from '../gameReducer';
import { createInitialGameState, PlayerState, GameState } from '../gameStore';
import { mockCards } from '../../__mocks__/cardMocks';
import { validateGameState } from '../../test-utils';
import { BuildingCard } from '../../data/cards';

describe('gameReducer', () => {
  // 初期状態のセットアップ用ヘルパー関数
  const setupInitialState = () => {
    const state = createInitialGameState();
    // テスト用にプレイヤーとカードを固定
    return {
      ...state,
      players: [
        {
          id: 'player1',
          isHuman: true,
          hand: [
            { ...mockCards.indigo_plant, id: 'card1' },
            { ...mockCards.sugar_mill, id: 'card2' },
            { ...mockCards.tobacco_storage, id: 'card3' },
          ],
          buildings: [
            { ...mockCards.indigo_plant, id: 'building1' },
          ],
          goods: { building1: null } as Record<string, BuildingCard | null>,
          vpChips: 0
        } as PlayerState,
        {
          id: 'player2',
          isHuman: false,
          hand: [],
          buildings: [],
          goods: {} as Record<string, BuildingCard | null>,
          vpChips: 0
        }
      ],
      currentPlayerId: 'player1',
      governorPlayerId: 'player1',
    };
  };

  describe('SELECT_ROLE action', () => {
    it('役職を選択してゲームフェーズを更新すること', () => {
      const state = setupInitialState();
      const action = {
        type: 'SELECT_ROLE' as const,
        params: { role: 'builder' as const }
      };

      const newState = gameReducer(state, action);

      expect(validateGameState(newState)).toBe(true);
      expect(newState.selectedRole).toBe('builder');
      expect(newState.currentRoundRoles).toContain('builder');
      expect(newState.gamePhase).toBe('action');
    });
  });

  describe('BUILD action', () => {
    it('建物を建設し、支払いカードを除去すること', () => {
      const state = setupInitialState();
      const action = {
        type: 'BUILD' as const,
        params: {
          playerId: 'player1',
          buildingCard: { ...mockCards.sugar_mill, id: 'card2' },
          paymentCardIds: ['card1'],
          targetBuildingId: undefined
        }
      };

      const newState = gameReducer(state, action);
      const player = newState.players.find(p => p.id === 'player1')!;

      expect(player.buildings).toHaveLength(2);
      expect(player.buildings[1].id).toBe('card2');
      expect(player.hand).toHaveLength(1);
      expect(player.goods[player.buildings[1].id]).toBeNull();
    });

    it('クレーンによる建て替えを処理すること', () => {
      const state = setupInitialState();
      const action = {
        type: 'BUILD' as const,
        params: {
          playerId: 'player1',
          buildingCard: { ...mockCards.sugar_mill, id: 'card2' },
          paymentCardIds: [],
          targetBuildingId: 'building1'
        }
      };

      const newState = gameReducer(state, action);
      const player = newState.players.find(p => p.id === 'player1')!;

      expect(player.buildings).toHaveLength(1);
      expect(player.buildings[0].id).toBe('card2');
      expect(player.goods[player.buildings[0].id]).toBeNull();
    });
  });

  describe('PRODUCE action', () => {
    it('生産施設に商品を追加すること', () => {
      const state = setupInitialState();
      const action = {
        type: 'PRODUCE' as const,
        params: {
          playerId: 'player1',
          productionBuildingIds: ['building1']
        }
      };

      const newState = gameReducer(state, action);
      const player = newState.players.find(p => p.id === 'player1')!;

      expect(player.goods['building1']).not.toBeNull();
    });
  });

  describe('TRADE action', () => {
    it('商品を売却してカードを引くこと', () => {
      const state = {
        ...setupInitialState(),
        currentTradingHouseTile: {
          id: 'tile1',
          prices: {
            indigo: 1,
            sugar: 1,
            tobacco: 2,
            coffee: 2,
            silver: 3
          }
        }
      };

      // まず商品を生産
      let newState = gameReducer(state, {
        type: 'PRODUCE' as const,
        params: {
          playerId: 'player1',
          productionBuildingIds: ['building1']
        }
      });

      // 商品を売却
      newState = gameReducer(newState, {
        type: 'TRADE' as const,
        params: {
          playerId: 'player1',
          goodsBuildingIds: ['building1']
        }
      });

      const player = newState.players.find(p => p.id === 'player1')!;

      expect(player.goods['building1']).toBeNull();
      expect(player.hand.length).toBeGreaterThan(state.players[0].hand.length);
    });
  });

  describe('COUNCIL_DRAW and COUNCIL_KEEP actions', () => {
    it('カードを引いて選択したカードを保持すること', () => {
      const state = setupInitialState();
      
      // カードを引く
      let newState = gameReducer(state, {
        type: 'COUNCIL_DRAW' as const,
        params: { playerId: 'player1' }
      });

      const player = newState.players.find(p => p.id === 'player1')!;
      const initialHandSize = state.players[0].hand.length;
      expect(player.hand.length).toBe(initialHandSize + 5);

      // カードを選択して保持
      const keepCardIds = [player.hand[0].id];
      const discardCardIds = player.hand.slice(1).map(c => c.id);

      newState = gameReducer(newState, {
        type: 'COUNCIL_KEEP' as const,
        params: {
          playerId: 'player1',
          keepCardIds,
          discardCardIds
        }
      });

      const updatedPlayer = newState.players.find(p => p.id === 'player1')!;
      expect(updatedPlayer.hand.length).toBe(1);
      expect(updatedPlayer.hand[0].id).toBe(keepCardIds[0]);
    });
  });
describe('PROSPECTOR_DRAW action', () => {
  it('特権を持つプレイヤーのみがカードを引けること', () => {
    let state = setupInitialState();
    const initialHandSize = state.players[0].hand.length;

    // まず役割を選択
    state = gameReducer(state, {
      type: 'SELECT_ROLE',
      params: { role: 'prospector' as const }
    });

    expect(state.selectedRole).toBe('prospector');
    expect(state.gamePhase).toBe('action');

    // 特権を持つプレイヤーの場合（現在のプレイヤー）
    state = gameReducer(state, {
      type: 'PROSPECTOR_DRAW',
      params: { playerId: 'player1' }
    });

    const privilegedPlayer = state.players.find(p => p.id === 'player1')!;
    expect(privilegedPlayer.hand.length).toBe(initialHandSize + 1);

    // 特権を持たないプレイヤーの場合
    state = gameReducer(state, {
      type: 'PROSPECTOR_DRAW',
      params: { playerId: 'player2' }
    });

    const nonPrivilegedPlayer = state.players.find(p => p.id === 'player2')!;
    expect(nonPrivilegedPlayer.hand.length).toBe(0);
  });
});

  describe('CPU auto actions', () => {
    const setupMultiPlayerState = () => {
      const state = createInitialGameState();
      return {
        ...state,
        players: [
          {
            id: 'player',
            isHuman: true,
            hand: [
              { ...mockCards.indigo_plant, id: 'card1' },
              { ...mockCards.sugar_mill, id: 'card2' },
              { ...mockCards.tobacco_storage, id: 'card3' },
            ],
            buildings: [{ ...mockCards.indigo_plant, id: 'building1' }],
            goods: { building1: null } as Record<string, BuildingCard | null>,
            vpChips: 0
          } as PlayerState,
          {
            id: 'cpu1',
            isHuman: false,
            hand: [
              { ...mockCards.indigo_plant, id: 'cpu1_card1' },
              { ...mockCards.sugar_mill, id: 'cpu1_card2' },
            ],
            buildings: [{ ...mockCards.indigo_plant, id: 'cpu1_building1' }],
            goods: { cpu1_building1: null } as Record<string, BuildingCard | null>,
            vpChips: 0
          } as PlayerState,
          {
            id: 'cpu2',
            isHuman: false,
            hand: [
              { ...mockCards.indigo_plant, id: 'cpu2_card1' },
              { ...mockCards.sugar_mill, id: 'cpu2_card2' },
            ],
            buildings: [{ ...mockCards.indigo_plant, id: 'cpu2_building1' }],
            goods: { cpu2_building1: null } as Record<string, BuildingCard | null>,
            vpChips: 0
          } as PlayerState,
          {
            id: 'cpu3',
            isHuman: false,
            hand: [
              { ...mockCards.indigo_plant, id: 'cpu3_card1' },
              { ...mockCards.sugar_mill, id: 'cpu3_card2' },
            ],
            buildings: [{ ...mockCards.indigo_plant, id: 'cpu3_building1' }],
            goods: { cpu3_building1: null } as Record<string, BuildingCard | null>,
            vpChips: 0
          } as PlayerState
        ],
        currentPlayerId: 'player',
        governorPlayerId: 'player',
        tradingHouseTiles: [{
          id: 'tile1',
          prices: {
            indigo: 1,
            sugar: 2,
            tobacco: 3,
            coffee: 4,
            silver: 5
          }
        }],
        currentTradingHouseTile: {
          id: 'tile1',
          prices: {
            indigo: 1,
            sugar: 2,
            tobacco: 3,
            coffee: 4,
            silver: 5
          }
        }
      } as GameState;
    };

    it('プレイヤーの建設後にCPUのアクションを処理すること', () => {
      // 初期状態を設定
      let state = setupMultiPlayerState();

      // 初期状態の確認
      const beforeBuild = state.players.map(p => ({
        id: p.id,
        buildingCount: p.buildings.length
      }));

      // プレイヤーが建設家を選択
      state = gameReducer(state, {
        type: 'SELECT_ROLE',
        params: { role: 'builder' as const }
      });

      expect(state.selectedRole).toBe('builder');
      expect(state.gamePhase).toBe('action');

      // プレイヤーが建物を建設
      state = gameReducer(state, {
        type: 'BUILD',
        params: {
          playerId: 'player',
          buildingCard: { ...mockCards.sugar_mill, id: 'card2' },
          paymentCardIds: ['card1']
        }
      });

      // 各プレイヤーの建物数の変化を確認
      const afterBuild = state.players.map(p => ({
        id: p.id,
        buildingCount: p.buildings.length
      }));

      // プレイヤーの建物が1つ増えていることを確認
      const playerBefore = beforeBuild.find(p => p.id === 'player')!;
      const playerAfter = afterBuild.find(p => p.id === 'player')!;
      expect(playerAfter.buildingCount).toBe(playerBefore.buildingCount + 1);

      // 各CPUプレイヤーの建物が増えていることを確認
      ['cpu1', 'cpu2', 'cpu3'].forEach(cpuId => {
        const cpuBefore = beforeBuild.find(p => p.id === cpuId)!;
        const cpuAfter = afterBuild.find(p => p.id === cpuId)!;
        expect(cpuAfter.buildingCount).toBe(cpuBefore.buildingCount + 1);
      });

      // ラウンドが終了していることを確認
      expect(state.gamePhase).toBe('end_round');
    });

    it('CPUの手番で自動的にアクションを実行すること', () => {
      let state = setupMultiPlayerState();
      state = { ...state, currentPlayerId: 'cpu1' };

      // CPU1の初期状態を確認
      const cpu1Before = state.players.find(p => p.id === 'cpu1')!;
      expect(cpu1Before.buildings.length).toBe(1);

      // CPU1が役割を選択
      state = gameReducer(state, {
        type: 'SELECT_ROLE',
        params: { role: 'builder' as const }
      });

      // CPUが役割を選択すると、関連する全CPUのアクションが実行され、ラウンド終了フェーズになる
      expect(state.selectedRole).toBe('builder');
      expect(state.gamePhase).toBe('end_round');

      // CPU1の行動が自動実行されていることを確認
      const cpu1After = state.players.find(p => p.id === 'cpu1')!;
      expect(cpu1After.buildings.length).toBe(2); // 建物が1つ増えている
      
      // ラウンド終了なので、次のプレイヤーは総督（'player'）になっているはず
      expect(state.currentPlayerId).toBe('player');

      // CPU2の行動も自動実行されていることを確認
      const cpu2After = state.players.find(p => p.id === 'cpu2')!;
      expect(cpu2After.buildings.length).toBe(2); // 建物が1つ増えている

      // CPU3の行動も自動実行されていることを確認
      const cpu3After = state.players.find(p => p.id === 'cpu3')!;
      expect(cpu3After.buildings.length).toBe(2); // 建物が1つ増えている
    });
  });
});