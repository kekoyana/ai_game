import { useState } from 'react';
import { PlayerState } from '../types/player';
import './Game.css';

const initialPlayerState: PlayerState = {
  name: 'プレイヤー',
  stats: {
    academic: 100,    // 初期学力
    physical: 100,    // 初期体力
    social: 100,      // 初期社交性
    stress: 0,        // 初期ストレス
    energy: 100,      // 初期体力
  },
  relationships: {},
  money: 1000,
  day: 1,
  time: 'morning',
  isWeekend: false,
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
    
    // 月の日数（簡易版：全ての月を30日とする）
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
        // 1日の終わり
        const nextDay = prev.day + 1;
        return {
          ...prev,
          day: nextDay,
          time: 'morning',
          isWeekend: (nextDay % 7) >= 6, // 6,7日目は週末
          stats: {
            ...prev.stats,
            energy: 100, // 新しい日は体力全回復
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
      energy: Math.max(playerState.stats.energy - 15, 0),
      stress: Math.min(playerState.stats.stress + 5, 100),
    });
    advanceTime();
  };

  const study = () => {
    if (playerState.stats.energy >= 20) {
      updateStats({
        academic: Math.min(playerState.stats.academic + 2, 1000),
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
        energy: playerState.stats.energy - 15,
        stress: Math.max(playerState.stats.stress - 10, 0),
      });
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
        <p>体力: {playerState.stats.energy}</p>
        <p>ストレス: {playerState.stats.stress}</p>
      </div>

      <div className="action-panel">
        <h2>行動選択</h2>
        {!playerState.isWeekend && (playerState.time === 'morning' || playerState.time === 'afternoon') ? (
          <button onClick={attendClass}>
            授業を受ける（体力-15, 学力+1, ストレス+5）
          </button>
        ) : (
          <>
            <button 
              onClick={study}
              disabled={playerState.stats.energy < 20}>
              勉強する（体力-20, 学力+2, ストレス+10）
            </button>
            <button 
              onClick={exercise}
              disabled={playerState.stats.energy < 20}>
              運動する（体力-20, 体力+2, ストレス-5）
            </button>
            <button 
              onClick={socialize}
              disabled={playerState.stats.energy < 15}>
              交流する（体力-15, 社交性+2, ストレス-10）
            </button>
            <button onClick={rest}>
              休憩する（体力+30, ストレス-20）
            </button>
          </>
        )}
      </div>
    </div>
  );
};