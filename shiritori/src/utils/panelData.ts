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
    words: ['きつね', 'けもの'],
    imageUrl: '🦊'
  },
  {
    words: ['ねこ', 'にゃんこ'],
    imageUrl: '🐱'
  },
  {
    words: ['こうもり', 'こうもり'],
    imageUrl: '🦇'
  },
  {
    words: ['りんご', 'りんご'],
    imageUrl: '🍎'
  },
  {
    words: ['ごりら', 'ごりら'],
    imageUrl: '🦍'
  },
  {
    words: ['らっぱ', 'らっぱ'],
    imageUrl: '🎺'
  },
  {
    words: ['ぱいなっぷる', 'ぱいなっぷる'],
    imageUrl: '🍍'
  },
  {
    words: ['るびー', 'るびー'],
    imageUrl: '💎'
  },
  {
    words: ['いか', 'いか'],
    imageUrl: '🦑'
  },
  {
    words: ['かに', 'かに'],
    imageUrl: '🦀'
  },
  {
    words: ['にわとり', 'にわとり'],
    imageUrl: '🐓'
  },
  {
    words: ['りす', 'りす'],
    imageUrl: '🐿️'
  },
  {
    words: ['すいか', 'すいか'],
    imageUrl: '🍉'
  },
  {
    words: ['かば', 'かば'],
    imageUrl: '🦛'
  },
  {
    words: ['ばなな', 'ばなな'],
    imageUrl: '🍌'
  },
  {
    words: ['なし', 'なし'],
    imageUrl: '🍐'
  },
  {
    words: ['しか', 'しか'],
    imageUrl: '🦌'
  },
  {
    words: ['かめ', 'かめ'],
    imageUrl: '🐢'
  },
  {
    words: ['めがね', 'めがね'],
    imageUrl: '👓'
  },
  {
    words: ['ねずみ', 'ねずみ'],
    imageUrl: '🐭'
  },
  {
    words: ['ねっくれす', 'ねっくれす'],
    imageUrl: '📿'
  },
  {
    words: ['すまほ', 'すまほ'],
    imageUrl: '📱'
  },
  {
    words: ['ほうき', 'ほうき'],
    imageUrl: '🧹'
  },
  {
    words: ['きりん', 'きりん'],
    imageUrl: '🦒'
  },
  {
    words: ['んま', 'んま'],
    imageUrl: '🐎'
  },
  {
    words: ['まんが', 'まんが'],
    imageUrl: '📚'
  },
  {
    words: ['がちょう', 'がちょう'],
    imageUrl: '🦢'
  },
  {
    words: ['うさぎ', 'うさぎ'],
    imageUrl: '🐰'
  },
  {
    words: ['ぎたー', 'ぎたー'],
    imageUrl: '🎸'
  },
  {
    words: ['たまご', 'たまご'],
    imageUrl: '🥚'
  },
  {
    words: ['ごりら', 'ごりら'],
    imageUrl: '🦍'
  },
  {
    words: ['らっこ', 'らっこ'],
    imageUrl: '🦦'
  },
  {
    words: ['こあら', 'こあら'],
    imageUrl: '🐨'
  },
  {
    words: ['らむ', 'らむ'],
    imageUrl: '🐑'
  },
  {
    words: ['むぎ', 'むぎ'],
    imageUrl: '🌾'
  },
  {
    words: ['ぎんこう', 'ぎんこう'],
    imageUrl: '🏦'
  },
  {
    words: ['うま', 'うま'],
    imageUrl: '🐎'
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