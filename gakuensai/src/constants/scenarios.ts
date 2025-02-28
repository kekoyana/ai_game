import { Scene } from '../types/game'

export const INITIAL_SCENE: Scene = {
  id: 'start',
  text: '心地よい秋風が吹く中、学園祭が始まった。例年以上の賑わいの中、桜井さんの姿を探している。今日こそは、彼女に想いを伝えるチャンスかもしれない...',
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
    text: '教室に入ると、桜井さんが文化祭の装飾に苦心している様子。「あ、もう少し高いところに飾りを付けたいんだけど...」彼女は背伸びをしながら困った表情を浮かべている。手を貸せば、きっと喜んでくれるはず...',
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
    text: '「あ、本当に手伝ってくれるの？嬉しい！」桜井さんの目が輝く。「実は、この教室の飾り付けを任されていて...でも一人じゃ大変で困ってたんです。」彼女の頬が少し赤くなる。「一緒に素敵な教室にしましょう！」彼女の笑顔が、教室を明るく照らしているようだ。',
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
  classroom_3: {
    id: 'classroom_3',
    text: '桜井さんは一人で頑張って装飾を続けている。時々、こちらを見る視線が感じられる...',
    characterExpression: 'sad',
    location: 'classroom',
    choices: [
      {
        text: 'やっぱり手伝う',
        nextSceneId: 'classroom_2',
        effect: { affection: 1 },
      },
      {
        text: '別の場所に行く',
        nextSceneId: 'ground_1',
        effect: { affection: -1 },
      },
    ],
  },
  classroom_4: {
    id: 'classroom_4',
    text: '「これは、ここかな...」桜井さんと一緒に教室の装飾を進めていく。「あ、その飾りいいですね！」彼女が目を輝かせる。二人で協力しながら作業を進めるうちに、自然と会話が弾む。「実は、私、この学園祭をすごく楽しみにしてたんです。特に...一緒に準備できて嬉しいです。」彼女の言葉に、胸が温かくなる。',
    characterExpression: 'blush',
    location: 'classroom',
    choices: [
      {
        text: '「僕も一緒に準備できて楽しいよ」',
        nextSceneId: 'classroom_5',
        effect: { affection: 4 },
      },
      {
        text: '「もう少し手伝おうか？」',
        nextSceneId: 'ground_2',
        effect: { affection: 2 },
      },
    ],
  },
  classroom_5: {
    id: 'classroom_5',
    text: '桜井さんは嬉しそうに微笑んで、「ありがとう...これからの学園祭が、もっと楽しみになりました。」と言った。二人で完成させた教室の装飾が、まるで私たちの気持ちを表しているかのように輝いている。',
    characterExpression: 'smile',
    location: 'classroom',
    choices: [
      {
        text: '「一緒に他の場所も見に行かない？」',
        nextSceneId: 'ground_2',
        effect: { affection: 3 },
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
  bench_2: {
    id: 'bench_2',
    text: '「あの...実は迷子になってしまって...」桜井さんは恥ずかしそうに説明する。「文化祭で色々な場所に行きたくて、でも学校の配置図を持ってくるのを忘れちゃって...」彼女の困った表情が、どこか愛らしい。',
    characterExpression: 'blush',
    location: 'bench',
    choices: [
      {
        text: '「一緒に案内しようか？」',
        nextSceneId: 'bench_3',
        effect: { affection: 3 },
      },
      {
        text: '配置図を取りに行く',
        nextSceneId: 'ground_1',
        effect: { affection: 2 },
      },
    ],
  },
  bench_3: {
    id: 'bench_3',
    text: '「本当に？ありがとうございます！」桜井さんの表情が明るくなる。「実は、体育館のダンスイベントに出たいと思ってて...でも、道がわからなくて...」彼女は少し照れながら説明した。「一緒に行ってくれますか？」',
    characterExpression: 'smile',
    location: 'bench',
    choices: [
      {
        text: '体育館まで案内する',
        nextSceneId: 'gym_1',
        effect: { affection: 2 },
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
    text: '「ここからの景色って綺麗だよね...」桜井さんは秋の空を見上げながら、柔らかな声で語り始めた。「小学生の頃から、この屋上が私の特別な場所なの。悩み事があるときも、嬉しいことがあるときも、ここに来るの...」彼女は少し恥ずかしそうに頬を染める。「今日、あなたとここで一緒に居られて...すごく嬉しいです。」その言葉に、心臓が大きく高鳴る。',
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
  rooftop_3: {
    id: 'rooftop_3',
    text: '夕暮れの空が、オレンジ色に染まっていく。「私ね、小さい頃から星を見るのが好きだったの。」桜井さんは懐かしそうに空を見上げる。「今日は特別な日だから...もしかしたら、流れ星が見えるかもしれないね。」彼女の横顔が、夕陽に照らされて綺麗だ。',
    characterExpression: 'smile',
    location: 'rooftop',
    choices: [
      {
        text: '「願い事はある？」',
        nextSceneId: 'rooftop_4',
        effect: { affection: 4 },
      },
      {
        text: '静かに星を待つ',
        nextSceneId: 'rooftop_5',
        effect: { affection: 3 },
      },
    ],
  },
  rooftop_4: {
    id: 'rooftop_4',
    text: '「願い事...」桜井さんは空を見上げたまま、少し考え込む。「それはね...」彼女はこちらを見て、優しく微笑んだ。「まだ、内緒...でも、きっと叶うと思うの。だって...」彼女の言葉が途切れ、頬が赤くなる。「あ、流れ星！」突然の歓声と共に、夜空に一筋の光が走った。',
    characterExpression: 'blush',
    location: 'rooftop',
    choices: [
      {
        text: '「僕も同じ願い事をしたよ」',
        nextSceneId: 'good_ending',
        effect: { affection: 5 },
      },
      {
        text: '「綺麗だったね」',
        nextSceneId: 'normal_ending',
        effect: { affection: 3 },
      },
    ],
  },
  rooftop_5: {
    id: 'rooftop_5',
    text: '静かに星空を眺めていると、桜井さんが少しずつ近づいてくる。「ねぇ...」彼女の声が風に乗って届く。「こうして隣にいてくれて...嬉しいです。」その言葉に、心臓の鼓動が早くなる。',
    characterExpression: 'smile',
    location: 'rooftop',
    choices: [
      {
        text: '「僕も嬉しいよ」',
        nextSceneId: 'good_ending',
        effect: { affection: 4 },
      },
      {
        text: '黙って微笑む',
        nextSceneId: 'normal_ending',
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
  ground_2: {
    id: 'ground_2',
    text: '夕暮れ時の校庭は、オレンジ色に染まっている。桜井さんが隣で嬉しそうに微笑んでいる。「今日は本当に楽しかった...」彼女の声には、特別な感情が込められているようだ。',
    characterExpression: 'smile',
    location: 'ground',
    choices: [
      {
        text: '「まだ一緒にいたい」',
        nextSceneId: 'good_ending',
        effect: { affection: 4 },
      },
      {
        text: '「また会えるといいね」',
        nextSceneId: 'normal_ending',
        effect: { affection: 2 },
      },
    ],
  },
  library_1: {
    id: 'library_1',
    text: '図書室の窓から差し込む柔らかな陽光の中、桜井さんが文学全集を手に読み耽っている。「啊...」小さなため息が漏れる。「この本、すごく素敵な物語なの。」彼女は本から顔を上げ、輝く瞳で語り始めた。「私ね、物語の世界に入り込むのが大好きなんです。特に今日みたいな静かな午後は...」その言葉に、彼女の繊細な心が垣間見える。',
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
  library_2: {
    id: 'library_2',
    text: '静かな図書室で、二人で一冊の本を共有する時間。桜井さんの指が物語の一節を指す。「ここが...私の一番好きな場面なんです。」彼女の声が柔らかく響く。「勇気を出して想いを伝えるシーン...」その言葉に、心臓が高鳴る。',
    characterExpression: 'blush',
    location: 'library_room',
    choices: [
      {
        text: '「僕も想いを伝えたい」',
        nextSceneId: 'good_ending',
        effect: { affection: 5 },
      },
      {
        text: '「また一緒に読もうね」',
        nextSceneId: 'normal_ending',
        effect: { affection: 3 },
      },
    ],
  },
  library_3: {
    id: 'library_3',
    text: '「あ...」桜井さんは読書の世界から現実に引き戻される。「こんな所で会えるなんて...嬉しいです。」彼女は本を胸に抱きながら微笑む。「この図書室って、私の秘密の隠れ家みたいな場所なんです。」',
    characterExpression: 'smile',
    location: 'library_room',
    choices: [
      {
        text: '「素敵な場所だね」',
        nextSceneId: 'library_2',
        effect: { affection: 3 },
      },
      {
        text: '「おすすめの本はある？」',
        nextSceneId: 'library_2',
        effect: { affection: 2 },
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
  gym_2: {
    id: 'gym_2',
    text: '「え...私と、ダンス...？」桜井さんは驚きながらも、嬉しそうな表情を隠せない。「実は、少し練習はしてたんです...でも、一人じゃ自信なくて...」彼女の手が少し震えている。「でも、あなたと一緒なら...」彼女は勇気を出して手を差し伸べた。',
    characterExpression: 'blush',
    location: 'school_gym',
    choices: [
      {
        text: '優しくリードする',
        nextSceneId: 'gym_4',
        effect: { affection: 5 },
      },
      {
        text: '一緒に練習する',
        nextSceneId: 'ground_2',
        effect: { affection: 3 },
      },
    ],
  },
  gym_3: {
    id: 'gym_3',
    text: '桜井さんは少し寂しそうな表情を見せながら、他の生徒とダンスを踊っている。時々、こちらを見る視線が感じられる...。',
    characterExpression: 'sad',
    location: 'school_gym',
    choices: [
      {
        text: 'やっぱりダンスに誘う',
        nextSceneId: 'gym_2',
        effect: { affection: 3 },
      },
      {
        text: '別の場所に行く',
        nextSceneId: 'ground_1',
        effect: { affection: -1 },
      },
    ],
  },
  gym_4: {
    id: 'gym_4',
    text: '優しく手を取ると、桜井さんは小さく頷いた。音楽に合わせて踊り始めると、最初の緊張は徐々に解けていき、彼女の表情も明るくなっていく。「こんなに楽しいダンス、初めて...」彼女の瞳が潤んでいる。「ありがとう...」その言葉に、心が高鳴る。',
    characterExpression: 'smile',
    location: 'school_gym',
    choices: [
      {
        text: '「もう一曲、踊らない？」',
        nextSceneId: 'good_ending',
        effect: { affection: 4 },
      },
      {
        text: '「休憩しようか」',
        nextSceneId: 'ground_2',
        effect: { affection: 3 },
      },
    ],
  },
}

export const ENDING_SCENES: { [key: string]: Scene } = {
  good_ending: {
    id: 'good_ending',
    text: '夕暮れ時の公園で、桜井さんが優しく微笑みかける。「今日は、本当に楽しかった...」彼女の瞳が夕陽に輝いている。「あのね、私...ずっと言いたかったことがあるの。」彼女の頬が染まる。「これからも...一緒にいてくれますか？」この瞬間が、永遠に続けばいいのに...そう思いながら、確かな答えを口にする。',
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