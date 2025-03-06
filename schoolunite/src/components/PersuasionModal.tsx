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
  onSetMessage: (message: string) => void;
}

export const PersuasionModal: React.FC<PersuasionModalProps> = ({
  student,
  isOpen,
  onClose,
  onSetMessage
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
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const player = studentManager.getPlayer();
  if (!player) return null;

  const handleGameEnd = (situation: number) => {
    const playerWon = situation > 0;
    const changeAmount = Math.floor(Math.abs(situation) / 10); // 支持率の変化量

    let resultMessage;
    if (playerWon) {
      resultMessage = `${student.lastName}${student.firstName}の説得に成功しました！\n` +
        `${FACTION_NAMES[player.faction]}の支持: +${changeAmount}%\n` +
        `${FACTION_NAMES[student.faction]}の支持: -${changeAmount}%`;
    } else {
      resultMessage = `${student.lastName}${student.firstName}の説得に失敗しました...\n` +
        `${FACTION_NAMES[student.faction]}の支持: +${changeAmount}%\n` +
        `${FACTION_NAMES[player.faction]}の支持: -${changeAmount}%`;
    }
    
    updateFactionSupport(player, student, playerWon, Math.abs(situation));
    onSetMessage(resultMessage);
    setActionMessage(resultMessage);
    setShowResult(true);
  };

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

  const calculatePromoteSuccess = (attacker: Student, defender: Student, atmosphere: Atmosphere): number => {
    let baseChance = 0.5;
    const intelligenceDiff = attacker.intelligence - defender.intelligence;
    baseChance += intelligenceDiff * 0.002;

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
    const strengthDiff = attacker.strength - defender.strength;
    baseChance += strengthDiff * 0.002;

    switch (atmosphere) {
      case 'relaxed': baseChance -= 0.2; break;
      case 'somewhat_relaxed': baseChance -= 0.1; break;
      case 'somewhat_tense': baseChance += 0.1; break;
      case 'tense': baseChance += 0.2; break;
    }

    return Math.max(0.1, Math.min(0.9, baseChance));
  };

  const updateFactionSupport = (player: Student, opponent: Student, playerWon: boolean, situationStrength: number) => {
    const changeAmount = Math.floor(situationStrength / 10);

    if (playerWon) {
      // プレイヤーの勝利時：対象の支持率を更新
      const currentTarget = studentManager.getStudent(student.id);
      if (currentTarget) {
        const targetSupport = { ...currentTarget.support };
        const playerFactionCurrent = targetSupport[player.faction];
        const studentFactionCurrent = targetSupport[student.faction];

        targetSupport[player.faction] = playerFactionCurrent + changeAmount;
        targetSupport[student.faction] = studentFactionCurrent - changeAmount;
        
        studentManager.updateSupport(student.id, targetSupport);
      }
    } else {
      // AIの勝利時：プレイヤーの支持率を更新
      const currentPlayer = studentManager.getPlayer();
      if (currentPlayer) {
        const playerSupport = { ...currentPlayer.support };
        const studentFactionCurrent = playerSupport[student.faction];
        const playerFactionCurrent = playerSupport[player.faction];

        playerSupport[student.faction] = studentFactionCurrent + changeAmount;
        playerSupport[player.faction] = playerFactionCurrent - changeAmount;
        
        studentManager.updateSupport(player.id, playerSupport);
      }
    }
  };

  const handleTopic = async (topic: keyof Interests) => {
    let situationChange = 0;
    let newAtmosphere = gameState.atmosphere;
    let message = '';

    const targetInterest = student.interests[topic];
    if (targetInterest === 2) {
      situationChange = 20;
      newAtmosphere = relaxAtmosphere(newAtmosphere);
      message = `${student.lastName}は${INTEREST_NAMES[topic]}に興味を示しています！`;
    } else if (targetInterest === 0) {
      situationChange = -20;
      newAtmosphere = tenseAtmosphere(newAtmosphere);
      message = `${student.lastName}は${INTEREST_NAMES[topic]}に興味がないようです...`;
    } else {
      message = `${student.lastName}は${INTEREST_NAMES[topic]}に普通の反応を示しています`;
    }

    setActionMessage(message);
    const newSituation = Math.max(-100, Math.min(100, gameState.situation + situationChange));
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setActionMessage('');

    setGameState({
      atmosphere: newAtmosphere,
      situation: newSituation,
      turn: gameState.turn,
      isPlayerTurn: false
    });

    await performAIAction(newAtmosphere, newSituation, gameState.turn);
  };

  const handleElection = async (action: ElectionAction) => {
    let situationChange = 0;
    let newAtmosphere = gameState.atmosphere;
    let message = '';

    if (action === 'promote_own') {
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

    setActionMessage(message);
    const newSituation = Math.max(-100, Math.min(100, gameState.situation + situationChange));
    
    // 情勢が最大値または最小値に達した場合はゲーム終了
    if (Math.abs(newSituation) >= 100) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      handleGameEnd(newSituation);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setActionMessage('');

    setGameState({
      atmosphere: newAtmosphere,
      situation: newSituation,
      turn: gameState.turn,
      isPlayerTurn: false
    });

    await performAIAction(newAtmosphere, newSituation, gameState.turn);
  };

  const performAIAction = async (currentAtmosphere: Atmosphere, currentSituation: number, currentTurn: number) => {
    const action: ActionType = Math.random() < 0.6 ? 'topic' : 'election';
    setAiAction(`${student.lastName}は考えています...`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    let situationChange = 0;
    let newAtmosphere = currentAtmosphere;
    let resultMessage = '';

    if (action === 'topic') {
      const topics = Object.keys(student.interests) as (keyof Interests)[];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const playerInterest = player.interests[topic];

      setAiAction(`${student.lastName}は${INTEREST_NAMES[topic]}について話しました`);

      if (playerInterest === 2) {
        situationChange = -20;
        newAtmosphere = relaxAtmosphere(newAtmosphere);
      } else if (playerInterest === 0) {
        situationChange = 20;
        newAtmosphere = tenseAtmosphere(newAtmosphere);
      }
    } else {
      const electionAction: ElectionAction = Math.random() < 0.5 ? 'promote_own' : 'criticize_opponent';
      if (electionAction === 'promote_own') {
        const success = Math.random() < calculatePromoteSuccess(student, player, currentAtmosphere);
        if (success) {
          situationChange = -30;
          resultMessage = `${student.lastName}は${FACTION_NAMES[student.faction]}の良さを熱心に説明しました`;
        } else {
          situationChange = 15;
          resultMessage = `${student.lastName}の説明は説得力に欠けていました`;
        }
        newAtmosphere = 'normal';
      } else {
        const success = Math.random() < calculateCriticizeSuccess(student, player, currentAtmosphere);
        if (success) {
          situationChange = -20;
          resultMessage = `${student.lastName}は${FACTION_NAMES[player.faction]}の問題点を指摘しました`;
        } else {
          situationChange = 30;
          resultMessage = `${student.lastName}の批判は的外れでした`;
        }
        newAtmosphere = tenseAtmosphere(newAtmosphere);
      }
      setAiAction(resultMessage);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const newSituation = Math.max(-100, Math.min(100, currentSituation + situationChange));

    // 情勢が最大値または最小値に達した場合、または次のターンが5を超える場合はゲーム終了
    if (Math.abs(newSituation) >= 100 || currentTurn + 1 > 5) {
      handleGameEnd(newSituation);
      return;
    }

    const nextTurn = currentTurn + 1; // AIのターン終了後に次のターンへ

    // プレイヤーターンの開始時に選択をリセット
    setSelectedAction(null);
    setSelectedTopic(null);
    setSelectedElectionAction(null);
    setGameState({
      atmosphere: newAtmosphere,
      situation: newSituation,
      turn: nextTurn,
      isPlayerTurn: true
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    setAiAction('');
  };

  const handleClose = () => {
    setShowResult(false);
    setActionMessage('');
    setSelectedAction(null);
    setSelectedTopic(null);
    setSelectedElectionAction(null);
    setGameState({
      atmosphere: 'normal',
      situation: 0,
      turn: 1,
      isPlayerTurn: true
    });
    onClose();
  };

  return (
    <div className="persuasion-modal-overlay" onClick={showResult ? undefined : handleClose}>
      <div className="persuasion-modal-content" onClick={e => e.stopPropagation()}>
        {showResult ? (
          <div className="game-result">
            <h2>{actionMessage}</h2>
            <button className="ok-button" onClick={handleClose}>OK</button>
          </div>
        ) : (
          <>
            <div className="persuasion-modal-header">
              <h2>{student.lastName} {student.firstName}を説得</h2>
              <button className="close-button" onClick={handleClose}>&times;</button>
            </div>

            <div className="game-status">
              <div className="status-item">
                <span>ターン</span>
                <span>{gameState.turn}/5</span>
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
                          onClick={() => handleTopic(key as keyof Interests)}
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
                      <button onClick={() => handleElection('promote_own')}>
                        {FACTION_NAMES[player.faction]}の良さを説明
                      </button>
                      <button onClick={() => handleElection('criticize_opponent')}>
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
          </>
        )}
      </div>
    </div>
  );
};