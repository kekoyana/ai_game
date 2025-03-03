import { useState } from 'react'
import './App.css'

// 選手の型定義
interface Player {
  id: number
  order: number   // 打順（1-9）
  average: number // 打率
  homeRuns: number // 本塁打数
  steals: number  // 盗塁数
}

function App() {
  // 成績データを配列で定義
  const initialStats = [
    // [打率, HR数, 盗塁数]
    [0.320, 15, 30], // 1番
    [0.285, 8, 25],  // 2番
    [0.305, 28, 10], // 3番
    [0.275, 35, 5],  // 4番
    [0.290, 25, 8],  // 5番
    [0.265, 18, 12], // 6番
    [0.250, 12, 15], // 7番
    [0.235, 5, 10],  // 8番
    [0.245, 3, 8],   // 9番
  ]

  // 配列データからPlayerオブジェクトを生成
  const [players] = useState<Player[]>(
    initialStats.map((stats, index) => ({
      id: index + 1,
      order: index + 1,
      average: stats[0],
      homeRuns: stats[1],
      steals: stats[2]
    }))
  )

  return (
    <div className="container">
      <h1>打順シミュレーター</h1>
      <div className="players-grid">
        {players.map(player => (
          <div key={player.id} className="player-card">
            <h3>{player.order}番</h3>
            <div className="stats">
              <div className="stat">
                <span>打率:</span>
                <div className="stat-bar">
                  <div 
                    className="stat-fill" 
                    style={{ width: `${player.average * 100}%` }}
                  ></div>
                </div>
                <span>{player.average.toFixed(3)}</span>
              </div>
              <div className="stat">
                <span>本塁打:</span>
                <div className="stat-bar">
                  <div 
                    className="stat-fill"
                    style={{ width: `${(player.homeRuns / 40) * 100}%` }}
                  ></div>
                </div>
                <span>{player.homeRuns}</span>
              </div>
              <div className="stat">
                <span>盗塁:</span>
                <div className="stat-bar">
                  <div 
                    className="stat-fill"
                    style={{ width: `${(player.steals / 40) * 100}%` }}
                  ></div>
                </div>
                <span>{player.steals}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
