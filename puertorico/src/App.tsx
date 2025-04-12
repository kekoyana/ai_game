import { useState } from 'react'
import './App.css'
import { type GameState, type Player, type Ship, type Role } from './types/game'

const initialGameState: GameState = {
  players: [
    {
      id: 1,
      name: "プレイヤー1",
      money: 2,
      victoryPoints: 0,
      goods: {
        corn: 0,
        indigo: 0,
        sugar: 0,
        tobacco: 0,
        coffee: 0
      },
      plantations: [],
      buildings: [],
      colonists: 0
    }
  ],
  currentPlayer: 0,
  phase: "選択待ち",
  victoryPointsRemaining: 75,
  colonistsRemaining: 55,
  colonistsOnShip: 0,
  availablePlantations: [],
  availableRoles: ["開拓者", "市長", "建築家", "監督", "商人", "船長", "金鉱掘り"],
  ships: [
    { cargo: "", capacity: 4, filled: 0 },
    { cargo: "", capacity: 5, filled: 0 },
    { cargo: "", capacity: 6, filled: 0 }
  ],
  tradeShip: {
    cargo: null,
    value: 0
  }
}

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)

  const currentPlayer = gameState.players[gameState.currentPlayer]

  return (
    <div className="game-container">
      <div className="player-area">
        <h2>{currentPlayer.name}</h2>
        <div>
          所持金: {currentPlayer.money} ドブロン / 
          勝利点: {currentPlayer.victoryPoints} 点
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
            {/* プランテーションエリアの実装 */}
          </div>

          <div className="ships-area">
            {gameState.ships.map((ship: Ship, index: number) => (
              <div key={index} className="ship">
                <div>容量: {ship.capacity}</div>
                <div>積載: {ship.filled}</div>
                <div>商品: {ship.cargo || "なし"}</div>
              </div>
            ))}
          </div>

          <div className="building-area">
            <h3>建物</h3>
            {/* 建物エリアの実装 */}
          </div>
        </div>

        <div className="side-panel">
          <div>
            <h3>ゲーム情報</h3>
            <div>残り勝利点: {gameState.victoryPointsRemaining}</div>
            <div>残り入植者: {gameState.colonistsRemaining}</div>
            <div>船上の入植者: {gameState.colonistsOnShip}</div>
          </div>

          <div className="role-cards">
            {gameState.availableRoles.map((role: Role, index: number) => (
              <div key={index} className="role-card">
                {role}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
