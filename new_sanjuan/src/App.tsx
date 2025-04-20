import './App.css'
import GameBoard from './components/GameBoard'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>サンファン</h1>
        <p>ボードゲーム「サンファン」のWeb版</p>
      </header>
      <main>
        <GameBoard />
      </main>
    </div>
  )
}

export default App
