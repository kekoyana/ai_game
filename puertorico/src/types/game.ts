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
  plantations: Plantation[];
  buildings: Building[];
  colonists: number;
  isCPU?: boolean; // CPUプレイヤーフラグを追加
};

export type Plantation = {
  type: PlantationType;
  colonists: number;
  maxColonists: number;
};

export type PlantationType = "corn" | "indigo" | "sugar" | "tobacco" | "coffee" | "quarry";

export type Building = {
  type: BuildingType;
  colonists: number;
  maxColonists: number;
  victoryPoints: number;
};

export type BuildingType =
  | "smallIndigoPlant"
  | "smallSugarMill"
  | "smallMarket"
  | "hacienda"
  | "constructionHut"
  | "smallWarehouse"
  | "indigoPlant"
  | "sugarMill"
  | "hospice"
  | "office"
  | "largeMarket"
  | "largeWarehouse"
  | "tobaccoStorage"
  | "coffeeRoaster"
  | "factory"
  | "university"
  | "harbor"
  | "wharf"
  | "guildHall"
  | "residence"
  | "fortress"
  | "customsHouse"
  | "cityHall";

export type Ship = {
  cargo: string;
  capacity: number;
  filled: number;
};

export type Role = "開拓者" | "市長" | "建築家" | "監督" | "商人" | "船長" | "金鉱掘り";

export type RoleState = {
  role: Role;
  money: number;
  used: boolean;
};

export type GameState = {
  players: Player[];
  currentPlayer: number;
  phase: string;
  victoryPointsRemaining: number;
  colonistsRemaining: number;
  colonistsOnShip: number;
  availablePlantations: Plantation[];
  availableRoles: RoleState[];
  selectedRole: Role | null;
  ships: Ship[];
  tradeShip: {
    cargo: string | null;
    value: number;
  };
};

export const BUILDING_DETAILS: Record<BuildingType, {
  name: string;
  cost: number;
  victoryPoints: number;
  maxColonists: number;
}> = {
  smallIndigoPlant: { name: "インディゴ加工場(小)", cost: 1, victoryPoints: 1, maxColonists: 1 },
  smallSugarMill: { name: "砂糖加工場(小)", cost: 2, victoryPoints: 1, maxColonists: 1 },
  smallMarket: { name: "市場(小)", cost: 1, victoryPoints: 1, maxColonists: 1 },
  hacienda: { name: "農場", cost: 2, victoryPoints: 1, maxColonists: 1 },
  constructionHut: { name: "建築小屋", cost: 2, victoryPoints: 1, maxColonists: 1 },
  smallWarehouse: { name: "倉庫(小)", cost: 3, victoryPoints: 1, maxColonists: 1 },
  indigoPlant: { name: "インディゴ加工場(大)", cost: 3, victoryPoints: 2, maxColonists: 3 },
  sugarMill: { name: "砂糖加工場(大)", cost: 4, victoryPoints: 2, maxColonists: 3 },
  hospice: { name: "宿屋", cost: 4, victoryPoints: 2, maxColonists: 1 },
  office: { name: "商館", cost: 5, victoryPoints: 2, maxColonists: 1 },
  largeMarket: { name: "市場(大)", cost: 5, victoryPoints: 2, maxColonists: 1 },
  largeWarehouse: { name: "倉庫(大)", cost: 6, victoryPoints: 2, maxColonists: 1 },
  tobaccoStorage: { name: "タバコ加工場", cost: 5, victoryPoints: 3, maxColonists: 3 },
  coffeeRoaster: { name: "コーヒー加工場", cost: 6, victoryPoints: 3, maxColonists: 2 },
  factory: { name: "工場", cost: 7, victoryPoints: 3, maxColonists: 1 },
  university: { name: "大学", cost: 8, victoryPoints: 3, maxColonists: 1 },
  harbor: { name: "港", cost: 8, victoryPoints: 3, maxColonists: 1 },
  wharf: { name: "造船所", cost: 9, victoryPoints: 3, maxColonists: 1 },
  guildHall: { name: "ギルドホール", cost: 10, victoryPoints: 4, maxColonists: 1 },
  residence: { name: "公邸", cost: 10, victoryPoints: 4, maxColonists: 1 },
  fortress: { name: "砦", cost: 10, victoryPoints: 4, maxColonists: 1 },
  customsHouse: { name: "税関", cost: 10, victoryPoints: 4, maxColonists: 1 },
  cityHall: { name: "市役所", cost: 10, victoryPoints: 4, maxColonists: 1 }
};

export const PLANTATION_DETAILS: Record<PlantationType, {
  name: string;
  maxColonists: number;
}> = {
  corn: { name: "コーン", maxColonists: 1 },
  indigo: { name: "インディゴ", maxColonists: 1 },
  sugar: { name: "砂糖", maxColonists: 1 },
  tobacco: { name: "タバコ", maxColonists: 1 },
  coffee: { name: "コーヒー", maxColonists: 1 },
  quarry: { name: "採石場", maxColonists: 1 }
};