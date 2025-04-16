import React from 'react';
import './GameMessage.css';

export interface GameMessageData {
  id: string;
  text: string;
  timestamp: number;
  type?: 'info' | 'action' | 'system' | 'cpu'; // メッセージの種類
}

interface GameMessageProps {
  messages: GameMessageData[];
}

const GameMessage: React.FC<GameMessageProps> = ({ messages }) => {
  return (
    <div className="game-messages">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.type || 'info'}`}>
          {message.text}
        </div>
      ))}
    </div>
  );
};

export default GameMessage;