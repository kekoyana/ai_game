import { useState, useEffect, useCallback } from 'react';
import { GameState } from '../types/game';
import { generatePanels, endsWithN, isValidWord, selectCpuMove } from '../utils/panelData';

export const useShiritoriGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    panels: generatePanels(),
    currentPlayer: 'CPU',  // CPUから開始
    timeLeft: 60,
    lastWord: '',
    gameOver: false,
    winner: null,
    message: 'CPUの手番です...'
  });

  // タイマー処理
  useEffect(() => {
    if (gameState.gameOver) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 0) {
          return {
            ...prev,
            gameOver: true,
            winner: prev.currentPlayer === 'USER' ? 'CPU' : 'USER',
            message: `時間切れ！${prev.currentPlayer === 'USER' ? 'CPUの' : 'あなたの'}勝ちです！`
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameOver]);

  // CPUの手番処理
  useEffect(() => {
    if (gameState.currentPlayer === 'CPU' && !gameState.gameOver) {
      const cpuTimer = setTimeout(() => {
        const cpuMove = selectCpuMove(gameState.panels, gameState.lastWord);
        
        if (!cpuMove) {
          setGameState(prev => ({
            ...prev,
            gameOver: true,
            winner: 'USER',
            message: 'CPUが選択できる単語がありません。あなたの勝ちです！'
          }));
          return;
        }

        const selectedWord = cpuMove.words.find(word => 
          isValidWord(gameState.lastWord, word)
        ) || cpuMove.words[0];

        handleMove(cpuMove.id, selectedWord, 'CPU');
      }, 1000); // CPUの思考時間

      return () => clearTimeout(cpuTimer);
    }
  }, [gameState.currentPlayer, gameState.gameOver, gameState.lastWord]);

  // 初回のCPUの手を選択
  useEffect(() => {
    if (gameState.currentPlayer === 'CPU' && gameState.lastWord === '') {
      const cpuTimer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * gameState.panels.length);
        const initialPanel = gameState.panels[randomIndex];
        handleMove(initialPanel.id, initialPanel.words[0], 'CPU');
      }, 1000);

      return () => clearTimeout(cpuTimer);
    }
  }, []); // 初回のみ実行

  // パネル選択の処理
  const handleMove = useCallback((panelId: number, word: string, player: 'USER' | 'CPU') => {
    setGameState(prev => {
      // すでに選択済みのパネルの場合
      if (prev.panels.find(p => p.id === panelId)?.isSelected) {
        return {
          ...prev,
          message: 'すでに選択済みのパネルです。'
        };
      }

      // 単語の有効性チェック
      if (prev.lastWord && !isValidWord(prev.lastWord, word)) {
        if (player === 'USER') {
          return {
            ...prev,
            timeLeft: Math.max(0, prev.timeLeft - 5),
            message: '前の単語に続いていません。5秒減少しました。'
          };
        }
        return prev;
      }

      // 「ん」で終わる場合
      if (endsWithN(word)) {
        return {
          ...prev,
          gameOver: true,
          winner: player === 'USER' ? 'CPU' : 'USER',
          message: `「ん」で終わる単語を選択しました。${player === 'USER' ? 'CPUの' : 'あなたの'}勝ちです！`
        };
      }

      // パネルの更新
      const updatedPanels = prev.panels.map(panel =>
        panel.id === panelId ? { ...panel, isSelected: true } : panel
      );

      return {
        ...prev,
        panels: updatedPanels,
        currentPlayer: player === 'USER' ? 'CPU' : 'USER',
        lastWord: word,
        message: `${word}が選択されました。${player === 'USER' ? 'CPUの' : 'あなたの'}番です。`
      };
    });
  }, []);

  // ゲームのリセット
  const resetGame = useCallback(() => {
    setGameState({
      panels: generatePanels(),
      currentPlayer: 'CPU',  // リセット時もCPUから開始
      timeLeft: 60,
      lastWord: '',
      gameOver: false,
      winner: null,
      message: 'CPUの手番です...'
    });
  }, []);

  return {
    gameState,
    handleMove,
    resetGame
  };
};