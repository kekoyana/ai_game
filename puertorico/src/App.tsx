import { useState, useEffect } from 'react' // useEffect をインポート
import './App.css'
import {
  type GameState,
  type BuildingType,
  BUILDING_DETAILS
} from './types/game'
import Plantation from './components/Plantation'
import Building from './components/Building'
import RoleCard from './components/RoleCard'
import PlantationSelection from './components/PlantationSelection'
import { useRoleActions } from './hooks/useRoleActions'
import { useGameFlow } from './hooks/useGameFlow'
import MerchantPanel from './components/MerchantPanel'
import ShippingPanel from './components/ShippingPanel'
import StoragePanel from './components/StoragePanel'
import BuildingSelection from './components/BuildingSelection'
import GameEndScreen from './components/GameEndScreen'
import { useCPUPlayer } from './hooks/useCPUPlayer' // CPUフックをインポート

const initialGameState: GameState = {
  players: [
    {
      id: 1,
      name: "あなた",
      money: 2,
      victoryPoints: 0,
      goods: { corn: 0, indigo: 1, sugar: 0, tobacco: 0, coffee: 0 },
      plantations: [{ type: "indigo", colonists: 0, maxColonists: 1 }],
      buildings: [],
      colonists: 1,
      isCPU: false
    },
    {
      id: 2,
      name: "CPU 1",
      money: 3,
      victoryPoints: 0,
      goods: { corn: 1, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 },
      plantations: [{ type: "corn", colonists: 0, maxColonists: 1 }],
      buildings: [],
      colonists: 1,
      isCPU: true
    },
    {
      id: 3,
      name: "CPU 2",
      money: 3,
      victoryPoints: 0,
      goods: { corn: 1, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 },
      plantations: [{ type: "corn", colonists: 0, maxColonists: 1 }],
      buildings: [],
      colonists: 1,
      isCPU: true
    },
    {
      id: 4,
      name: "CPU 3",
      money: 4, // 4人プレイ時は4番目のプレイヤーは4金スタート
      victoryPoints: 0,
      goods: { corn: 0, indigo: 1, sugar: 0, tobacco: 0, coffee: 0 },
      plantations: [{ type: "indigo", colonists: 0, maxColonists: 1 }],
      buildings: [],
      colonists: 1,
      isCPU: true
    }
  ],
  currentPlayer: 0,
  phase: "選択待ち",
  victoryPointsRemaining: 75,
  colonistsRemaining: 55,
  colonistsOnShip: 0,
  availablePlantations: [
    { type: "corn", colonists: 0, maxColonists: 1 },
    { type: "indigo", colonists: 0, maxColonists: 1 },
    { type: "sugar", colonists: 0, maxColonists: 1 }
  ],
  availableRoles: [
    { role: "開拓者", money: 0, used: false },
    { role: "市長", money: 0, used: false },
    { role: "建築家", money: 0, used: false },
    { role: "監督", money: 0, used: false },
    { role: "商人", money: 0, used: false },
    { role: "船長", money: 0, used: false },
    { role: "金鉱掘り", money: 0, used: false }
  ],
  selectedRole: null,
  ships: [
    { cargo: "", capacity: 4, filled: 0 },
    { cargo: "", capacity: 5, filled: 0 },
    { cargo: "", capacity: 6, filled: 0 }
  ],
  tradeShip: {
    cargo: null,
    value: 0
  }
};

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [showPlantationSelection, setShowPlantationSelection] = useState(false);
  const [showBuildingSelection, setShowBuildingSelection] = useState(false);
  const [showMerchantPanel, setShowMerchantPanel] = useState(false);
  const [showShippingPanel, setShowShippingPanel] = useState(false);
  const [showStoragePanel, setShowStoragePanel] = useState(false);
  const { canExecuteAction, executeAction, getActionDescription } = useRoleActions(gameState, setGameState);
  const { isRoundEnd, moveToNextPlayer, gameEndState } = useGameFlow(gameState, setGameState);
  const { runCPUTurn } = useCPUPlayer(gameState, setGameState); // CPUフックを使用

  const getCurrentPlayer = () => {
    const player = gameState.players[gameState.currentPlayer];
    if (!player) {
      throw new Error('Current player not found');
    }
    return player;
  };

  const currentPlayer = getCurrentPlayer();

  // CPUのターンを自動実行するEffect
  useEffect(() => {
    const player = gameState.players[gameState.currentPlayer];
    if (player?.isCPU && !gameEndState.isGameEnd) {
      // 少し遅延させてCPUのターンを実行
      const timer = setTimeout(() => {
        runCPUTurn();
      }, 1500); // 1.5秒遅延
      return () => clearTimeout(timer); // クリーンアップ
    }
  }, [gameState.currentPlayer, gameState.players, gameEndState.isGameEnd, runCPUTurn]);

  const handleRoleSelect = (roleIndex: number) => {
    const role = gameState.availableRoles[roleIndex];
    if (!role || role.used) return;

    const newGameState = { ...gameState };
    const newPlayer = newGameState.players[gameState.currentPlayer];
    if (!newPlayer) return;

    newPlayer.money += role.money;
    role.used = true;
    newGameState.selectedRole = role.role;

    if (role.role === "開拓者") {
      setShowPlantationSelection(true);
    } else if (role.role === "建築家") {
      setShowBuildingSelection(true);
    } else if (role.role === "商人") {
      setShowMerchantPanel(true);
    } else if (role.role === "船長") {
      setShowShippingPanel(true);
      setShowMerchantPanel(true);
    } else if (role.role === "金鉱掘り") {
      executeAction({});
      moveToNextPlayer();
    }

    setGameState(newGameState);
  };

  const handlePlantationSelect = (plantation: typeof gameState.availablePlantations[0]) => {
    if (!canExecuteAction) return;
    executeAction({ plantation });
    setShowPlantationSelection(false);
    moveToNextPlayer();
  };

  const handleBuildingSelect = (buildingType: BuildingType) => {
    if (!canExecuteAction) return;

    const details = BUILDING_DETAILS[buildingType];
    const discountedCost = currentPlayer.buildings.some(b => b.type === "constructionHut")
      ? Math.max(0, details.cost - 1)
      : details.cost;

    if (currentPlayer.money < discountedCost) return;

    const newGameState = { ...gameState };
    const newPlayer = newGameState.players[gameState.currentPlayer];
    if (!newPlayer) return;

    newPlayer.money -= discountedCost;
    newPlayer.buildings.push({
      type: buildingType,
      colonists: 0,
      maxColonists: details.maxColonists,
      victoryPoints: details.victoryPoints
    });

    setGameState(newGameState);
    setShowBuildingSelection(false);
    moveToNextPlayer();
  };

  const handleShipGood = (goodType: string, shipIndex: number) => {
    if (!canExecuteAction) return;
    executeAction({ goodType, shipIndex });
    
    // 全ての船が満杯になったら自動で次のプレイヤーへ
    const allShipsFull = gameState.ships.every(ship => ship.filled >= ship.capacity);
    if (allShipsFull) {
      setShowShippingPanel(false);
      setShowStoragePanel(true);
    }
  };

  const handleDiscardGood = (goodType: string) => {
    if (!canExecuteAction) return;
    executeAction({ goodType, action: 'discard' });
  };

  const handleStorageConfirm = () => {
    setShowStoragePanel(false);
    moveToNextPlayer();
  };

  const handleSellGood = (goodType: string) => {
    if (!canExecuteAction) return;
    executeAction({ goodType });
    setShowMerchantPanel(false);
    moveToNextPlayer();
  };

  const handleNextPhase = () => {
    if (gameEndState.isGameEnd) {
      return;
    }
    moveToNextPlayer();
  };

  const handleColonistAddToPlantation = (plantationIndex: number) => {
    if (currentPlayer.colonists <= 0) return;

    const plantation = currentPlayer.plantations[plantationIndex];
    if (!plantation) return;

    if (plantation.colonists < plantation.maxColonists) {
      const newGameState = { ...gameState };
      const newPlayer = newGameState.players[gameState.currentPlayer];
      if (!newPlayer) return;

      const newPlantation = newPlayer.plantations[plantationIndex];
      if (!newPlantation) return;

      newPlantation.colonists++;
      newPlayer.colonists--;
      setGameState(newGameState);
    }
  };

  const handleColonistRemoveFromPlantation = (plantationIndex: number) => {
    const plantation = currentPlayer.plantations[plantationIndex];
    if (!plantation || plantation.colonists <= 0) return;

    const newGameState = { ...gameState };
    const newPlayer = newGameState.players[gameState.currentPlayer];
    if (!newPlayer) return;

    const newPlantation = newPlayer.plantations[plantationIndex];
    if (!newPlantation) return;

    newPlantation.colonists--;
    newPlayer.colonists++;
    setGameState(newGameState);
  };

  const handleColonistAddToBuilding = (buildingIndex: number) => {
    if (currentPlayer.colonists <= 0) return;

    const building = currentPlayer.buildings[buildingIndex];
    if (!building) return;

    if (building.colonists < building.maxColonists) {
      const newGameState = { ...gameState };
      const newPlayer = newGameState.players[gameState.currentPlayer];
      if (!newPlayer) return;

      const newBuilding = newPlayer.buildings[buildingIndex];
      if (!newBuilding) return;

      newBuilding.colonists++;
      newPlayer.colonists--;
      setGameState(newGameState);
    }
  };

  const handleColonistRemoveFromBuilding = (buildingIndex: number) => {
    const building = currentPlayer.buildings[buildingIndex];
    if (!building || building.colonists <= 0) return;

    const newGameState = { ...gameState };
    const newPlayer = newGameState.players[gameState.currentPlayer];
    if (!newPlayer) return;

    const newBuilding = newPlayer.buildings[buildingIndex];
    if (!newBuilding) return;

    newBuilding.colonists--;
    newPlayer.colonists++;
    setGameState(newGameState);
  };

  return (
    <div className="game-container">
      {gameEndState.isGameEnd ? (
        <GameEndScreen
          gameState={gameState}
          reason={gameEndState.reason}
          finalScores={gameEndState.finalScores}
        />
      ) : (
        <div className="game-content">
          <div className="player-area">
            <h2>{currentPlayer.name}</h2>
            <div>
              所持金: {currentPlayer.money} ドブロン / 
              勝利点: {currentPlayer.victoryPoints} 点 /
              未配置の入植者: {currentPlayer.colonists} 人
            </div>
            <div>
              商品:
              コーン({currentPlayer.goods.corn}),
              インディゴ({currentPlayer.goods.indigo}),
              砂糖({currentPlayer.goods.sugar}),
              タバコ({currentPlayer.goods.tobacco}),
              コーヒー({currentPlayer.goods.coffee})
            </div>
          </div>

          <div className="main-board">
            <div className="game-board">
              <div className="plantation-area">
                <h3>プランテーション</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {currentPlayer.plantations.map((plantation, index: number) => (
                   <Plantation
                     key={index}
                     plantation={plantation}
                     onColonistAdd={() => handleColonistAddToPlantation(index)}
                     onColonistRemove={() => handleColonistRemoveFromPlantation(index)}
                    />
                  ))}
                </div>
              </div>

              <div className="ships-area">
                {gameState.ships.map((ship, index) => (
                  <div key={index} className="ship">
                    <div>容量: {ship.capacity}</div>
                    <div>積載: {ship.filled}</div>
                    <div>商品: {ship.cargo || "なし"}</div>
                  </div>
                ))}
              </div>

              <div className="building-area">
                <h3>建物</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {currentPlayer.buildings.map((building, index: number) => (
                   <Building
                     key={index}
                     building={building}
                     onColonistAdd={() => handleColonistAddToBuilding(index)}
                     onColonistRemove={() => handleColonistRemoveFromBuilding(index)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="side-panel">
              <div>
                <h3>ゲーム情報</h3>
                <div>残り勝利点: {gameState.victoryPointsRemaining}</div>
                <div>残り入植者: {gameState.colonistsRemaining}</div>
                <div>船上の入植者: {gameState.colonistsOnShip}</div>
                <div>
                  現在の役職: {gameState.selectedRole || "選択待ち"}
                  {gameState.selectedRole && !canExecuteAction && " (アクション実行不可)"}
                </div>
                {gameState.selectedRole && (
                  <div>行動: {getActionDescription()}</div>
                )}
                {isRoundEnd && (
                  <div style={{ marginTop: '10px', color: '#B22222' }}>
                    ラウンド終了
                  </div>
                )}
              </div>

              <div className="role-cards">
                {gameState.availableRoles.map((roleState, index) => (
                  <RoleCard
                    key={index}
                    role={roleState.role}
                    money={roleState.money}
                    isSelected={gameState.selectedRole === roleState.role}
                    onSelect={() => handleRoleSelect(index)}
                    disabled={roleState.used || (gameState.selectedRole === roleState.role && !canExecuteAction)}
                  />
                ))}
              </div>

              {gameState.selectedRole && canExecuteAction && (
                <button
                  onClick={handleNextPhase}
                  style={{
                    marginTop: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  次のフェーズへ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showMerchantPanel && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#FFF',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '800px',
            width: '90%'
          }}>
            <MerchantPanel
              gameState={gameState}
              onSell={handleSellGood}
              onClose={() => setShowMerchantPanel(false)}
            />
          </div>
        </div>
      )}

      {showShippingPanel && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#FFF',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '900px',
            width: '95%'
          }}>
            <ShippingPanel
              gameState={gameState}
              onShip={handleShipGood}
              onClose={() => setShowShippingPanel(false)}
            />
          </div>
        </div>
      )}

      {showStoragePanel && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#FFF',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '800px',
            width: '90%'
          }}>
            <StoragePanel
              gameState={gameState}
              onDiscard={handleDiscardGood}
              onConfirm={handleStorageConfirm}
            />
          </div>
        </div>
      )}

      {showPlantationSelection && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#FFF',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '800px',
            width: '90%'
          }}>
            <PlantationSelection
              availablePlantations={gameState.availablePlantations}
              onSelect={handlePlantationSelect}
              canSelectQuarry={
                gameState.selectedRole === "開拓者" ||
                currentPlayer.buildings.some(b => b.type === "constructionHut")
              }
            />
          </div>
        </div>
      )}

      {showBuildingSelection && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#FFF',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '900px',
            width: '95%'
          }}>
            <BuildingSelection
              onSelect={handleBuildingSelect}
              availableMoney={currentPlayer.money}
              hasConstructionHut={currentPlayer.buildings.some(b => b.type === "constructionHut")}
              onClose={() => setShowBuildingSelection(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
