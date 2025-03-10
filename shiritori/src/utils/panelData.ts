import { Panel } from '../types/game';

interface PanelData {
  words: string[];
  imageUrl: string; // 実際には絵文字が入ります
}

const panelData: PanelData[] = [
  {
    words: ['りんご', 'あっぷる', 'かじつ'],
    imageUrl: '🍎'
  },
  {
    words: ['ごりら', 'さる'],
    imageUrl: '🦍'
  },
  {
    words: ['らっぱ', 'がっき'],
    imageUrl: '📯'
  },
  {
    words: ['ぱんだ', 'どうぶつ'],
    imageUrl: '🐼'
  },
  {
    words: ['だるま', 'おもちゃ'],
    imageUrl: '🎎'
  },
  {
    words: ['まんが', 'ほん'],
    imageUrl: '📚'
  },
  {
    words: ['がっこう', 'びる'],
    imageUrl: '🏫'
  },
  {
    words: ['うさぎ', 'ぺット'],
    imageUrl: '🐰'
  },
  {
    words: ['ぎたー', 'がっき'],
    imageUrl: '🎸'
  },
  {
    words: ['たいよう', 'そら'],
    imageUrl: '☀️'
  }
];

export const generatePanels = (): Panel[] => {
  return panelData.map((data, index) => ({
    id: index,
    words: data.words,
    imageUrl: data.imageUrl,
    isSelected: false
  }));
};

// 「ん」で終わるかチェック
export const endsWithN = (word: string): boolean => {
  return word.endsWith('ん');
};

// 有効な単語かチェック（前の単語の最後の文字から始まるか）
export const isValidWord = (prevWord: string, nextWord: string): boolean => {
  if (!prevWord) return true;
  const lastChar = prevWord.slice(-1);
  return nextWord.startsWith(lastChar);
};

// CPUの手を選択
export const selectCpuMove = (
  panels: Panel[], 
  lastWord: string
): Panel | null => {
  // 未選択のパネルからランダムに有効な手を探す
  const availablePanels = panels.filter(panel => !panel.isSelected);
  const validPanels = availablePanels.filter(panel => 
    panel.words.some(word => isValidWord(lastWord, word))
  );
  
  if (validPanels.length === 0) return null;
  
  // ランダムにパネルを選択
  const randomIndex = Math.floor(Math.random() * validPanels.length);
  return validPanels[randomIndex];
};