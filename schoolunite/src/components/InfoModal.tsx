import React, { useState } from 'react';
import { classManager } from '../managers/classManager';
import { studentManager } from '../data/studentData';
import { FACTION_NAMES } from '../types/student';
import { CLUB_DATA, ClubId } from '../types/club';
import './InfoModal.css';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [currentTab, setCurrentTab] = useState<'basic' | 'classes' | 'clubs'>('basic');

  if (!isOpen) return null;

  const renderClassList = () => {
    const classes = classManager.getAllClasses();
    return (
      <div className="class-list">
        <h3>クラス一覧</h3>
        {classes.map(classData => {
          const representative = classManager.getRepresentative(classData);
          const viceReps = classManager.getViceRepresentatives(classData);
          
          return (
            <div key={`${classData.grade}${classData.name}`} className="class-item">
              <div className="class-header">
                <h4>{classData.grade}年{classData.name}組</h4>
                <span className="faction-tag" data-faction={classData.faction}>
                  {FACTION_NAMES[classData.faction]}
                </span>
              </div>
              <div className="class-representatives">
                <div className="representative">
                  <span className="role">代表：</span>
                  <span className="name">
                    {representative 
                      ? `${representative.lastName} ${representative.firstName}`
                      : '未定'}
                  </span>
                </div>
                {viceReps.length > 0 && (
                  <div className="vice-representatives">
                    <span className="role">副代表：</span>
                    <span className="name">
                      {viceReps.map(vr => 
                        `${vr.lastName} ${vr.firstName}`
                      ).join('、')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderClubList = () => {
    const clubs = Object.values(CLUB_DATA).filter(club => club.id !== ClubId.NONE);
    return (
      <div className="club-list">
        <h3>部活動一覧</h3>
        {clubs.map(club => {
          const members = studentManager.getAllStudents().filter(s => s.clubId === club.id);
          const captain = members.find(m => m.id === club.captainId);
          
          return (
            <div key={club.id} className="club-item">
              <div className="club-header">
                <h4>{club.name}</h4>
                <span className="faction-tag" data-faction={club.faction}>
                  {FACTION_NAMES[club.faction]}
                </span>
              </div>
              <div className="club-details">
                <div className="club-type">
                  {club.type === 'sports' && '運動部'}
                  {club.type === 'culture' && '文化部'}
                  {club.type === 'committee' && '委員会'}
                </div>
                <div className="club-members">
                  <span className="count">部員数: {members.length}</span>
                  {captain && (
                    <div className="leader">
                      <span className="role">部長：</span>
                      <span className="name">{captain.lastName} {captain.firstName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-content" onClick={e => e.stopPropagation()}>
        <div className="info-modal-header">
          <h2>学校情報</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="info-modal-nav">
          <button
            className={currentTab === 'basic' ? 'active' : ''}
            onClick={() => setCurrentTab('basic')}
          >
            基本情報
          </button>
          <button
            className={currentTab === 'classes' ? 'active' : ''}
            onClick={() => setCurrentTab('classes')}
          >
            クラス
          </button>
          <button
            className={currentTab === 'clubs' ? 'active' : ''}
            onClick={() => setCurrentTab('clubs')}
          >
            部活動
          </button>
        </div>

        <div className="info-modal-body">
          {currentTab === 'basic' && (
            <div className="basic-info">
              <h3>基本情報</h3>
              {/* TODO: 基本情報の表示 */}
            </div>
          )}
          {currentTab === 'classes' && renderClassList()}
          {currentTab === 'clubs' && renderClubList()}
        </div>
      </div>
    </div>
  );
};