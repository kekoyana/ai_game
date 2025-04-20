import './App.css'
import { GameProvider } from './context/GameContext'
import { Board } from './components/Board'
import { GameInfo } from './components/GameInfo'

function App() {
  return (
    <GameProvider>
      <div className="app-container">
        <h1>ウォーゲーム</h1>
        <div className="game-container">
          <Board />
          <GameInfo />
        </div>
      </div>
    </GameProvider>
  )
}

export default App
