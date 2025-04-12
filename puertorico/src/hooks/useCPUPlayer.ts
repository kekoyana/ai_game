import { type GameState, type Role, type Plantation, type BuildingType, BUILDING_DETAILS } from '../types/game';
import { useRoleActions, type ActionParams } from './useRoleActions'; // ActionParams をインポート
import { useGameFlow } from './useGameFlow';

type CPUPlayerHookReturnType = {
  runCPUTurn: () => void;
};

export const useCPUPlayer = (
  gameState: GameState,
  setGameState: (state: GameState) => void
): CPUPlayerHookReturnType => {
  const { executeAction } = useRoleActions(gameState, setGameState);
  const { moveToNextPlayer } = useGameFlow(gameState, setGameState);
  const currentPlayer = gameState.players[gameState.currentPlayer];

  // CPUの役割選択ロジック（シンプルな戦略）
  const chooseBestRole = (): number => {
    const availableRoles = gameState.availableRoles.filter(r => !r.used);
    if (availableRoles.length === 0) return -1; // 選択可能な役割がない

    // 優先度: 建築家 > 監督 > 開拓者 > 商人 > 船長 > 市長 > 金鉱掘り
    const rolePriorities: Role[] = ["建築家", "監督", "開拓者", "商人", "船長", "市長", "金鉱掘り"];

    for (const priorityRole of rolePriorities) {
      const roleIndex = gameState.availableRoles.findIndex(r => r.role === priorityRole && !r.used);
      if (roleIndex !== -1) {
        return roleIndex;
      }
    }
    return gameState.availableRoles.findIndex(r => !r.used); // 見つからなければ最初に見つかった未使用の役割
  };

  // CPUの開拓者アクションロジック
  const chooseBestPlantation = (): Plantation | null => {
    if (gameState.availablePlantations.length === 0) return null;
    // とりあえず最初に見つかったプランテーションを選択
    return gameState.availablePlantations[0];
  };

  // CPUの建築家アクションロジック
  const chooseBestBuilding = (): BuildingType | null => {
    if (!currentPlayer) return null;
    const affordableBuildings = (Object.keys(BUILDING_DETAILS) as BuildingType[]).filter(type => {
      const details = BUILDING_DETAILS[type];
      const cost = details.cost; // TODO: 割引考慮
      return cost <= currentPlayer.money;
    });

    if (affordableBuildings.length === 0) return null;
    // とりあえず最初に見つかった手頃な建物を選択
    return affordableBuildings[0];
  };

  // CPUの商人アクションロジック
  const chooseBestGoodToSell = (): string | null => {
    if (!currentPlayer) return null;
    const sellableGoods = Object.entries(currentPlayer.goods)
      .filter(([type, amount]) => amount > 0 && gameState.tradeShip.cargo !== type)
      .sort(([, a], [, b]) => b - a); // 量が多いものを優先

    return sellableGoods.length > 0 ? sellableGoods[0][0] : null;
  };

  // CPUの船長アクションロジック
  const chooseBestShipping = (): { goodType: string; shipIndex: number } | null => {
    if (!currentPlayer) return null;

    for (const [goodType, amount] of Object.entries(currentPlayer.goods)) {
      if (amount > 0) {
        for (let i = 0; i < gameState.ships.length; i++) {
          const ship = gameState.ships[i];
          if (ship && ship.filled < ship.capacity && (ship.cargo === "" || ship.cargo === goodType)) {
            return { goodType, shipIndex: i };
          }
        }
      }
    }
    return null;
  };

  // CPUのターンを実行する関数
  const runCPUTurn = () => {
    if (!currentPlayer || !currentPlayer.isCPU) return;

    console.log(`CPU ${currentPlayer.name} のターン開始`);

    // 1. 役割選択
    const roleIndex = chooseBestRole();
    if (roleIndex === -1) {
      console.log("CPU: 選択可能な役割がありません");
      moveToNextPlayer(); // 役割がなければ次のプレイヤーへ
      return;
    }
    const selectedRoleState = gameState.availableRoles[roleIndex];
    if (!selectedRoleState) return;

    console.log(`CPU: ${selectedRoleState.role} を選択`);

    // 役割選択の実行（状態更新）
    const tempGameState = { ...gameState };
    const tempPlayer = tempGameState.players[gameState.currentPlayer];
    if (!tempPlayer) return;
    tempPlayer.money += selectedRoleState.money;
    tempGameState.availableRoles[roleIndex].used = true;
    tempGameState.selectedRole = selectedRoleState.role;
    setGameState(tempGameState); // 役割選択を反映

    // 2. 役割アクションの実行（少し遅延させる）
    setTimeout(() => {
      let actionParams: ActionParams = {}; // 型を ActionParams に修正
      let shouldMoveToNext = true; // アクション後に次のプレイヤーに移るか

      switch (selectedRoleState.role) {
        case "開拓者": { // ブロックで囲む
          const plantation = chooseBestPlantation();
          if (plantation) {
            console.log(`CPU: ${plantation.type} プランテーションを選択`);
            actionParams = { plantation };
            executeAction(actionParams); // executeActionを呼ぶように修正
            shouldMoveToNext = true; // 開拓者はアクション後すぐに次へ
          } else {
            console.log("CPU: 選択可能なプランテーションがありません");
            shouldMoveToNext = true; // アクションできないので次へ
          }
          break;
        }
        case "建築家": { // ブロックで囲む
          const buildingType = chooseBestBuilding();
          if (buildingType) {
            const details = BUILDING_DETAILS[buildingType];
            const cost = details.cost; // TODO: 割引
            if (tempPlayer.money >= cost) {
              console.log(`CPU: ${buildingType} を建設`);
              // executeActionに任せるのではなく、ここで状態を直接更新する（仮実装）
              tempPlayer.money -= cost;
              tempPlayer.buildings.push({ type: buildingType, colonists: 0, maxColonists: details.maxColonists, victoryPoints: details.victoryPoints });
              setGameState({...tempGameState}); // 状態更新
              shouldMoveToNext = true; // 成功したら次へ
            } else {
               console.log("CPU: お金が足りません");
               shouldMoveToNext = true; // 買えなければ次へ
            }
          } else {
            console.log("CPU: 建設可能な建物がありません");
            shouldMoveToNext = true;
          }
          break;
        }
        case "監督":
          console.log("CPU: 生産を実行");
          executeAction({}); // 生産アクション実行
          shouldMoveToNext = true;
          break;
        case "商人": { // ブロックで囲む
          const goodToSell = chooseBestGoodToSell();
          if (goodToSell) {
            console.log(`CPU: ${goodToSell} を売却`);
            actionParams = { goodType: goodToSell };
            executeAction(actionParams); // 売却アクション実行
          } else {
            console.log("CPU: 売却可能な商品がありません");
          }
          shouldMoveToNext = true;
          break;
        }
        case "船長": { // ブロックで囲む
          const shippingChoice = chooseBestShipping();
          if (shippingChoice) {
            console.log(`CPU: ${shippingChoice.goodType} を船 ${shippingChoice.shipIndex + 1} に出荷`);
            actionParams = shippingChoice;
            executeAction(actionParams); // 出荷アクション実行
            // TODO: 続けて出荷できるか、保管フェーズに移るかの判断が必要
            shouldMoveToNext = false; // 続けて出荷する可能性があるので一旦停止
            // 仮実装: 1回出荷したら保管フェーズへ
             setTimeout(() => {
                 console.log("CPU: 保管フェーズ（仮）");
                 // TODO: 保管ロジック
                 moveToNextPlayer();
             }, 500);

          } else {
            console.log("CPU: 出荷可能な商品がありません");
            shouldMoveToNext = true;
          }
          break;
        }
        case "金鉱掘り":
          console.log("CPU: 金鉱掘りアクション");
          executeAction({}); // 金鉱掘りアクション実行
          shouldMoveToNext = true;
          break;
        case "市長":
           console.log("CPU: 市長アクション（入植者配置 - 未実装）");
           // TODO: 入植者配置ロジック
           executeAction({}); // 仮でアクションを実行
           shouldMoveToNext = true;
           break;
      }

      // アクション実行後、必要なら次のプレイヤーへ
      if (shouldMoveToNext) {
        moveToNextPlayer();
      }
    }, 1000); // 1秒遅延
  };

  return { runCPUTurn };
};