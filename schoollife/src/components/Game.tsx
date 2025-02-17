import { useState } from 'react';
import { PlayerState, ClubType } from '../types/player';
import { Classmate, initialClassmates } from '../types/classmate';
import './Game.css';

const initialPlayerState: PlayerState = {
  name: 'プレイヤー',
  stats: {
    academic: 100,
    physical: 100,
    social: 100,
    artistic: 100,
    intelligence: 100,
    charisma: 100,
    athletic: 100,
    stress: 0,
    energy: 100,
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
  const [classmates, setClassmates] = useState<Classmate[]>(initialClassmates);
  const [selectedClassmate, setSelectedClassmate] = useState<Classmate | null>(null);
  const [activePanel, setActivePanel] = useState<'actions' | 'classmates'>('actions');

  const updateStats = (statChanges: Partial<PlayerState['stats']>) => {
    setPlayerState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        ...statChanges,
      }
    }));
  };

  const updateFriendship = (classmateId: string, amount: number) => {
    setClassmates(prev => 
      prev.map(classmate => 
        classmate.id === classmateId
          ? { ...classmate, friendship: Math.min(Math.max(classmate.friendship + amount, 0), 100) }
          : classmate
      )
    );
  };

  const getDateDisplay = (day: number) => {
    const monthStart = 4;
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

  const interactWithClassmate = (classmate: Classmate) => {
    if (playerState.stats.energy >= 15) {
      updateStats({
        social: Math.min(playerState.stats.social + 2, 1000),
        energy: playerState.stats.energy - 15,
        stress: Math.max(playerState.stats.stress - 8, 0),
      });
      updateFriendship(classmate.id, 5);
      advanceTime();
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="basic-info">
          <p>日付: {getDateDisplay(playerState.day)} ({playerState.isWeekend ? '週末' : '平日'})</p>
          <p>時間帯: {
            playerState.time === 'morning' ? '朝' :
            playerState.time === 'afternoon' ? '昼' : '夕方'
          }</p>
        </div>
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activePanel === 'actions' ? 'active' : ''}`}
            onClick={() => setActivePanel('actions')}
          >
            行動
          </button>
          <button 
            className={`tab-button ${activePanel === 'classmates' ? 'active' : ''}`}
            onClick={() => setActivePanel('classmates')}
          >
            クラスメート
          </button>
        </div>
      </div>

      <div className="game-main">
        <div className="left-column">
          <div className="status-panel">
            <h3>ステータス</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">学力:</span>
                <span className="stat-value">{playerState.stats.academic}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">体力:</span>
                <span className="stat-value">{playerState.stats.physical}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">社交性:</span>
                <span className="stat-value">{playerState.stats.social}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">芸術性:</span>
                <span className="stat-value">{playerState.stats.artistic}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">知性:</span>
                <span className="stat-value">{playerState.stats.intelligence}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">カリスマ性:</span>
                <span className="stat-value">{playerState.stats.charisma}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">運動神経:</span>
                <span className="stat-value">{playerState.stats.athletic}</span>
              </div>
              <div className="stat-item condition">
                <span className="stat-label">体力:</span>
                <span className="stat-value">{playerState.stats.energy}</span>
              </div>
              <div className="stat-item condition">
                <span className="stat-label">ストレス:</span>
                <span className="stat-value">{playerState.stats.stress}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="right-column">
          {activePanel === 'actions' ? (
            <div className="action-panel">
              <h3>行動選択</h3>
              {!playerState.isWeekend && (playerState.time === 'morning' || playerState.time === 'afternoon') ? (
                <button onClick={attendClass}>
                  授業を受ける（体力-15, 学力+1, 知性+1）
                </button>
              ) : (
                <>
                  <button 
                    onClick={study}
                    disabled={playerState.stats.energy < 20}>
                    勉強する（体力-20, 学力+2）
                  </button>
                  <button 
                    onClick={exercise}
                    disabled={playerState.stats.energy < 20}>
                    運動する（体力-20, 体力+2）
                  </button>
                  <button 
                    onClick={socialize}
                    disabled={playerState.stats.energy < 15}>
                    交流する（体力-15, 社交性+2）
                  </button>
                  <button
                    onClick={read}
                    disabled={playerState.stats.energy < 15}>
                    読書する（体力-15, 知性+2）
                  </button>
                  <button
                    onClick={art}
                    disabled={playerState.stats.energy < 20}>
                    芸術活動（体力-20, 芸術性+2）
                  </button>
                  {playerState.club !== 'none' && (
                    <button
                      onClick={clubActivity}
                      disabled={playerState.stats.energy < 25}>
                      部活動（体力-25, 能力+3）
                    </button>
                  )}
                  <button onClick={rest}>
                    休憩する（体力+30, ストレス-20）
                  </button>
                </>
              )}

              {playerState.club === 'none' && (
                <div className="club-selection">
                  <h3>部活選択</h3>
                  <button onClick={() => joinClub('sports')}>運動部に入部</button>
                  <button onClick={() => joinClub('cultural')}>文化部に入部</button>
                  <button onClick={() => joinClub('student_council')}>生徒会に入部</button>
                </div>
              )}
            </div>
          ) : (
            <div className="classmates-panel">
              <h3>クラスメート</h3>
              <div className="classmates-grid">
                {classmates.map(classmate => (
                  <div 
                    key={classmate.id} 
                    className={`classmate-card ${selectedClassmate?.id === classmate.id ? 'selected' : ''}`}
                    onClick={() => setSelectedClassmate(
                      selectedClassmate?.id === classmate.id ? null : classmate
                    )}
                  >
                    <h4>{classmate.name}</h4>
                    <div className="classmate-info">
                      <p>友好度: {classmate.friendship}</p>
                      {selectedClassmate?.id === classmate.id && (
                        <>
                          <p className="description">{classmate.description}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              interactWithClassmate(classmate);
                            }}
                            disabled={playerState.stats.energy < 15}>
                            交流する（体力-15）
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};