import { useState } from 'react';
import './App.css';
import { GameEngine } from './game/GameEngine';
import { RoleNames, Role } from './game/GameTypes';
import { BuildingCards } from './game/BuildingCards';
import type { Player } from './game/GameTypes';

function App() {
  const [engine] = useState(() => new GameEngine());
  const [state, setState] = useState(engine.state);
  const [showBuildingSelection, setShowBuildingSelection] = useState(false);

  // 役割選択
  const handleChooseRole = (role: Role) => {
    const currentPlayerId = engine.state.players[engine.state.currentPlayerIndex].id;
    if (engine.chooseRole(role)) {
      if (role === 'prospector') {
        engine.prospector(currentPlayerId);
        setState({ ...engine.state });
      } else if (role === 'producer') {
        setShowBuildingSelection(true);
      } else {
        setState({ ...engine.state });
      }
    }
  };

  // 生産施設選択
  const handleProduce = (buildingId: string) => {
    const currentPlayerId = engine.state.players[engine.state.currentPlayerIndex].id;
    const result = engine.produce(currentPlayerId, buildingId);
    if (result) {
      setState({ ...engine.state });
      setShowBuildingSelection(false);
    }
  };

  // プレイヤーの生産施設リストを取得
  const getProductionBuildings = (playerId: number) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return [];
    return player.buildings.filter(buildingId => {
      const building = BuildingCards.find(b => b.id === buildingId);
      return building && building.category === 'production' && !player.products[buildingId];
    });
  };

  // カードID配列を日本語名配列に変換
  // (未使用のため削除)

  // ログ内のカードIDを日本語名に変換
  const localizeLog = (msg: string) => {
    let replaced = msg;
    BuildingCards.forEach(card => {
      replaced = replaced.replace(new RegExp(card.id, 'g'), card.name);
    });
    return replaced;
  };

  // プレイヤーの場をカード風に表示
  const renderPlayerField = (p: Player) => {
    return (
      <div key={p.id} className="player-field" style={{
        border: '2px solid #888', borderRadius: 8, margin: 12, padding: 8, background: p.type === 'human' ? '#f9fbe7' : '#f0f0f0'
      }}>
        <div style={{fontWeight: 'bold', marginBottom: 4}}>
          {p.name} [{p.type === 'human' ? 'あなた' : 'CPU'}]{p.isGovernor && ' 👑'}
        </div>
        <div style={{marginBottom: 4}}>
          <b>手札</b> ({p.hand.length}枚):&nbsp;
          {p.hand.map((id: string) => {
            const card = BuildingCards.find(b => b.id === id);
            return (
              <span key={id} className="card" style={{
                display: 'inline-block', border: '1px solid #aaa', borderRadius: 4, padding: '2px 6px', margin: '0 2px', background: '#fff'
              }}>
                {card ? card.name : id}
              </span>
            );
          })}
        </div>
        <div>
          <b>建物/生産施設</b> ({p.buildings.length}枚):
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2}}>
            {p.buildings.map((bid: string) => {
              const card = BuildingCards.find(b => b.id === bid);
              const isProduction = card && card.category === 'production';
              const hasProduct = p.products[bid];
              return (
                <div key={bid} className="card" style={{
                  border: '1.5px solid #666', borderRadius: 4, padding: '4px 8px', background: isProduction ? '#e3f2fd' : '#fff', minWidth: 80, marginBottom: 2
                }}>
                  <div>
                    <b>{card ? card.name : bid}</b>
                    {isProduction && hasProduct && (
                      <span style={{
                        display: 'inline-block', marginLeft: 6, color: '#388e3c', fontWeight: 'bold'
                      }}>●商品</span>
                    )}
                  </div>
                  <div style={{fontSize: 12, color: '#888'}}>{isProduction ? '生産施設' : '建物'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="game-root" style={{background: '#f5f5f5', minHeight: '100vh', padding: 16}}>
      <h1 style={{textAlign: 'center'}}>サンファン4</h1>
      <div>
        <b>ラウンド: </b>{state.round}
        &nbsp;&nbsp;
        <b>現在のプレイヤー: </b>{state.players[state.currentPlayerIndex].name}
      </div>
      <div style={{margin: '12px 0'}}>
        <b>選択可能な役割:</b>
        {state.availableRoles.map(role => (
          <button key={role} onClick={() => handleChooseRole(role)} style={{margin: 4, padding: '4px 12px', fontWeight: 'bold'}}>
            {RoleNames[role]}
          </button>
        ))}
      </div>
      {showBuildingSelection && (
        <div style={{margin: '12px 0', background: '#fffde7', padding: 8, borderRadius: 6}}>
          <b>生産する建物を選択してください:</b>
          <ul style={{display: 'flex', gap: 8, listStyle: 'none', padding: 0}}>
            {getProductionBuildings(state.players[state.currentPlayerIndex].id).map(buildingId => {
              const building = BuildingCards.find(b => b.id === buildingId);
              return (
                <li key={buildingId}>
                  <button onClick={() => handleProduce(buildingId)} style={{
                    border: '1.5px solid #1976d2', borderRadius: 4, padding: '4px 12px', background: '#e3f2fd', fontWeight: 'bold'
                  }}>
                    {building ? building.name : buildingId}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div>
        <b>ログ:</b>
        <ul>
          {state.log.map((msg, i) => <li key={i}>{localizeLog(msg)}</li>)}
        </ul>
      </div>
      <div>
        <b>プレイヤーの場:</b>
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
          {state.players.map(renderPlayerField)}
        </div>
      </div>
    </div>
  );
}

export default App;
