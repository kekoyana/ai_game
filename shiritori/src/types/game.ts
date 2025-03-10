export interface Panel {
  id: number;
  words: string[];  // 複数の読み方を許容
  imageUrl: string;
  isSelected: boolean;
}

export interface GameState {
  panels: Panel[];
  currentPlayer: 'USER' | 'CPU';
  timeLeft: number;
  lastWord: string;
  gameOver: boolean;
  winner: 'USER' | 'CPU' | null;
  message: string;
}