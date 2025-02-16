import React from 'react';
import { Cell as CellComponent } from './Cell';
import { GameState } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, onCellClick }) => {
  return (
    <div
      className="game-board"
      style={{
        gridTemplateColumns: `repeat(${gameState.board[0].length}, 64px)`,
        width: 'fit-content',
        height: 'fit-content',
        margin: '0 auto',
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