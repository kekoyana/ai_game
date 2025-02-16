import React, { useState } from 'react';
import { Cell as CellComponent } from './Cell';
import { Cell as CellType, GameState, EnvironmentType } from '../types/game';
import { environments } from '../data/environments';

interface GameBoardProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, onCellClick }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gameState.board[0].length}, 60px)`,
        gap: '2px',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
      }}
    >
      {gameState.board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <CellComponent
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};