import { Faction } from './student';

// 部活動ID
export enum ClubId {
  NONE = 0,         // 無所属
  BASEBALL = 1,     // 野球部
  SOCCER = 2,       // サッカー部
  TENNIS = 3,       // テニス部
  BASKETBALL = 4,   // バスケ部
  SWIMMING = 5,     // 水泳部
  JUDO = 6,         // 柔道部
  SCIENCE = 7,      // 科学部
  BRASS_BAND = 8,   // 吹奏楽部
  COMPUTER = 9,     // パソコン部
  CALLIGRAPHY = 10, // 書道部
  COOKING = 11,     // 調理部
  BROADCAST = 12,   // 放送部
  ART = 13,         // 美術部
  STUDENT_COUNCIL = 14, // 生徒会
  LIBRARY = 15,     // 図書委員会
  DISCIPLINE = 16,  // 風紀委員会
}

// 部活動情報
export interface Club {
  id: ClubId;
  name: string;
  type: 'sports' | 'culture' | 'committee'; // 運動部・文化部・委員会の区分
  description: string;
  memberLimit: number; // 部員数の上限（委員会は少人数）
  baseRoomId: string;  // 拠点となる部屋のID
  faction: Faction;    // 部活動の支持派閥
}

// 部活動データ
export const CLUB_DATA: { [key in ClubId]: Club } = {
  [ClubId.NONE]: {
    id: ClubId.NONE,
    name: '無所属',
    type: 'culture',
    description: '部活動に所属していません',
    memberLimit: 0,
    baseRoomId: '',
    faction: 'status_quo'
  },
  [ClubId.BASEBALL]: {
    id: ClubId.BASEBALL,
    name: '野球部',
    type: 'sports',
    description: '野球部',
    memberLimit: 20,
    baseRoomId: 'baseball',
    faction: 'militar'
  },
  [ClubId.SOCCER]: {
    id: ClubId.SOCCER,
    name: 'サッカー部',
    type: 'sports',
    description: 'サッカー部',
    memberLimit: 20,
    baseRoomId: 'ground',
    faction: 'militar'
  },
  [ClubId.TENNIS]: {
    id: ClubId.TENNIS,
    name: 'テニス部',
    type: 'sports',
    description: 'テニス部',
    memberLimit: 15,
    baseRoomId: 'tennis',
    faction: 'militar'
  },
  [ClubId.BASKETBALL]: {
    id: ClubId.BASKETBALL,
    name: 'バスケットボール部',
    type: 'sports',
    description: 'バスケットボール部',
    memberLimit: 15,
    baseRoomId: 'gym',
    faction: 'militar'
  },
  [ClubId.SWIMMING]: {
    id: ClubId.SWIMMING,
    name: '水泳部',
    type: 'sports',
    description: '水泳部',
    memberLimit: 15,
    baseRoomId: 'pool',
    faction: 'militar'
  },
  [ClubId.JUDO]: {
    id: ClubId.JUDO,
    name: '柔道部',
    type: 'sports',
    description: '柔道部',
    memberLimit: 15,
    baseRoomId: 'dojo',
    faction: 'militar'
  },
  [ClubId.SCIENCE]: {
    id: ClubId.SCIENCE,
    name: '科学部',
    type: 'culture',
    description: '科学部',
    memberLimit: 10,
    baseRoomId: 'science',
    faction: 'academic'
  },
  [ClubId.BRASS_BAND]: {
    id: ClubId.BRASS_BAND,
    name: '吹奏楽部',
    type: 'culture',
    description: '吹奏楽部',
    memberLimit: 20,
    baseRoomId: 'music',
    faction: 'status_quo'
  },
  [ClubId.COMPUTER]: {
    id: ClubId.COMPUTER,
    name: 'パソコン部',
    type: 'culture',
    description: 'パソコン部',
    memberLimit: 10,
    baseRoomId: 'computer',
    faction: 'academic'
  },
  [ClubId.CALLIGRAPHY]: {
    id: ClubId.CALLIGRAPHY,
    name: '書道部',
    type: 'culture',
    description: '書道部',
    memberLimit: 10,
    baseRoomId: 'tech',
    faction: 'status_quo'
  },
  [ClubId.COOKING]: {
    id: ClubId.COOKING,
    name: '調理部',
    type: 'culture',
    description: '調理部',
    memberLimit: 10,
    baseRoomId: 'homeec',
    faction: 'status_quo'
  },
  [ClubId.BROADCAST]: {
    id: ClubId.BROADCAST,
    name: '放送部',
    type: 'culture',
    description: '放送部',
    memberLimit: 10,
    baseRoomId: 'broadcast',
    faction: 'status_quo'
  },
  [ClubId.ART]: {
    id: ClubId.ART,
    name: '美術部',
    type: 'culture',
    description: '美術部',
    memberLimit: 10,
    baseRoomId: 'art',
    faction: 'status_quo'
  },
  [ClubId.STUDENT_COUNCIL]: {
    id: ClubId.STUDENT_COUNCIL,
    name: '生徒会',
    type: 'committee',
    description: '生徒会',
    memberLimit: 8,
    baseRoomId: 'student_council',
    faction: 'academic'
  },
  [ClubId.LIBRARY]: {
    id: ClubId.LIBRARY,
    name: '図書委員会',
    type: 'committee',
    description: '図書委員会',
    memberLimit: 6,
    baseRoomId: 'library',
    faction: 'academic'
  },
  [ClubId.DISCIPLINE]: {
    id: ClubId.DISCIPLINE,
    name: '風紀委員会',
    type: 'committee',
    description: '風紀委員会',
    memberLimit: 6,
    baseRoomId: 'guidance',
    faction: 'militar'
  }
};