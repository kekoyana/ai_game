import { GameState, Plantation } from '../types/game';

// ActionParams をエクスポート
export type ActionParams = {
  plantation?: Plantation;
  buildingType?: string;
  goodType?: string;
  shipIndex?: number;
  action?: 'discard' | 'ship';
};

const GOOD_PRICES = {
  corn: 0,
  indigo: 1,
  sugar: 2,
  tobacco: 3,
  coffee: 4
};

type RoleActionsReturnType = {
  canExecuteAction: boolean;
  executeAction: (params: ActionParams) => void;
  getActionDescription: () => string;
};

export const useRoleActions = (
  gameState: GameState,
  setGameState: (state: GameState) => void
): RoleActionsReturnType => {
  const currentPlayer = gameState.players[gameState.currentPlayer];

  const executePlantationAction = (selectedPlantation: Plantation) => {
    if (!currentPlayer) return;

    const newGameState = { ...gameState };
    const newPlayer = newGameState.players[gameState.currentPlayer];
    if (!newPlayer) return;

    // プランテーションを追加
    newPlayer.plantations.push({
      type: selectedPlantation.type,
      colonists: 0,
      maxColonists: 1
    });

    // 利用可能なプランテーションから削除
    newGameState.availablePlantations = newGameState.availablePlantations.filter(
      p => p !== selectedPlantation
    );

    setGameState(newGameState);
  };

  const executeMayorAction = () => {
    if (!currentPlayer) return;

    const newGameState = { ...gameState };
    const colonistsPerPlayer = Math.floor(gameState.colonistsOnShip / gameState.players.length);
    let remainingColonists = gameState.colonistsOnShip % gameState.players.length;

    // 入植者を分配
    newGameState.players = newGameState.players.map((player, index) => {
      const extraColonist = index === gameState.currentPlayer ? 1 : 0;
      const bonus = remainingColonists > 0 ? 1 : 0;
      remainingColonists--;

      return {
        ...player,
        colonists: player.colonists + colonistsPerPlayer + extraColonist + bonus
      };
    });

    newGameState.colonistsOnShip = 0;
    setGameState(newGameState);
  };

  const executeProductionAction = () => {
    if (!currentPlayer) return;

    const newGameState = { ...gameState };
    const newPlayer = newGameState.players[gameState.currentPlayer];
    if (!newPlayer) return;

    // 各プランテーションでの生産をチェック
    newPlayer.plantations.forEach(plantation => {
      if (plantation.colonists === 0) return;

      // 対応する生産施設を探す
      let canProduce = false;
      if (plantation.type === "corn") {
        // コーンは生産施設不要
        canProduce = true;
      } else {
        // 他の商品は対応する生産施設が必要
        const requiredFacilities = {
          "indigo": ["smallIndigoPlant", "indigoPlant"],
          "sugar": ["smallSugarMill", "sugarMill"],
          "tobacco": ["tobaccoStorage"],
          "coffee": ["coffeeRoaster"]
        };

        const facilities = requiredFacilities[plantation.type as keyof typeof requiredFacilities];
        if (facilities) {
          canProduce = newPlayer.buildings.some(building =>
            facilities.includes(building.type) && building.colonists > 0
          );
        }
      }

      if (canProduce) {
        // 生産可能な場合は商品を1つ追加
        const goodType = plantation.type as keyof typeof newPlayer.goods;
        newPlayer.goods[goodType]++;
      }
    });

    setGameState(newGameState);
  };

  const executeProspectorAction = () => {
    if (!currentPlayer) return;

    const newGameState = { ...gameState };
    const newPlayer = newGameState.players[gameState.currentPlayer];
    if (!newPlayer) return;

    newPlayer.money += 1;
    setGameState(newGameState);
  };

  const getActionDescription = (): string => {
    if (!gameState.selectedRole) return "";

    switch (gameState.selectedRole) {
      case "開拓者":
        return "プランテーションを1つ選択してください";
      case "市長":
        return "入植者を配置してください";
      case "建築家":
        return "建物を1つ建設してください";
      case "監督":
        return "商品を生産します";
      case "商人":
        return "商品を売却してください";
      case "船長":
        return "商品を出荷してください";
      case "金鉱掘り":
        return "1ドブロンを獲得します";
      default:
        return "";
    }
  };

  const canExecuteAction = (): boolean => {
    if (!gameState.selectedRole || !currentPlayer) return false;

    switch (gameState.selectedRole) {
      case "開拓者":
        return gameState.availablePlantations.length > 0;
      case "市長":
        return gameState.colonistsOnShip > 0;
      case "建築家":
        return currentPlayer.money > 0;
      case "監督":
        return currentPlayer.plantations.some(p => p.colonists > 0);
      case "商人":
        return Object.values(currentPlayer.goods).some(amount => amount > 0);
      case "船長":
        return Object.values(currentPlayer.goods).some(amount => amount > 0);
      case "金鉱掘り":
        return true;
      default:
        return false;
    }
  };

  const executeAction = (params: ActionParams): void => {
    if (!gameState.selectedRole || !currentPlayer) return;

    switch (gameState.selectedRole) {
      case "開拓者":
        if (params.plantation) {
          executePlantationAction(params.plantation);
        }
        break;
      case "市長":
        executeMayorAction();
        break;
      case "監督":
        executeProductionAction();
        break;
      case "商人":
        if (params.goodType) {
          const newGameState = { ...gameState };
          const newPlayer = newGameState.players[gameState.currentPlayer];
          if (!newPlayer) return;

          const goodType = params.goodType as keyof typeof GOOD_PRICES;
          const basePrice = GOOD_PRICES[goodType];
          const bonusPrice = gameState.selectedRole === "商人" ? 1 : 0;
          const totalPrice = basePrice + bonusPrice;

          // 商品を1つ減らし、お金を得る
          newPlayer.goods[goodType]--;
          newPlayer.money += totalPrice;

          // 商船に商品を設定
          newGameState.tradeShip = {
            cargo: params.goodType,
            value: totalPrice
          };

          setGameState(newGameState);
        }
        break;
      case "船長":
        if (params.goodType && typeof params.shipIndex === 'number') {
          const newGameState = { ...gameState };
          const newPlayer = newGameState.players[gameState.currentPlayer];
          if (!newPlayer) return;

          const ship = newGameState.ships[params.shipIndex];
          if (!ship) return;

          // 商品を1つ減らし、船に積む
          const goodType = params.goodType as keyof typeof newPlayer.goods;
          newPlayer.goods[goodType]--;

          ship.cargo = params.goodType;
          ship.filled++;

          // 勝利点を加算（船長は最初の出荷でボーナス点）
          const victoryPoints = 1 + (gameState.selectedRole === "船長" &&
            newGameState.ships.every(s => s.filled === 0) ? 1 : 0);
          newPlayer.victoryPoints += victoryPoints;
          newGameState.victoryPointsRemaining -= victoryPoints;

          setGameState(newGameState);
        } else if (params.action === 'discard' && params.goodType) {
          const newGameState = { ...gameState };
          const newPlayer = newGameState.players[gameState.currentPlayer];
          if (!newPlayer) return;

          // 商品を1つ廃棄
          const goodType = params.goodType as keyof typeof newPlayer.goods;
          if (newPlayer.goods[goodType] > 0) {
            newPlayer.goods[goodType]--;
          }

          setGameState(newGameState);
        }
        break;
      case "金鉱掘り":
        executeProspectorAction();
        break;
      // その他のアクションは順次実装
    }
  };

  return {
    canExecuteAction: canExecuteAction(),
    executeAction,
    getActionDescription
  };
};

export default useRoleActions;