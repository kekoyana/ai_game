import { useState } from 'react'
import './App.css'

interface Player {
  id: number
  order: number
  average: number
  homeRuns: number
  steals: number
}

interface GameResult {
  hits: number
  singles: number
  doubles: number
  homeruns: number
  steals: number
  plateAppearances: number
  atBats: number
}

interface GameDetails {
  gameId: number
  score: number
  enemyScore: number
  inningResults: {
    inning: number
    hits: number
    runs: number
  }[]
  playerResults: {
    order: number
    plateAppearances: number
    atBats: number
    hits: number
    singles: number
    doubles: number
    homeruns: number
    steals: number
  }[]
}

interface TeamStats {
  games: number
  wins: number
  losses: number
  totalRuns: number
  totalEnemyRuns: number
  totalHits: number
  totalAtBats: number
  totalHomeRuns: number
  totalSteals: number
}

function App() {
  const initialStats = [
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

  const [players] = useState<Player[]>(
    initialStats.map((stats, index) => ({
      id: index + 1,
      order: index + 1,
      average: stats[0],
      homeRuns: stats[1],
      steals: stats[2]
    }))
  )

  const [results, setResults] = useState<GameResult[]>(new Array(9).fill({
    hits: 0,
    singles: 0,
    doubles: 0,
    homeruns: 0,
    steals: 0,
    plateAppearances: 0,
    atBats: 0
  }))

  const [gameResults, setGameResults] = useState<GameDetails[]>([])
  const [selectedGame, setSelectedGame] = useState<number | null>(null)
  const [teamStats, setTeamStats] = useState<TeamStats>({
    games: 0,
    wins: 0,
    losses: 0,
    totalRuns: 0,
    totalEnemyRuns: 0,
    totalHits: 0,
    totalAtBats: 0,
    totalHomeRuns: 0,
    totalSteals: 0
  })

  const simulateAtBat = (player: Player) => {
    if (Math.random() <= player.average) {
      const hitRoll = Math.random()
      const hrProb = player.homeRuns / 100
      const doubleProb = hrProb * hrProb
      const singleProb = hrProb

      if (hitRoll <= doubleProb) {
        return 'homerun'
      } else if (hitRoll <= hrProb) {
        return 'double'
      } else if (hitRoll <= singleProb) {
        return 'single'
      }
      return 'single'
    }
    return 'out'
  }

  const simulateEnemyTeam = () => {
    let runs = 0
    for (let i = 0; i < 27; i++) {
      if (Math.random() <= 0.25) {
        const hitRoll = Math.random()
        const hrProb = 10 / 100
        const doubleProb = hrProb * hrProb
        
        if (hitRoll <= doubleProb) {
          runs += 1
        } else if (hitRoll <= hrProb) {
          runs += Math.random() < 0.5 ? 1 : 0
        } else {
          if (Math.random() <= 10 / 100) {
            runs += Math.random() < 0.3 ? 1 : 0
          }
        }
      }
    }
    return runs
  }

  const simulateGames = () => {
    const gameResults: GameDetails[] = []
    const totalResults = players.map(() => ({
      hits: 0,
      singles: 0,
      doubles: 0,
      homeruns: 0,
      steals: 0,
      plateAppearances: 0,
      atBats: 0
    }))

    let wins = 0
    let totalRuns = 0
    let totalEnemyRuns = 0

    for (let game = 0; game < 143; game++) {
      let currentBatter = 0
      let outs = 0
      let inning = 1
      let runs = 0
      const inningResults = []
      const playerResults = players.map(p => ({
        order: p.order,
        plateAppearances: 0,
        atBats: 0,
        hits: 0,
        singles: 0,
        doubles: 0,
        homeruns: 0,
        steals: 0
      }))

      let inningHits = 0
      let inningRuns = 0
      let runnersOnBase = [false, false, false]

      const advanceRunners = (bases: number) => {
        let runsScored = 0
        for (let i = 2; i >= 0; i--) {
          if (runnersOnBase[i]) {
            if (i + bases >= 3) {
              runsScored++
              runnersOnBase[i] = false
            } else {
              runnersOnBase[i + bases] = true
              runnersOnBase[i] = false
            }
          }
        }
        if (bases >= 4) {
          runsScored++
        } else {
          runnersOnBase[bases - 1] = true
        }
        return runsScored
      }

      while (inning <= 9) {
        const player = players[currentBatter]
        const result = simulateAtBat(player)
        playerResults[currentBatter].plateAppearances++
        playerResults[currentBatter].atBats++
        totalResults[currentBatter].plateAppearances++
        totalResults[currentBatter].atBats++

        if (result === 'out') {
          outs++
        } else {
          playerResults[currentBatter].hits++
          totalResults[currentBatter].hits++
          inningHits++
          
          if (result === 'single') {
            playerResults[currentBatter].singles++
            totalResults[currentBatter].singles++
            inningRuns += advanceRunners(1)
            if (Math.random() <= player.steals / 100) {
              playerResults[currentBatter].steals++
              totalResults[currentBatter].steals++
              runnersOnBase[0] = false
              runnersOnBase[1] = true
            }
          } else if (result === 'double') {
            playerResults[currentBatter].doubles++
            totalResults[currentBatter].doubles++
            inningRuns += advanceRunners(2)
          } else if (result === 'homerun') {
            playerResults[currentBatter].homeruns++
            totalResults[currentBatter].homeruns++
            inningRuns += advanceRunners(4)
          }
        }

        currentBatter = (currentBatter + 1) % 9

        if (outs >= 3) {
          inningResults.push({
            inning,
            hits: inningHits,
            runs: inningRuns
          })
          runs += inningRuns
          outs = 0
          inning++
          inningHits = 0
          inningRuns = 0
          runnersOnBase = [false, false, false]
        }
      }

      const enemyScore = simulateEnemyTeam()
      
      if (runs > enemyScore) {
        wins++
      }
      totalRuns += runs
      totalEnemyRuns += enemyScore

      gameResults.push({
        gameId: game + 1,
        score: runs,
        enemyScore,
        inningResults,
        playerResults
      })
    }

    setResults(totalResults)
    setGameResults(gameResults)
    setTeamStats({
      games: 143,
      wins,
      losses: 143 - wins,
      totalRuns,
      totalEnemyRuns,
      totalHits: totalResults.reduce((sum, player) => sum + player.hits, 0),
      totalAtBats: totalResults.reduce((sum, player) => sum + player.atBats, 0),
      totalHomeRuns: totalResults.reduce((sum, player) => sum + player.homeruns, 0),
      totalSteals: totalResults.reduce((sum, player) => sum + player.steals, 0)
    })
  }

  return (
    <div className="container">
      <h1>打順シミュレーター</h1>
      <button onClick={simulateGames} className="simulate-button">143試合シミュレーション</button>
      
      {teamStats.games > 0 && (
        <div className="team-stats">
          <h2>チーム成績</h2>
          <div className="team-stats-grid">
            <div className="team-stat-item">
              <span className="label">試合数:</span>
              <span className="value">{teamStats.games}</span>
            </div>
            <div className="team-stat-item">
              <span className="label">勝敗:</span>
              <span className="value">{teamStats.wins}勝{teamStats.losses}敗</span>
            </div>
            <div className="team-stat-item">
              <span className="label">勝率:</span>
              <span className="value">{(teamStats.wins / teamStats.games).toFixed(3)}</span>
            </div>
            <div className="team-stat-item">
              <span className="label">チーム打率:</span>
              <span className="value">{(teamStats.totalHits / teamStats.totalAtBats).toFixed(3)}</span>
            </div>
            <div className="team-stat-item">
              <span className="label">総安打:</span>
              <span className="value">{teamStats.totalHits}</span>
            </div>
            <div className="team-stat-item">
              <span className="label">総本塁打:</span>
              <span className="value">{teamStats.totalHomeRuns}</span>
            </div>
            <div className="team-stat-item">
              <span className="label">総盗塁:</span>
              <span className="value">{teamStats.totalSteals}</span>
            </div>
            <div className="team-stat-item">
              <span className="label">総得点:</span>
              <span className="value">{teamStats.totalRuns}</span>
            </div>
            <div className="team-stat-item">
              <span className="label">総失点:</span>
              <span className="value">{teamStats.totalEnemyRuns}</span>
            </div>
          </div>
        </div>
      )}

      <div className="results-container">
        <div className="players-grid">
          {players.map((player, index) => (
            <div key={player.id} className="player-card">
              <h3>{player.order}番</h3>
              <div className="stats">
                <div className="stat">
                  <span>打率:</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${player.average * 100}%` }}></div>
                  </div>
                  <span>{player.average.toFixed(3)}</span>
                </div>
                <div className="stat">
                  <span>本塁打:</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(player.homeRuns / 40) * 100}%` }}></div>
                  </div>
                  <span>{player.homeRuns}</span>
                </div>
                <div className="stat">
                  <span>盗塁:</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(player.steals / 40) * 100}%` }}></div>
                  </div>
                  <span>{player.steals}</span>
                </div>
                {results[index].atBats > 0 && (
                  <div className="simulation-results">
                    <h4>シーズン成績</h4>
                    <p>打席数: {results[index].plateAppearances}</p>
                    <p>打数: {results[index].atBats}</p>
                    <p>打率: {(results[index].hits / results[index].atBats).toFixed(3)}</p>
                    <p>安打: {results[index].hits}本 (単: {results[index].singles}, 二: {results[index].doubles}, 本: {results[index].homeruns})</p>
                    <p>盗塁: {results[index].steals}個</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {gameResults.length > 0 && (
          <div className="games-section">
            <h2>試合結果</h2>
            <div className="games-list">
              {gameResults.map((game) => (
                <div 
                  key={game.gameId} 
                  className={`game-item ${selectedGame === game.gameId ? 'selected' : ''}`}
                  onClick={() => setSelectedGame(game.gameId)}
                >
                  <span>第{game.gameId}戦</span>
                  <span className="score">{game.score} - {game.enemyScore}</span>
                  <span className={game.score > game.enemyScore ? 'win' : 'lose'}>
                    {game.score > game.enemyScore ? '勝' : '負'}
                  </span>
                </div>
              ))}
            </div>

            {selectedGame && (
              <div className="game-details">
                <h3>第{selectedGame}戦 詳細</h3>
                {gameResults
                  .find(g => g.gameId === selectedGame)
                  ?.inningResults.map((inning) => (
                    <div key={inning.inning} className="inning-result">
                      <span>{inning.inning}回</span>
                      <span>安打: {inning.hits}</span>
                      <span>得点: {inning.runs}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
