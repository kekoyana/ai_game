import React from 'react';
import { type GameState, type Player } from '../types/game';

type GameEndScreenProps = {
  gameState: GameState;
  reason?: string;
  finalScores?: { [key: string]: number };
};

export const GameEndScreen: React.FC<GameEndScreenProps> = ({
  gameState,
  reason,
  finalScores
}) => {
  if (!gameState.players.length) return null;

  const getWinnerName = (): string => {
    if (!finalScores || gameState.players.length === 0) return "なし";
    
    const firstPlayer = gameState.players[0];
    if (!firstPlayer) return "なし";

    const winner = gameState.players.reduce<Player>((winner, player) => {
      const currentScore = finalScores[player.id] ?? 0;
      const winnerScore = finalScores[winner.id] ?? 0;
      return currentScore > winnerScore ? player : winner;
    }, firstPlayer);

    return winner.name;
  };

  return (
    <div className="game-end-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div className="game-end-content" style={{
        backgroundColor: '#FFF',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '600px',
        width: '90%',
        textAlign: 'center'
      }}>
        <h2>ゲーム終了</h2>
        <p>{reason}</p>
        <h3>最終得点</h3>
        {finalScores ? (
          <>
            {gameState.players.map((player) => {
              const totalScore = finalScores[player.id] ?? 0;
              const bonusScore = totalScore - player.victoryPoints;
              return (
                <div key={player.id} style={{
                  padding: '10px',
                  margin: '5px 0',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{player.name}</span>
                  <span>
                    基本: {player.victoryPoints}点 / 
                    ボーナス: {bonusScore}点 / 
                    合計: {totalScore}点
                  </span>
                </div>
              );
            })}
            <div style={{ 
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#e8f5e9',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              <p>
                勝者: {getWinnerName()}
              </p>
            </div>
          </>
        ) : (
          <div>得点計算中...</div>
        )}
      </div>
    </div>
  );
};

export default GameEndScreen;