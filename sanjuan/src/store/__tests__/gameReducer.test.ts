// src/store/__tests__/gameReducer.test.ts
import { gameReducer } from '../gameReducer';
import { createInitialGameState, PlayerState } from '../gameStore';
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
    it('should select a role and update game phase', () => {
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
    it('should build a building and remove payment cards', () => {
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

    it('should handle crane replacement', () => {
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
    it('should add goods to production buildings', () => {
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
    it('should sell goods and draw cards', () => {
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
    it('should draw cards and then keep selected ones', () => {
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
    it('should draw a card for privileged player only', () => {
      const state = setupInitialState();
      const initialHandSize = state.players[0].hand.length;

      // 特権を持つプレイヤーの場合
      let newState = gameReducer(state, {
        type: 'PROSPECTOR_DRAW' as const,
        params: { playerId: 'player1' }
      });

      const privilegedPlayer = newState.players.find(p => p.id === 'player1')!;
      expect(privilegedPlayer.hand.length).toBe(initialHandSize + 1);

      // 特権を持たないプレイヤーの場合
      newState = gameReducer(newState, {
        type: 'PROSPECTOR_DRAW' as const,
        params: { playerId: 'player2' }
      });

      const nonPrivilegedPlayer = newState.players.find(p => p.id === 'player2')!;
      expect(nonPrivilegedPlayer.hand.length).toBe(0);
    });
  });
});