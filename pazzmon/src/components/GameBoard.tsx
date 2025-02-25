import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Orb } from './Orb';
import { OrbType, Position, Orb as OrbInterface, GameState } from '../types';
import '../styles/GameBoard.css';

const ROWS = 5;
const COLS = 6;
const INITIAL_TIME = 5;

const orbTypes: OrbType[] = ['fire', 'water', 'wood', 'light', 'dark', 'heal'];

const createInitialBoard = (): OrbInterface[][] => {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      type: orbTypes[Math.floor(Math.random() * orbTypes.length)],
      id: `${row}-${col}-${Math.random()}`,
    }))
  );
};

export const GameBoard: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    selectedOrb: null,
    isMoving: false,
    combo: 0,
    time: INITIAL_TIME,
  });

  const [dragInfo, setDragInfo] = useState<{
    startPos: Position | null;
    currentPos: Position | null;
    dragElement: HTMLElement | null;
  }>({
    startPos: null,
    currentPos: null,
    dragElement: null,
  });

  const getOrbPosition = (clientX: number, clientY: number): Position | null => {
    if (!boardRef.current) return null;

    const rect = boardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const col = Math.floor((x / rect.width) * COLS);
    const row = Math.floor((y / rect.height) * ROWS);

    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      return { row, col };
    }
    return null;
  };

  const handleTouchStart = (e: React.TouchEvent, row: number, col: number) => {
    if (!gameState.isMoving) {
      const element = e.currentTarget as HTMLElement;
      
      setGameState(prev => ({
        ...prev,
        selectedOrb: { row, col },
        isMoving: true,
      }));

      setDragInfo({
        startPos: { row, col },
        currentPos: { row, col },
        dragElement: element,
      });

      if (element) {
        element.style.opacity = '0.8';
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState.isMoving && dragInfo.startPos && dragInfo.dragElement) {
      e.preventDefault();
      const touch = e.touches[0];
      const newPos = getOrbPosition(touch.clientX, touch.clientY);

      if (newPos && (newPos.row !== dragInfo.currentPos?.row || newPos.col !== dragInfo.currentPos?.col)) {
        swapOrbs(dragInfo.currentPos || dragInfo.startPos, newPos);
        setDragInfo(prev => ({
          ...prev,
          currentPos: newPos,
        }));
      }
    }
  };

  const handleTouchEnd = useCallback(() => {
    if (gameState.isMoving) {
      if (dragInfo.dragElement) {
        dragInfo.dragElement.style.opacity = '1';
      }

      setGameState(prev => ({
        ...prev,
        selectedOrb: null,
        isMoving: false,
      }));

      setDragInfo({
        startPos: null,
        currentPos: null,
        dragElement: null,
      });

      checkMatches();
    }
  }, [gameState.isMoving, dragInfo]);

  const swapOrbs = (from: Position, to: Position) => {
    setGameState(prev => {
      const newBoard = [...prev.board];
      const temp = newBoard[from.row][from.col];
      newBoard[from.row][from.col] = newBoard[to.row][to.col];
      newBoard[to.row][to.col] = temp;
      return { ...prev, board: newBoard };
    });
  };

  const checkMatches = () => {
    // 横方向のマッチをチェック
    for (let row = 0; row < ROWS; row++) {
      let count = 1;
      let type = gameState.board[row][0].type;
      for (let col = 1; col < COLS; col++) {
        if (gameState.board[row][col].type === type) {
          count++;
        } else {
          if (count >= 3) {
            removeMatches(row, col - count, row, col - 1);
          }
          count = 1;
          type = gameState.board[row][col].type;
        }
      }
      if (count >= 3) {
        removeMatches(row, COLS - count, row, COLS - 1);
      }
    }

    // 縦方向のマッチをチェック
    for (let col = 0; col < COLS; col++) {
      let count = 1;
      let type = gameState.board[0][col].type;
      for (let row = 1; row < ROWS; row++) {
        if (gameState.board[row][col].type === type) {
          count++;
        } else {
          if (count >= 3) {
            removeMatches(row - count, col, row - 1, col);
          }
          count = 1;
          type = gameState.board[row][col].type;
        }
      }
      if (count >= 3) {
        removeMatches(ROWS - count, col, ROWS - 1, col);
      }
    }
  };

  const removeMatches = (startRow: number, startCol: number, endRow: number, endCol: number) => {
    setGameState(prev => {
      const newBoard = [...prev.board];
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          newBoard[row][col] = {
            type: orbTypes[Math.floor(Math.random() * orbTypes.length)],
            id: `${row}-${col}-${Math.random()}`,
          };
        }
      }
      return {
        ...prev,
        board: newBoard,
        combo: prev.combo + 1,
      };
    });
  };

  useEffect(() => {
    if (gameState.isMoving && gameState.time > 0) {
      const timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          time: prev.time - 1,
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.isMoving, gameState.time]);

  return (
    <div className="game-container">
      <div className="game-info">
        <div>Time: {gameState.time}s</div>
        <div>Combo: {gameState.combo}</div>
      </div>
      <div
        ref={boardRef}
        className="game-board"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {gameState.board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((orb, colIndex) => (
              <Orb
                key={orb.id}
                type={orb.type}
                isMoving={
                  gameState.selectedOrb?.row === rowIndex &&
                  gameState.selectedOrb?.col === colIndex
                }
                onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};