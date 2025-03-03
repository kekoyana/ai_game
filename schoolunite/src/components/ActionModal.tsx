import React, { useState } from 'react';
import { Student } from '../types/student';
import { studentManager } from '../data/studentData';
import { timeManager } from '../managers/timeManager';
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
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChat = () => {
    const result = studentManager.increaseFriendship(student.id);
    setMessage(`${student.lastName}${student.firstName}との親密度が${result.amount}上がりました！（${result.newFriendship}）`);
    timeManager.advanceTime(15);
  };

  const handleShowDetails = () => {
    onShowDetails(student);
    onClose();
  };

  const handleClose = () => {
    setMessage(null);
    onClose();
  };

  return (
    <div className="action-modal-overlay" onClick={handleClose}>
      <div className="action-modal-content" onClick={e => e.stopPropagation()}>
        <div className="action-modal-header">
          <h2>{student.lastName} {student.firstName}との行動</h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        {message ? (
          <div className="action-result">
            <p>{message}</p>
            <button className="action-button" onClick={handleClose}>閉じる</button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};