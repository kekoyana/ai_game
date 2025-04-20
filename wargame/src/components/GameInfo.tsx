import React from 'react';
import { useGameContext } from '../context/GameContext';
import { Unit } from '../types/game';

export const GameInfo: React.FC = () => {
  const { gameState, endTurn, resetGame } = useGameContext();
  const { currentPlayer, selectedUnit, playerUnits, computerUnits, gameOver, winner, message } = gameState;

  // 選択中のユニット情報を表示
  const renderUnitInfo = (unit: Unit) => {
    return (
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          marginTop: '10px',
          backgroundColor: '#f9f9f9',
          borderRadius: '5px'
        }}
      >
        <h4 style={{ margin: '0 0 10px 0' }}>ユニット情報</h4>
        <p><strong>タイプ:</strong> {unit.type}</p>
        <p><strong>HP:</strong> {unit.health}</p>
        <p><strong>移動力:</strong> {unit.movementLeft}/{unit.movement}</p>
        <p><strong>攻撃力:</strong> {unit.attackPower}</p>
        <p><strong>攻撃範囲:</strong> {unit.attackRange}</p>
        <p><strong>位置:</strong> ({unit.x}, {unit.y})</p>
        <p><strong>攻撃済み:</strong> {unit.hasAttacked ? 'はい' : 'いいえ'}</p>
      </div>
    );
  };

  // ゲーム終了時のメッセージ
  const renderGameOverMessage = () => {
    return (
      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8d7da',
          borderRadius: '5px',
          color: '#721c24',
          textAlign: 'center',
          fontWeight: 'bold'
        }}
      >
        <p>ゲーム終了！ {winner === 'PLAYER' ? 'あなたの勝ち！' : 'コンピュータの勝ち！'}</p>
        <button
          onClick={resetGame}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          もう一度プレイ
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '300px'
      }}
    >
      <h3>ゲーム情報</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>現在のターン:</strong> {currentPlayer === 'PLAYER' ? 'あなた' : 'コンピュータ'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>プレイヤーユニット:</strong> {playerUnits.length}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>コンピュータユニット:</strong> {computerUnits.length}
      </div>

      {message && (
        <div
          style={{
            backgroundColor: '#d4edda',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '10px'
          }}
        >
          {message}
        </div>
      )}

      {selectedUnit && renderUnitInfo(selectedUnit)}

      {currentPlayer === 'PLAYER' && !gameOver && (
        <button
          onClick={endTurn}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px',
            width: '100%',
            fontWeight: 'bold'
          }}
        >
          ターン終了
        </button>
      )}

      {gameOver && renderGameOverMessage()}
    </div>
  );
};