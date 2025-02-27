import { Scene } from '../types/game'

export const INITIAL_SCENE: Scene = {
  id: 'start',
  text: '学園祭が始まった。今日は特別な一日になる予感がする...',
  characterExpression: 'normal',
  location: 'ground',
  choices: [
    {
      text: '教室に行ってみる',
      nextSceneId: 'classroom_1',
    },
    {
      text: '中庭のベンチで休憩する',
      nextSceneId: 'bench_1',
    },
    {
      text: '屋上に行ってみる',
      nextSceneId: 'rooftop_1',
    },
  ],
}

export const SCENARIOS: { [key: string]: Scene } = {
  classroom_1: {
    id: 'classroom_1',
    text: '教室に入ると、クラスメイトの彼女が文化祭の準備で忙しそうにしている...',
    characterExpression: 'normal',
    location: 'classroom',
    choices: [
      {
        text: '手伝いを申し出る',
        nextSceneId: 'classroom_2',
        effect: { affection: 2 },
      },
      {
        text: '様子を見守る',
        nextSceneId: 'classroom_3',
        effect: { affection: 0 },
      },
    ],
  },
  classroom_2: {
    id: 'classroom_2',
    text: '「ありがとう！助かります」彼女は嬉しそうな表情を見せた。',
    characterExpression: 'smile',
    location: 'classroom',
    choices: [
      {
        text: '一緒に装飾を完成させる',
        nextSceneId: 'classroom_4',
        effect: { affection: 3 },
      },
      {
        text: '他の場所も見て回る',
        nextSceneId: 'ground_1',
      },
    ],
  },
  bench_1: {
    id: 'bench_1',
    text: 'ベンチで休んでいると、彼女が困った様子で立ち止まっている...',
    characterExpression: 'sad',
    location: 'bench',
    choices: [
      {
        text: '声をかける',
        nextSceneId: 'bench_2',
        effect: { affection: 2 },
      },
      {
        text: '様子を見守る',
        nextSceneId: 'ground_1',
      },
    ],
  },
  rooftop_1: {
    id: 'rooftop_1',
    text: '屋上で彼女が一人で空を見上げている...',
    characterExpression: 'normal',
    location: 'rooftop',
    choices: [
      {
        text: '隣に立つ',
        nextSceneId: 'rooftop_2',
        effect: { affection: 2 },
      },
      {
        text: '別の場所に行く',
        nextSceneId: 'ground_1',
      },
    ],
  },
  rooftop_2: {
    id: 'rooftop_2',
    text: '「ここからの景色って綺麗だよね...」彼女は少し照れた様子で微笑んだ。',
    characterExpression: 'blush',
    location: 'rooftop',
    choices: [
      {
        text: '一緒に景色を楽しむ',
        nextSceneId: 'rooftop_3',
        effect: { affection: 3 },
      },
      {
        text: '学園祭を見に行こうと誘う',
        nextSceneId: 'ground_2',
        effect: { affection: 2 },
      },
    ],
  },
  ground_1: {
    id: 'ground_1',
    text: '学園祭は大賑わい。色々な出し物や屋台が並んでいる...',
    characterExpression: 'normal',
    location: 'ground',
    choices: [
      {
        text: '図書室で休憩する',
        nextSceneId: 'library_1',
      },
      {
        text: '体育館のイベントを見に行く',
        nextSceneId: 'gym_1',
      },
    ],
  },
  library_1: {
    id: 'library_1',
    text: '図書室で彼女が本を読んでいる。静かな空間が心地よい...',
    characterExpression: 'smile',
    location: 'library_room',
    choices: [
      {
        text: '隣で本を読む',
        nextSceneId: 'library_2',
        effect: { affection: 2 },
      },
      {
        text: '声をかける',
        nextSceneId: 'library_3',
        effect: { affection: 1 },
      },
    ],
  },
  gym_1: {
    id: 'gym_1',
    text: '体育館でダンスイベントが開催されている。彼女も参加しているようだ...',
    characterExpression: 'normal',
    location: 'school_gym',
    choices: [
      {
        text: 'ダンスに誘う',
        nextSceneId: 'gym_2',
        effect: { affection: 4 },
      },
      {
        text: '見学する',
        nextSceneId: 'gym_3',
        effect: { affection: 1 },
      },
    ],
  },
}

// エンディングシーン
export const ENDING_SCENES: { [key: string]: Scene } = {
  good_ending: {
    id: 'good_ending',
    text: '素晴らしい一日だった。彼女と過ごした思い出は、きっと一生忘れられない...',
    characterExpression: 'smile',
    location: 'park',
    choices: [],
  },
  normal_ending: {
    id: 'normal_ending',
    text: '学園祭は終わった。また彼女と話せる機会があることを願って...',
    characterExpression: 'normal',
    location: 'ground',
    choices: [],
  },
  bad_ending: {
    id: 'bad_ending',
    text: '結局、彼女と親密になることはできなかった...',
    characterExpression: 'sad',
    location: 'staircase',
    choices: [],
  },
}