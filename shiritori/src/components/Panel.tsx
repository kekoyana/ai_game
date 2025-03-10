import React from 'react';
import './Panel.css';

interface PanelProps {
  id: number;
  words: string[];
  imageUrl: string;
  isSelected: boolean;
  onSelect: (id: number, word: string) => void;
  disabled: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  id,
  words,
  imageUrl,
  isSelected,
  onSelect,
  disabled
}) => {
  const handleClick = () => {
    if (!isSelected && !disabled) {
      onSelect(id, words[0]);
    }
  };

  return (
    <div 
      className={`panel ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
    >
      <div className="panel-image">
        <span className="emoji">{imageUrl}</span>
      </div>
    </div>
  );
};