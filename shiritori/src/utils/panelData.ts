import { Panel } from '../types/game';

interface PanelData {
  words: string[];
  imageUrl: string;
}

// 「ー」を除去して最後の文字を取得
const getLastChar = (word: string): string => {
  const normalizedWord = word.replace(/ー/g, '');
  return normalizedWord.slice(-1);
};

// 「ー」を除去して最初の文字を取得
const getFirstChar = (word: string): string => {
  const normalizedWord = word.replace(/ー/g, '');
  return normalizedWord[0];
};

const panelData: PanelData[] = [
  {
    words: ['きつね', 'どうぶつ'],
    imageUrl: '🦊'
  },
  {
    words: ['ねこ', 'どうぶつ'],
    imageUrl: '🐱'
  },
  {
    words: ['こうもり', 'どうぶつ'],
    imageUrl: '🦇'
  },
  {
    words: ['りんご', 'くだもの'],
    imageUrl: '🍎'
  },
  {
    words: ['ごりら', 'どうぶつ'],
    imageUrl: '🦍'
  },
  {
    words: ['らっぱ', 'がっき'],
    imageUrl: '🎺'
  },
  {
    words: ['ぱいなっぷる', 'くだもの'],
    imageUrl: '🍍'
  },
  {
    words: ['るびー', 'ほうせき'],
    imageUrl: '💎'
  },
  {
    words: ['いか', 'どうぶつ'],
    imageUrl: '🦑'
  },
  {
    words: ['かに', 'どうぶつ'],
    imageUrl: '🦀'
  },
  {
    words: ['にわとり', 'どうぶつ'],
    imageUrl: '🐓'
  },
  {
    words: ['りす', 'どうぶつ'],
    imageUrl: '🐿️'
  },
  {
    words: ['すいか', 'くだもの'],
    imageUrl: '🍉'
  },
  {
    words: ['かば', 'どうぶつ'],
    imageUrl: '🦛'
  },
  {
    words: ['ばなな', 'くだもの'],
    imageUrl: '🍌'
  },
  {
    words: ['なし', 'くだもの'],
    imageUrl: '🍐'
  },
  {
    words: ['しか', 'どうぶつ'],
    imageUrl: '🦌'
  },
  {
    words: ['かめ', 'どうぶつ'],
    imageUrl: '🐢'
  },
  {
    words: ['めがね', 'どうぐ'],
    imageUrl: '👓'
  },
  {
    words: ['ねずみ', 'どうぶつ'],
    imageUrl: '🐭'
  },
  {
    words: ['ねっくれす', 'あくせさりー'],
    imageUrl: '📿'
  },
  {
    words: ['すまほ', 'きき'],
    imageUrl: '📱'
  },
  {
    words: ['ほうき', 'どうぐ'],
    imageUrl: '🧹'
  }
];

// パネルをランダムに並び替えて生成
export const generatePanels = (): Panel[] => {
  const shuffled = [...panelData]
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return shuffled.map((data, index) => ({
    id: index,
    words: data.words,
    imageUrl: data.imageUrl,
    isSelected: false
  }));
};

// 「ん」で終わるかチェック
export const endsWithN = (word: string): boolean => {
  const normalizedWord = word.replace(/ー/g, '');
  return normalizedWord.endsWith('ん');
};

// 有効な単語かチェック（前の単語の最後の文字から始まるか）
export const isValidWord = (prevWord: string, nextWord: string): boolean => {
  if (!prevWord) return true;
  
  const lastChar = getLastChar(prevWord);
  const firstChar = getFirstChar(nextWord);
  
  return firstChar === lastChar;
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