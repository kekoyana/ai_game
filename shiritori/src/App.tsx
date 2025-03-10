import { useShiritoriGame } from './hooks/useShiritoriGame';
import { Panel } from './components/Panel';
import './App.css';

function App() {
  const { gameState, handleMove, resetGame } = useShiritoriGame();
  const { panels, currentPlayer, timeLeft, lastWord, gameOver, message } = gameState;

  return (
    <div className="app">
      <div className="game-info">
        <div className="status-container">
          <div className="timer">
            ⏱️ {timeLeft}秒
          </div>
          <div className="player-turn">
            {currentPlayer === 'USER' ? '👤 あなた' : '🤖 CPU'}の番
          </div>
        </div>
        
        <div className="last-word">
          {lastWord && `最後の単語: ${lastWord}`}
        </div>
        
        <div className="message">
          {message}
        </div>
      </div>

      <div className="panels-grid">
        {panels.map((panel) => (
          <Panel
            key={panel.id}
            {...panel}
            onSelect={(id, word) => handleMove(id, word, 'USER')}
            disabled={currentPlayer === 'CPU' || gameOver}
          />
        ))}
      </div>

      {gameOver && (
        <button className="reset-button" onClick={resetGame}>
          🔄 もう一度遊ぶ
        </button>
      )}
    </div>
  );
}

export default App;
