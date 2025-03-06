import React from 'react';
import { Student, FACTION_NAMES } from '../types/student';
import { classManager } from '../managers/classManager';
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

  const renderSupportRates = () => {
    const rates = [
      { name: '穏健派', value: student.support.status_quo, color: '#2196f3' },
      { name: '体育派', value: student.support.militar, color: '#f44336' },
      { name: '進学派', value: student.support.academic, color: '#4caf50' },
    ];

    return (
      <div className="faction-support">
        <p>支持率：</p>
        <ul>
          {rates.map((rate, index) => (
            <li 
              key={index}
              style={{
                '--support-width': `${rate.value}%`,
                '--support-color': rate.color,
              } as React.CSSProperties}
            >
              <span>{rate.name}</span>
              <span>{rate.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    );
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
            <p>学年・クラス<span>{student.grade}年{student.class}組</span></p>
            <p>性別<span>{student.gender === 0 ? '男子' : '女子'}</span></p>
          </div>

          <div className="status-section">
            <h3>能力値</h3>
            <p>知力<span>{student.intelligence}</span></p>
            <p>体力<span>{student.strength}</span></p>
            <p>魅力<span>{student.charisma}</span></p>
            <p>評判<span>{student.reputation}</span></p>
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
            <p>親密度<span>{student.friendship} ({getFriendshipLevel(student.friendship)})</span></p>
          </div>

          <div className="status-section">
            <h3>所属</h3>
            <p>派閥<span>{FACTION_NAMES[student.faction]}</span></p>
            <p>部活動<span>{getClubName(student.clubId)}</span></p>
            {renderSupportRates()}
          </div>

          {(student.isLeader || classManager.getStudentRole(student).role) && (
            <div className="status-section leader-section">
              <h3>特別ステータス</h3>
              <div className="leader-tags">
                {student.isLeader && <p className="leader-tag">リーダー</p>}
                {(() => {
                  const { role, classData } = classManager.getStudentRole(student);
                  if (role === 'representative') {
                    return <p className="leader-tag">{student.grade}年{student.class}組 クラス代表</p>;
                  }
                  if (role === 'viceRepresentative') {
                    return <p className="leader-tag">{student.grade}年{student.class}組 副代表</p>;
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};