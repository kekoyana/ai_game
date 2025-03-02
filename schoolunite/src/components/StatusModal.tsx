import React from 'react';
import { Student, FACTION_NAMES } from '../types/student';
import './StatusModal.css';

interface StatusModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ student, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getHpColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio > 0.66) return '#4caf50';
    if (ratio > 0.33) return '#ffc107';
    return '#f44336';
  };

  const getFriendshipLevel = (friendship: number) => {
    if (friendship >= 80) return '親密';
    if (friendship >= 60) return '親友';
    if (friendship >= 40) return '友人';
    if (friendship >= 20) return '知人';
    return '他人';
  };

  const getAffinityText = (affinity: number) => {
    if (affinity > 30) return '非常に良い';
    if (affinity > 10) return '良い';
    if (affinity >= -10) return '普通';
    if (affinity >= -30) return '悪い';
    return '非常に悪い';
  };

  const getClubName = (clubId: number) => {
    switch (clubId) {
      case 0: return '無所属';
      case 1: return '野球部';
      case 2: return 'サッカー部';
      case 3: return '美術部';
      case 4: return '図書委員会';
      default: return `部活ID: ${clubId}`;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{student.lastName} {student.firstName}のステータス</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="status-content">
          <div className="status-section">
            <h3>基本情報</h3>
            <p>学年：{student.grade}年{student.class}組</p>
            <p>性別：{student.gender === 0 ? '男子' : '女子'}</p>
          </div>

          <div className="status-section">
            <h3>能力値</h3>
            <p>知力：{student.intelligence}</p>
            <p>体力：{student.strength}</p>
            <p>魅力：{student.charisma}</p>
            <p>評判：{student.reputation}</p>
          </div>

          <div className="status-section">
            <h3>HP</h3>
            <div className="hp-bar-container">
              <div 
                className="hp-bar" 
                style={{ 
                  width: `${(student.currentHp / student.maxHp) * 100}%`,
                  backgroundColor: getHpColor(student.currentHp, student.maxHp)
                }}
              />
              <span className="hp-text">
                {student.currentHp} / {student.maxHp}
              </span>
            </div>
          </div>

          <div className="status-section">
            <h3>関係性</h3>
            <p>親密度：{student.friendship} ({getFriendshipLevel(student.friendship)})</p>
            <p>相性：{getAffinityText(student.affinity)}</p>
          </div>

          <div className="status-section">
            <h3>所属</h3>
            <p>派閥：{FACTION_NAMES[student.faction]}</p>
            <p>部活動：{getClubName(student.clubId)}</p>
            <div className="faction-support">
              <p>支持率：</p>
              <ul>
                <li>穏健派：{student.support.status_quo}%</li>
                <li>体育派：{student.support.militar}%</li>
                <li>進学派：{student.support.academic}%</li>
              </ul>
            </div>
          </div>

          {student.isLeader && (
            <div className="status-section leader-section">
              <h3>特別ステータス</h3>
              <p className="leader-tag">リーダー</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};