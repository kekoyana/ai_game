import { General } from './general';

export interface GameDate {
  year: number;
  month: number;
}

export interface GameState {
  date: GameDate;
  generals: General[];
}

export const createInitialGameState = (): GameState => {
  return {
    date: {
      year: 189,
      month: 4
    },
    generals: []
  };
};

export const advanceMonth = (date: GameDate): GameDate => {
  if (date.month === 12) {
    return {
      year: date.year + 1,
      month: 1
    };
  }
  return {
    year: date.year,
    month: date.month + 1
  };
};

// 月の表示用
export const getMonthDisplay = (month: number): string => {
  return `${month}月`;
};

// 年の表示用（漢数字）
export const getYearDisplay = (year: number): string => {
  return `建安${year - 188}年`;
};

// 表示用の日付文字列を取得
export const getDateDisplay = (date: GameDate): string => {
  return `${getYearDisplay(date.year)} ${getMonthDisplay(date.month)}`;
};