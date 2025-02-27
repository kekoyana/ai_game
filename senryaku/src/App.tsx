import { GameMap } from './components/game/GameMap'
import './App.css'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GameMap width={20} height={15} tileSize={40} />
    </div>
  )
}

export default App
