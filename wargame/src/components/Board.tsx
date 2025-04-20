import React from 'react';
import { useGameContext } from '../context/GameContext';
import { Cell } from './Cell';

export const Board: React.FC = () => {
  const { gameState } = useGameContext();
  const { board } = gameState;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      {board.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'flex',
            gap: '2px'
          }}
        >
          {row.map((cell) => (
            <Cell key={`${cell.x}-${cell.y}`} cell={cell} />
          ))}
        </div>
      ))}
    </div>
  );
};