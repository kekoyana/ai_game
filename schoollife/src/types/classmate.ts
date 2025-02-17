export interface Classmate {
  id: string;
  name: string;
  gender: 'male' | 'female';
  personality: string;
  hobby: string;
  club: 'none' | 'sports' | 'cultural' | 'student_council';
  stats: {
    academic: number;
    athletic: number;
    artistic: number;
    social: number;
  };
  friendship: number;  // プレイヤーとの友好度（0-100）
  description: string;
}

export const initialClassmates: Classmate[] = [
  {
    id: "suzuki",
    name: "鈴木陽太",
    gender: "male",
    personality: "明るく活発",
    hobby: "サッカー",
    club: "sports",
    stats: {
      academic: 650,
      athletic: 850,
      artistic: 400,
      social: 750
    },
    friendship: 0,
    description: "クラスの人気者で運動神経抜群。誰とでも仲良くなれる社交的な性格。"
  },
  {
    id: "yamamoto",
    name: "山本さくら",
    gender: "female",
    personality: "真面目で優しい",
    hobby: "読書",
    club: "cultural",
    stats: {
      academic: 850,
      athletic: 450,
      artistic: 700,
      social: 600
    },
    friendship: 0,
    description: "成績優秀で図書委員。絵を描くのが得意で、放課後はよく図書室にいる。"
  },
  {
    id: "tanaka",
    name: "田中美咲",
    gender: "female",
    personality: "しっかり者",
    hobby: "ピアノ",
    club: "student_council",
    stats: {
      academic: 800,
      athletic: 500,
      artistic: 800,
      social: 850
    },
    friendship: 0,
    description: "生徒会長で、クラスのまとめ役。リーダーシップがあり、信頼されている。"
  },
  {
    id: "nakamura",
    name: "中村翔太",
    gender: "male",
    personality: "マイペース",
    hobby: "ゲーム",
    club: "none",
    stats: {
      academic: 600,
      athletic: 400,
      artistic: 650,
      social: 500
    },
    friendship: 0,
    description: "ゲームと漫画が大好きなオタク。意外と話が合う人が多い。"
  },
  {
    id: "sato",
    name: "佐藤花子",
    gender: "female",
    personality: "元気いっぱい",
    hobby: "料理",
    club: "cultural",
    stats: {
      academic: 600,
      athletic: 600,
      artistic: 750,
      social: 700
    },
    friendship: 0,
    description: "お菓子作りが得意で、よくクラスメートにお菓子を配っている。"
  }
];