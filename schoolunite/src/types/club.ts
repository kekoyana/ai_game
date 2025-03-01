// 部活動ID
export enum ClubId {
  NONE = 0,         // 無所属
  BASEBALL = 1,     // 野球部
  SOCCER = 2,       // サッカー部
  ART = 3,          // 美術部
  LIBRARY = 4,      // 図書委員会
}

// 部活動情報
export interface Club {
  id: ClubId;
  name: string;
  type: 'sports' | 'culture' | 'committee'; // 運動部・文化部・委員会の区分
  description: string;
  memberLimit: number; // 部員数の上限（委員会は少人数）
}

// 部活動データ
export const CLUB_DATA: { [key in ClubId]: Club } = {
  [ClubId.NONE]: {
    id: ClubId.NONE,
    name: '無所属',
    type: 'culture',
    description: '部活動に所属していません',
    memberLimit: 0,
  },
  [ClubId.BASEBALL]: {
    id: ClubId.BASEBALL,
    name: '野球部',
    type: 'sports',
    description: '熱心な指導で地区大会優勝を目指しています',
    memberLimit: 20,
  },
  [ClubId.SOCCER]: {
    id: ClubId.SOCCER,
    name: 'サッカー部',
    type: 'sports',
    description: '放課後のグラウンドで日々練習に励んでいます',
    memberLimit: 20,
  },
  [ClubId.ART]: {
    id: ClubId.ART,
    name: '美術部',
    type: 'culture',
    description: '様々な作品制作に取り組んでいます',
    memberLimit: 15,
  },
  [ClubId.LIBRARY]: {
    id: ClubId.LIBRARY,
    name: '図書委員会',
    type: 'committee',
    description: '図書室の運営をサポートしています',
    memberLimit: 8,
  },
};