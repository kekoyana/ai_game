import { Atmosphere } from './persuasion';

export interface GameAction {
  type: 'UPDATE_STATE';
  payload: {
    atmosphere: Atmosphere;
    situation: number;
    turn: number;
    isPlayerTurn: boolean;
  };
}

export type GameDispatch = (action: GameAction) => void;