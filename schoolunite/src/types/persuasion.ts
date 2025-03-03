export type Atmosphere = 'relaxed' | 'somewhat_relaxed' | 'normal' | 'somewhat_tense' | 'tense';

export type ActionType = 'topic' | 'election';
export type ElectionAction = 'promote_own' | 'criticize_opponent';

export interface GameState {
  atmosphere: Atmosphere;
  situation: number;  // -100 to 100
  turn: number;      // 1 to 5
  isPlayerTurn: boolean;
}

export const ATMOSPHERE_NAMES: Record<Atmosphere, string> = {
  relaxed: 'ゆるい',
  somewhat_relaxed: 'ややゆるい',
  normal: '普通',
  somewhat_tense: 'ややきびしい',
  tense: 'きびしい'
};

// 興味関心の日本語名マッピング
export const INTEREST_NAMES: Record<string, string> = {
  study: '勉強',
  athletic: '運動',
  video: '動画',
  games: 'ゲーム',
  fashion: 'ファッション',
  sns: 'SNS',
  music: '音楽',
  love: '恋愛'
};