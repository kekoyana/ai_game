import React, { useState } from 'react';
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

  if (!isOpen) return null;

  const player = studentManager.getPlayer();
  if (!player) return null;

  const performAction = () => {
    if (!selectedAction) return;

    let situationChange = 0;
    let newAtmosphere = gameState.atmosphere;

    if (selectedAction === 'topic' && selectedTopic) {
      // 話題による説得
      const playerInterest = player.interests[selectedTopic];
      const targetInterest = student.interests[selectedTopic];

      if (targetInterest === 2) { // 相手の好み
        situationChange = 20;
        newAtmosphere = relaxAtmosphere(newAtmosphere);
      } else if (targetInterest === 0) { // 相手の嫌い
        situationChange = -20;
        newAtmosphere = tenseAtmosphere(newAtmosphere);
      }
    } else if (selectedAction === 'election' && selectedElectionAction) {
      // 選挙の話による説得
      if (selectedElectionAction === 'promote_own') {
        const success = Math.random() < calculatePromoteSuccess(player, student, gameState.atmosphere);
        if (success) {
          situationChange = 30;
        } else {
          situationChange = -15;
        }
        newAtmosphere = 'normal';
      } else {
        const success = Math.random() < calculateCriticizeSuccess(player, student, gameState.atmosphere);
        if (success) {
          situationChange = 20;
          newAtmosphere = tenseAtmosphere(newAtmosphere);
        } else {
          situationChange = -30;
          newAtmosphere = tenseAtmosphere(newAtmosphere);
        }
      }
    }

    // AIのターンの場合、実行を遅延させる
    if (!gameState.isPlayerTurn) {
      performAIAction();
      return;
    }

    // プレイヤーのターンの場合は選択をリセット
    setSelectedAction(null);
    setSelectedTopic(null);
    setSelectedElectionAction(null);

    // ターン終了処理
    const newSituation = Math.max(-100, Math.min(100, gameState.situation + situationChange));
    const newTurn = gameState.turn + 0.5;

    if (newTurn > 5) {
      // ゲーム終了
      const playerWon = newSituation > 0;
      updateFactionSupport(player, student, playerWon, Math.abs(newSituation));
      onClose();
      return;
    }

    setGameState({
      atmosphere: newAtmosphere,
      situation: newSituation,
      turn: newTurn,
      isPlayerTurn: !gameState.isPlayerTurn
    });
  };

  const performAIAction = async () => {
    // まずAIの選択を表示
    const action: ActionType = Math.random() < 0.6 ? 'topic' : 'election';
    setAiAction(`${student.lastName}は考えています...`);

    // 選択の表示を遅延
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAiAction(`${student.lastName}は${action === 'topic' ? '話題' : '選挙の話'}を選びました`);

    // 実際のアクション実行を遅延
    await new Promise(resolve => setTimeout(resolve, 1500));

    let situationChange = 0;
    let newAtmosphere = gameState.atmosphere;

    if (action === 'topic') {
      // ランダムな話題を選択
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
      // 選挙の話
      const electionAction: ElectionAction = Math.random() < 0.5 ? 'promote_own' : 'criticize_opponent';
      if (electionAction === 'promote_own') {
        const success = Math.random() < calculatePromoteSuccess(student, player, gameState.atmosphere);
        if (success) {
          situationChange = -30;
          setAiAction(`${student.lastName}は${FACTION_NAMES[student.faction]}の良さを熱心に説明しました`);
        } else {
          situationChange = 15;
          setAiAction(`${student.lastName}の説明は説得力に欠けていました`);
        }
        newAtmosphere = 'normal';
      } else {
        const success = Math.random() < calculateCriticizeSuccess(student, player, gameState.atmosphere);
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

    // 1秒後にターン終了処理
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newSituation = Math.max(-100, Math.min(100, gameState.situation + situationChange));
    const newTurn = gameState.turn + 0.5;

    if (newTurn > 5) {
      // ゲーム終了
      const playerWon = newSituation > 0;
      updateFactionSupport(player, student, playerWon, Math.abs(newSituation));
      onClose();
      return;
    }

    setGameState({
      atmosphere: newAtmosphere,
      situation: newSituation,
      turn: newTurn,
      isPlayerTurn: true
    });

    // AIのメッセージをクリア
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAiAction('');
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
                        setSelectedTopic(key as keyof Interests);
                        performAction();
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
                      setSelectedElectionAction('promote_own');
                      performAction();
                    }}
                  >
                    {FACTION_NAMES[player.faction]}の良さを説明
                  </button>
                  <button
                    onClick={() => {
                      setSelectedElectionAction('criticize_opponent');
                      performAction();
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