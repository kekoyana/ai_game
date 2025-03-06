import React, { useState } from 'react';
import { classManager } from '../managers/classManager';
import { studentManager } from '../data/studentData';
import './InfoModal.css';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [showingOrganization, setShowingOrganization] = useState(false);

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
                <span className="class-faction">{classData.faction}</span>
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

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-content" onClick={e => e.stopPropagation()}>
        <div className="info-modal-header">
          <h2>学校情報</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="info-modal-nav">
          <button
            className={!showingOrganization ? 'active' : ''}
            onClick={() => setShowingOrganization(false)}
          >
            基本情報
          </button>
          <button
            className={showingOrganization ? 'active' : ''}
            onClick={() => setShowingOrganization(true)}
          >
            組織
          </button>
        </div>

        <div className="info-modal-body">
          {showingOrganization ? (
            renderClassList()
          ) : (
            <div className="basic-info">
              <h3>基本情報</h3>
              {/* TODO: 基本情報の表示 */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};