import React from 'react';
import { Student } from '../types/student';
import { studentManager } from '../data/studentData';
import './ActionModal.css';

interface ActionModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onShowDetails: (student: Student) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  student,
  isOpen,
  onClose,
  onShowDetails
}) => {
  if (!isOpen) return null;

  const handleChat = () => {
    // 親密度を10上げる
    studentManager.increaseFriendship(student.id, 10);
    onClose();
  };

  const handleShowDetails = () => {
    onShowDetails(student);
    onClose();
  };

  return (
    <div className="action-modal-overlay" onClick={onClose}>
      <div className="action-modal-content" onClick={e => e.stopPropagation()}>
        <div className="action-modal-header">
          <h2>{student.lastName} {student.firstName}との行動</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="action-buttons">
          <button className="action-button chat" onClick={handleChat}>
            <span className="action-label">雑談をする</span>
            <span className="action-effect">親密度が上がります</span>
          </button>
          <button className="action-button details" onClick={handleShowDetails}>
            <span className="action-label">詳細を見る</span>
            <span className="action-effect">生徒の情報を確認</span>
          </button>
        </div>
      </div>
    </div>
  );
};