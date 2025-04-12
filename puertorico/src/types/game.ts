export type Player = {
  id: number;
  name: string;
  money: number;
  victoryPoints: number;
  goods: {
    corn: number;
    indigo: number;
    sugar: number;
    tobacco: number;
    coffee: number;
  };
  plantations: string[];
  buildings: string[];
  colonists: number;
};

export type Ship = {
  cargo: string;
  capacity: number;
  filled: number;
};

export type Role = "開拓者" | "市長" | "建築家" | "監督" | "商人" | "船長" | "金鉱掘り";

export type GameState = {
  players: Player[];
  currentPlayer: number;
  phase: string;
  victoryPointsRemaining: number;
  colonistsRemaining: number;
  colonistsOnShip: number;
  availablePlantations: string[];
  availableRoles: Role[];
  ships: Ship[];
  tradeShip: {
    cargo: string | null;
    value: number;
  };
};