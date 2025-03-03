import React, { useState, useEffect } from 'react';
import { Student, Interests, FACTION_NAMES } from '../types/student';
import { studentManager } from '../data/studentData';
import {
  Atmosphere,
  ActionType,
  ElectionAction,
  GameState,
  ATMOSPHERE_NAMES,
  INTEREST_NAMES
} from '../types/persuasion';
import './PersuasionModal.css';

interface PersuasionModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

// 場の空気の変化を処理するヘルパー関数
const relaxAtmosphere = (current: Atmosphere): Atmosphere => {
  switch (current) {
    case 'tense': return 'somewhat_tense';
    case 'somewhat_tense': return 'normal';
    case 'normal': return 'somewhat_relaxed';
    case 'somewhat_relaxed': return 'relaxed';
    default: return current;
  }
};

const tenseAtmosphere = (current: Atmosphere): Atmosphere => {
  switch (current) {
    case 'relaxed': return 'somewhat_relaxed';
    case 'somewhat_relaxed': return 'normal';
    case 'normal': return 'somewhat_tense';
    case 'somewhat_tense': return 'tense';
    default: return current;
  }
};

// 成功確率を計算するヘルパー関数
const calculatePromoteSuccess = (attacker: Student, defender: Student, atmosphere: Atmosphere): number => {
  let baseChance = 0.5;
  
  // 知力差によるボーナス/ペナルティ
  const intelligenceDiff = attacker.intelligence - defender.intelligence;
  baseChance += intelligenceDiff * 0.002; // 知力差50で±10%

  // 場の空気による補正
  switch (atmosphere) {
    case 'relaxed': baseChance += 0.2; break;
    case 'somewhat_relaxed': baseChance += 0.1; break;
    case 'somewhat_tense': baseChance -= 0.1; break;
    case 'tense': baseChance -= 0.2; break;
  }

  return Math.max(0.1, Math.min(0.9, baseChance));
};

const calculateCriticizeSuccess = (attacker: Student, defender: Student, atmosphere: Atmosphere): number => {
  let baseChance = 0.5;
  
  // 武力差によるボーナス/ペナルティ
  const strengthDiff = attacker.strength - defender.strength;
  baseChance += strengthDiff * 0.002; // 武力差50で±10%

  // 場の空気による補正
  switch (atmosphere) {
    case 'relaxed': baseChance -= 0.2; break;
    case 'somewhat_relaxed': baseChance -= 0.1; break;
    case 'somewhat_tense': baseChance += 0.1; break;
    case 'tense': baseChance += 0.2; break;
  }

  return Math.max(0.1, Math.min(0.9, baseChance));
};

// 派閥支持率を更新するヘルパー関数
const updateFactionSupport = (player: Student, opponent: Student, playerWon: boolean, situationStrength: number) => {
  const changeAmount = Math.floor(situationStrength / 10); // 最大10%の変動

  if (playerWon) {
    // プレイヤーの勝利: 相手の支持率を変更
    const updates: Partial<Record<keyof typeof opponent.support, number>> = {
      [player.faction]: opponent.support[player.faction] + changeAmount,
      [opponent.faction]: opponent.support[opponent.faction] - changeAmount
    };
    studentManager.updateSupport(opponent.id, updates);
  } else {
    // 相手の勝利: プレイヤーの支持率を変更
    const updates: Partial<Record<keyof typeof player.support, number>> = {
      [opponent.faction]: player.support[opponent.faction] + changeAmount,
      [player.faction]: player.support[player.faction] - changeAmount
    };
    studentManager.updateSupport(player.id, updates);
  }
};

export const PersuasionModal: React.FC<PersuasionModalProps> = ({
  student,
  isOpen,
  onClose
}) => {
  const [gameState, setGameState] = useState<GameState>({
    atmosphere: 'normal',
    situation: 0,
    turn: 1,
    isPlayerTurn: true
  });

  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<keyof Interests | null>(null);
  const [selectedElectionAction, setSelectedElectionAction] = useState<ElectionAction | null>(null);
  const [aiAction, setAiAction] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');
  const [shouldExecuteAction, setShouldExecuteAction] = useState(false);

  useEffect(() => {
    if (shouldExecuteAction && (selectedTopic || selectedElectionAction)) {
      console.log('useEffect内でアクション実行:', {
        selectedAction,
        selectedTopic,
        selectedElectionAction
      });
      
      const executeAction = async () => {
        await performAction();
        setShouldExecuteAction(false);
      };
      
      executeAction();
    }
  }, [shouldExecuteAction]);

  if (!isOpen) return null;

  const player = studentManager.getPlayer();
  if (!player) return null;

  const performAction = async () => {
    if (!selectedAction) return;

    try {
      console.log('プレイヤーのアクション開始:', {
        selectedAction,
        selectedTopic,
        selectedElectionAction,
        currentState: gameState
      });

      let situationChange = 0;
      let newAtmosphere = gameState.atmosphere;
      let message = '';

      // プレイヤーのアクション実行
      if (selectedAction === 'topic' && selectedTopic) {
        const playerInterest = player.interests[selectedTopic];
        const targetInterest = student.interests[selectedTopic];

        if (targetInterest === 2) {
          situationChange = 20;
          newAtmosphere = relaxAtmosphere(newAtmosphere);
          message = `${student.lastName}は${INTEREST_NAMES[selectedTopic]}に興味を示しています！`;
        } else if (targetInterest === 0) {
          situationChange = -20;
          newAtmosphere = tenseAtmosphere(newAtmosphere);
          message = `${student.lastName}は${INTEREST_NAMES[selectedTopic]}に興味がないようです...`;
        } else {
          message = `${student.lastName}は${INTEREST_NAMES[selectedTopic]}に普通の反応を示しています`;
        }
      } else if (selectedAction === 'election' && selectedElectionAction) {
        if (selectedElectionAction === 'promote_own') {
          const success = Math.random() < calculatePromoteSuccess(player, student, gameState.atmosphere);
          if (success) {
            situationChange = 30;
            message = `${student.lastName}は${FACTION_NAMES[player.faction]}の主張に興味を示しています！`;
          } else {
            situationChange = -15;
            message = `${student.lastName}は${FACTION_NAMES[player.faction]}の主張に懐疑的な様子です...`;
          }
          newAtmosphere = 'normal';
        } else {
          const success = Math.random() < calculateCriticizeSuccess(player, student, gameState.atmosphere);
          if (success) {
            situationChange = 20;
            message = `${student.lastName}は${FACTION_NAMES[student.faction]}への批判に納得した様子です！`;
          } else {
            situationChange = -30;
            message = `${student.lastName}は怒っています...`;
          }
          newAtmosphere = tenseAtmosphere(newAtmosphere);
        }
      }

      // 選択をリセット
      setSelectedAction(null);
      setSelectedTopic(null);
      setSelectedElectionAction(null);

      // メッセージを表示
      setActionMessage(message);
      
      // 新しい状態を計算
      const newSituation = Math.max(-100, Math.min(100, gameState.situation + situationChange));
      const newTurn = gameState.turn + 0.5;

      // ゲーム終了判定
      if (newTurn > 5) {
        const playerWon = newSituation > 0;
        updateFactionSupport(player, student, playerWon, Math.abs(newSituation));
        onClose();
        return;
      }

      // メッセージを表示する時間を確保
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 状態更新前のログ
      console.log('プレイヤーのアクション結果:', {
        situationChange,
        newAtmosphere,
        message,
        newSituation,
        newTurn
      });

      // 次のターンに移行
      setActionMessage('');
      setGameState({
        atmosphere: newAtmosphere,
        situation: newSituation,
        turn: newTurn,
        isPlayerTurn: false
      });

      // AIのターン開始前のログ
      console.log('状態更新完了、AIのターン開始準備:', {
        atmosphere: newAtmosphere,
        situation: newSituation,
        turn: newTurn
      });

      // AIのターンを開始
      await performAIAction(newAtmosphere, newSituation, newTurn);
    } catch (error) {
      console.error('Player action error:', error);
      setActionMessage('エラーが発生しました。');
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
    }
  };

  const performAIAction = async (currentAtmosphere: Atmosphere, currentSituation: number, currentTurn: number) => {
    try {
      console.log('AIアクション開始:', {
        currentAtmosphere,
        currentSituation,
        currentTurn
      });

      const action: ActionType = Math.random() < 0.6 ? 'topic' : 'election';
      console.log('AI選択したアクション:', action);
      
      setAiAction(`${student.lastName}は考えています...`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAiAction(`${student.lastName}は${action === 'topic' ? '話題' : '選挙の話'}を選びました`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      let situationChange = 0;
      let newAtmosphere = currentAtmosphere;
      let message = '';

      if (action === 'topic') {
        const topics = Object.keys(student.interests) as (keyof Interests)[];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const playerInterest = player.interests[topic];

        if (playerInterest === 2) {
          situationChange = -20;
          newAtmosphere = relaxAtmosphere(newAtmosphere);
        } else if (playerInterest === 0) {
          situationChange = 20;
          newAtmosphere = tenseAtmosphere(newAtmosphere);
        }

        setAiAction(`${student.lastName}は${INTEREST_NAMES[topic]}について話しました`);
      } else {
        const electionAction: ElectionAction = Math.random() < 0.5 ? 'promote_own' : 'criticize_opponent';
        if (electionAction === 'promote_own') {
          const success = Math.random() < calculatePromoteSuccess(student, player, currentAtmosphere);
          if (success) {
            situationChange = -30;
            setAiAction(`${student.lastName}は${FACTION_NAMES[student.faction]}の良さを熱心に説明しました`);
          } else {
            situationChange = 15;
            setAiAction(`${student.lastName}の説明は説得力に欠けていました`);
          }
          newAtmosphere = 'normal';
        } else {
          const success = Math.random() < calculateCriticizeSuccess(student, player, currentAtmosphere);
          if (success) {
            situationChange = -20;
            setAiAction(`${student.lastName}は${FACTION_NAMES[player.faction]}の問題点を指摘しました`);
          } else {
            situationChange = 30;
            setAiAction(`${student.lastName}の批判は的外れでした`);
          }
          newAtmosphere = tenseAtmosphere(newAtmosphere);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const newSituation = Math.max(-100, Math.min(100, currentSituation + situationChange));
      const newTurn = currentTurn + 0.5;

      if (newTurn > 5) {
        const playerWon = newSituation > 0;
        updateFactionSupport(player, student, playerWon, Math.abs(newSituation));
        setAiAction('');
        await new Promise(resolve => setTimeout(resolve, 1000));
        onClose();
        return;
      }

      setGameState({
        atmosphere: newAtmosphere,
        situation: newSituation,
        turn: newTurn,
        isPlayerTurn: true
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      setAiAction('');
    } catch (error) {
      console.error('AI action error:', error);
      setAiAction('エラーが発生しました。');
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
    }
  };

  return (
    <div className="persuasion-modal-overlay" onClick={onClose}>
      <div className="persuasion-modal-content" onClick={e => e.stopPropagation()}>
        <div className="persuasion-modal-header">
          <h2>{student.lastName} {student.firstName}を説得</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="game-status">
          <div className="status-item">
            <span>ターン</span>
            <span>{Math.ceil(gameState.turn)}/5</span>
          </div>
          <div className="status-item">
            <span>場の空気</span>
            <span>{ATMOSPHERE_NAMES[gameState.atmosphere]}</span>
          </div>
          <div className="status-item">
            <span>情勢</span>
            <div className="situation-bar">
              <div
                className="situation-fill"
                style={{
                  width: `${((gameState.situation + 100) / 2)}%`,
                  backgroundColor: gameState.situation > 0 ? '#4caf50' : '#f44336'
                }}
              />
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="action-message">
            <p>{actionMessage}</p>
          </div>
        )}

        {gameState.isPlayerTurn ? (
          <div className="action-selection">
            {!selectedAction ? (
              <div className="action-buttons">
                <button onClick={() => setSelectedAction('topic')}>話題を選ぶ</button>
                <button onClick={() => setSelectedAction('election')}>選挙の話をする</button>
              </div>
            ) : selectedAction === 'topic' ? (
              <div className="topic-selection">
                <h3>話題を選んでください</h3>
                <div className="topic-buttons">
                  {Object.entries(student.interests).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => {
                        console.log('話題選択ボタンクリック:', key);
                        setSelectedTopic(key as keyof Interests);
                        setShouldExecuteAction(true);
                      }}
                    >
                      {INTEREST_NAMES[key]}
                      {value === 2 && ' (好き)'}
                      {value === 0 && ' (嫌い)'}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="election-selection">
                <h3>アプローチを選んでください</h3>
                <div className="election-buttons">
                  <button
                    onClick={() => {
                      console.log('選挙アプローチ選択: promote_own');
                      setSelectedElectionAction('promote_own');
                      setShouldExecuteAction(true);
                    }}
                  >
                    {FACTION_NAMES[player.faction]}の良さを説明
                  </button>
                  <button
                    onClick={() => {
                      console.log('選挙アプローチ選択: criticize_opponent');
                      setSelectedElectionAction('criticize_opponent');
                      setShouldExecuteAction(true);
                    }}
                  >
                    {FACTION_NAMES[student.faction]}の問題点を指摘
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="opponent-turn">
            <p>{aiAction || `${student.lastName}の番です...`}</p>
            <div className="thinking-dots"></div>
          </div>
        )}
      </div>
    </div>
  );
};