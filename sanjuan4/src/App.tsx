import { useState } from 'react';
import './App.css';
import { GameEngine } from './game/GameEngine';
import { RoleNames, Role } from './game/GameTypes';

function App() {
  const [engine] = useState(() => new GameEngine());
  const [state, setState] = useState(engine.state);

  // 役割選択
  const handleChooseRole = (role: Role) => {
    if (engine.chooseRole(role)) {
      setState({ ...engine.state });
    }
  };

  return (
    <div className="game-root">
      <h1>サンファン4</h1>
      <div>
        <b>ラウンド: </b>{state.round}
      </div>
      <div>
        <b>現在のプレイヤー: </b>{state.players[state.currentPlayerIndex].name}
      </div>
      <div>
        <b>選択可能な役割:</b>
        {state.availableRoles.map(role => (
          <button key={role} onClick={() => handleChooseRole(role)} style={{margin: 4}}>
            {RoleNames[role]}
          </button>
        ))}
      </div>
      <div>
        <b>ログ:</b>
        <ul>
          {state.log.map((msg, i) => <li key={i}>{msg}</li>)}
        </ul>
      </div>
      <div>
        <b>プレイヤー情報:</b>
        <ul>
          {state.players.map(p => (
            <li key={p.id}>
              {p.name} [{p.type === 'human' ? 'あなた' : 'CPU'}]
              建物:{p.buildings.length}枚　手札:{p.hand.length}枚
              {p.isGovernor && ' 👑'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
