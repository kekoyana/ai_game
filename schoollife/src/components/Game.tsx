import { useState } from 'react';
import { PlayerState, ClubType } from '../types/player';
import './Game.css';

const initialPlayerState: PlayerState = {
  name: 'プレイヤー',
  stats: {
    academic: 100,      // 初期学力
    physical: 100,      // 初期体力
    social: 100,        // 初期社交性
    artistic: 100,      // 初期芸術性
    intelligence: 100,  // 初期知性
    charisma: 100,      // 初期カリスマ性
    athletic: 100,      // 初期運動神経
    stress: 0,          // 初期ストレス
    energy: 100,        // 初期体力
  },
  relationships: {},
  money: 1000,
  day: 1,
  time: 'morning',
  isWeekend: false,
  club: 'none'
};

export const Game: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState);

  const updateStats = (statChanges: Partial<PlayerState['stats']>) => {
    setPlayerState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        ...statChanges,
      }
    }));
  };

  const getDateDisplay = (day: number) => {
    const monthStart = 4; // 4月スタート
    let currentMonth = monthStart;
    let currentDay = day;
    
    while (currentDay > 30) {
      currentMonth++;
      currentDay -= 30;
      if (currentMonth > 12) {
        currentMonth = 1;
      }
    }
    
    return `${currentMonth}月${currentDay}日目`;
  };

  const advanceTime = () => {
    setPlayerState(prev => {
      const times: PlayerState['time'][] = ['morning', 'afternoon', 'evening'];
      const currentTimeIndex = times.indexOf(prev.time);
      const newTime = times[(currentTimeIndex + 1) % times.length];
      
      if (currentTimeIndex === times.length - 1) {
        const nextDay = prev.day + 1;
        return {
          ...prev,
          day: nextDay,
          time: 'morning',
          isWeekend: (nextDay % 7) >= 6,
          stats: {
            ...prev.stats,
            energy: 100,
          }
        };
      }

      return {
        ...prev,
        time: newTime,
      };
    });
  };

  const attendClass = () => {
    updateStats({
      academic: Math.min(playerState.stats.academic + 1, 1000),
      intelligence: Math.min(playerState.stats.intelligence + 1, 1000),
      energy: Math.max(playerState.stats.energy - 15, 0),
      stress: Math.min(playerState.stats.stress + 5, 100),
    });
    advanceTime();
  };

  const study = () => {
    if (playerState.stats.energy >= 20) {
      updateStats({
        academic: Math.min(playerState.stats.academic + 2, 1000),
        intelligence: Math.min(playerState.stats.intelligence + 1, 1000),
        energy: playerState.stats.energy - 20,
        stress: Math.min(playerState.stats.stress + 10, 100),
      });
      advanceTime();
    }
  };

  const exercise = () => {
    if (playerState.stats.energy >= 20) {
      updateStats({
        physical: Math.min(playerState.stats.physical + 2, 1000),
        athletic: Math.min(playerState.stats.athletic + 2, 1000),
        energy: playerState.stats.energy - 20,
        stress: Math.max(playerState.stats.stress - 5, 0),
      });
      advanceTime();
    }
  };

  const socialize = () => {
    if (playerState.stats.energy >= 15) {
      updateStats({
        social: Math.min(playerState.stats.social + 2, 1000),
        charisma: Math.min(playerState.stats.charisma + 1, 1000),
        energy: playerState.stats.energy - 15,
        stress: Math.max(playerState.stats.stress - 10, 0),
      });
      advanceTime();
    }
  };

  const read = () => {
    if (playerState.stats.energy >= 15) {
      updateStats({
        intelligence: Math.min(playerState.stats.intelligence + 2, 1000),
        academic: Math.min(playerState.stats.academic + 1, 1000),
        energy: playerState.stats.energy - 15,
        stress: Math.min(playerState.stats.stress + 5, 100),
      });
      advanceTime();
    }
  };

  const art = () => {
    if (playerState.stats.energy >= 20) {
      updateStats({
        artistic: Math.min(playerState.stats.artistic + 2, 1000),
        stress: Math.max(playerState.stats.stress - 10, 0),
        energy: playerState.stats.energy - 20,
      });
      advanceTime();
    }
  };

  const clubActivity = () => {
    if (playerState.stats.energy >= 25) {
      if (playerState.club === 'sports') {
        updateStats({
          athletic: Math.min(playerState.stats.athletic + 3, 1000),
          physical: Math.min(playerState.stats.physical + 2, 1000),
          energy: playerState.stats.energy - 25,
          stress: Math.min(playerState.stats.stress + 8, 100),
        });
      } else if (playerState.club === 'cultural') {
        updateStats({
          artistic: Math.min(playerState.stats.artistic + 3, 1000),
          intelligence: Math.min(playerState.stats.intelligence + 2, 1000),
          energy: playerState.stats.energy - 25,
          stress: Math.min(playerState.stats.stress + 8, 100),
        });
      } else if (playerState.club === 'student_council') {
        updateStats({
          charisma: Math.min(playerState.stats.charisma + 3, 1000),
          social: Math.min(playerState.stats.social + 2, 1000),
          energy: playerState.stats.energy - 25,
          stress: Math.min(playerState.stats.stress + 8, 100),
        });
      }
      advanceTime();
    }
  };

  const rest = () => {
    updateStats({
      energy: Math.min(playerState.stats.energy + 30, 100),
      stress: Math.max(playerState.stats.stress - 20, 0),
    });
    advanceTime();
  };

  const joinClub = (clubType: ClubType) => {
    setPlayerState(prev => ({
      ...prev,
      club: clubType
    }));
  };

  return (
    <div className="game-container">
      <div className="status-panel">
        <h2>ステータス</h2>
        <p>日付: {getDateDisplay(playerState.day)} ({playerState.isWeekend ? '週末' : '平日'})</p>
        <p>時間帯: {
          playerState.time === 'morning' ? '朝' :
          playerState.time === 'afternoon' ? '昼' : '夕方'
        }</p>
        <h3>能力値</h3>
        <p>学力: {playerState.stats.academic}</p>
        <p>体力: {playerState.stats.physical}</p>
        <p>社交性: {playerState.stats.social}</p>
        <p>芸術性: {playerState.stats.artistic}</p>
        <p>知性: {playerState.stats.intelligence}</p>
        <p>カリスマ性: {playerState.stats.charisma}</p>
        <p>運動神経: {playerState.stats.athletic}</p>
        <p>体力: {playerState.stats.energy}</p>
        <p>ストレス: {playerState.stats.stress}</p>
      </div>

      <div className="action-panel">
        <h2>行動選択</h2>
        {!playerState.isWeekend && (playerState.time === 'morning' || playerState.time === 'afternoon') ? (
          <button onClick={attendClass}>
            授業を受ける（体力-15, 学力+1, 知性+1, ストレス+5）
          </button>
        ) : (
          <>
            <button 
              onClick={study}
              disabled={playerState.stats.energy < 20}>
              勉強する（体力-20, 学力+2, 知性+1, ストレス+10）
            </button>
            <button 
              onClick={exercise}
              disabled={playerState.stats.energy < 20}>
              運動する（体力-20, 体力+2, 運動神経+2, ストレス-5）
            </button>
            <button 
              onClick={socialize}
              disabled={playerState.stats.energy < 15}>
              交流する（体力-15, 社交性+2, カリスマ性+1, ストレス-10）
            </button>
            <button
              onClick={read}
              disabled={playerState.stats.energy < 15}>
              読書する（体力-15, 知性+2, 学力+1, ストレス+5）
            </button>
            <button
              onClick={art}
              disabled={playerState.stats.energy < 20}>
              芸術活動（体力-20, 芸術性+2, ストレス-10）
            </button>
            {playerState.club !== 'none' && (
              <button
                onClick={clubActivity}
                disabled={playerState.stats.energy < 25}>
                部活動（体力-25, 能力+3/+2, ストレス+8）
              </button>
            )}
            <button onClick={rest}>
              休憩する（体力+30, ストレス-20）
            </button>
          </>
        )}
      </div>

      {playerState.club === 'none' && (
        <div className="club-selection">
          <h2>部活選択</h2>
          <button onClick={() => joinClub('sports')}>運動部に入部</button>
          <button onClick={() => joinClub('cultural')}>文化部に入部</button>
          <button onClick={() => joinClub('student_council')}>生徒会に入部</button>
        </div>
      )}
    </div>
  );
};