// src/store/GameContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, createInitialGameState, Role } from './gameStore';
import { gameReducer } from './gameReducer';
import { GameAction } from './gameActions';
import { BuildingCard } from '../data/cards';

// コンテキストの型定義
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

// コンテキストの作成
export const GameContext = createContext<GameContextType | undefined>(undefined);

// プロバイダーコンポーネント
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState());

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// カスタムフック
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// 便利なアクション関数
export function useGameActions() {
  const { dispatch } = useGame();

  return {
    selectRole: (role: Role) => {
      dispatch({
        type: 'SELECT_ROLE',
        params: { role }
      });
    },

    buildBuilding: (
      playerId: string,
      buildingCard: BuildingCard,
      paymentCardIds: string[],
      targetBuildingId?: string
    ) => {
      dispatch({
        type: 'BUILD',
        params: {
          playerId,
          buildingCard,
          paymentCardIds,
          targetBuildingId
        }
      });
    },

    produceGoods: (playerId: string, productionBuildingIds: string[]) => {
      dispatch({
        type: 'PRODUCE',
        params: {
          playerId,
          productionBuildingIds
        }
      });
    },

    tradeGoods: (playerId: string, goodsBuildingIds: string[]) => {
      dispatch({
        type: 'TRADE',
        params: {
          playerId,
          goodsBuildingIds
        }
      });
    },

    drawCouncilCards: (playerId: string) => {
      dispatch({
        type: 'COUNCIL_DRAW',
        params: { playerId }
      });
    },

    keepCouncilCards: (
      playerId: string,
      keepCardIds: string[],
      discardCardIds: string[]
    ) => {
      dispatch({
        type: 'COUNCIL_KEEP',
        params: {
          playerId,
          keepCardIds,
          discardCardIds
        }
      });
    },

    prospectorDraw: (playerId: string) => {
      dispatch({
        type: 'PROSPECTOR_DRAW',
        params: { playerId }
      });
    },

    pass: (playerId: string) => {
      dispatch({
        type: 'PASS',
        params: { playerId }
      });
    },

    endAction: () => {
      dispatch({
        type: 'END_ACTION',
        params: {}
      });
    },

    endRound: () => {
      dispatch({
        type: 'END_ROUND',
        params: {}
      });
    },

    endGame: () => {
      dispatch({
        type: 'END_GAME',
        params: {}
      });
    }
  };
}