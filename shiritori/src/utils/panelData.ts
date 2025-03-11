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
    words: ['えがお', 'かお'],
    imageUrl: '😊'
  },
  {
    words: ['おの'],
    imageUrl: '🪓'
  },
  {
    words: ['のーと'],
    imageUrl: '📔'
  },
  {
    words: ['とうもろこし','こーん'],
    imageUrl: '🌽'
  },
  {
    words: ['しろくま'],
    imageUrl: '🐻‍❄️'
  },
  {
    words: ['まいく', 'うた'],
    imageUrl: '🎤'
  },
  {
    words: ['くりすます', 'つりー'],
    imageUrl: '🎄'
  },
  {
    words: ['すいか'],
    imageUrl: '🍉'
  },
  {
    words: ['かめ'],
    imageUrl: '🐢'
  },
  {
    words: ['めがね'],
    imageUrl: '👓'
  },
  {
    words: ['ねこ'],
    imageUrl: '🐱'
  },
  {
    words: ['こうもり'],
    imageUrl: '🦇'
  },
  {
    words: ['りす', 'しまりす'],
    imageUrl: '🐿️'
  },
  {
    words: ['すし', 'まぐろ', 'しゃけ'],
    imageUrl: '🍣'
  },
  {
    words: ['しまうま'],
    imageUrl: '🦓'
  },
  {
    words: ['まつ'],
    imageUrl: '🌲'
  },
  {
    words: ['つき', 'みかづき'],
    imageUrl: '🌙'
  },
  {
    words: ['きのこ'],
    imageUrl: '🍄'
  },
  {
    words: ['こんぱす'],
    imageUrl: '🧭'
  },
  {
    words: ['すべりだい'],
    imageUrl: '🛝'
  },
  {
    words: ['いえ'],
    imageUrl: '🏠'
  }
];

// パネルをランダムに並び替えて生成
export const generatePanels = (): Panel[] => {
  const shuffled = [...panelData]
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return shuffled.map((data, index: number) => ({
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