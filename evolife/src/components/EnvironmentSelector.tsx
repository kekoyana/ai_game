import React from 'react';
import { EnvironmentType } from '../types/game';
import { environments } from '../data/environments';

interface EnvironmentSelectorProps {
  selectedEnvironment: EnvironmentType | null;
  onSelect: (environment: EnvironmentType) => void;
}

const getEnvironmentEmoji = (type: EnvironmentType): string => {
  switch (type) {
    case 'deep_ocean':
      return '🌊';
    case 'shallow_water':
      return '💧';
    case 'wetland':
      return '🌿';
    case 'beach':
      return '🏖️';
    case 'jungle':
      return '🌳';
    case 'plains':
      return '🌾';
    case 'mountain':
      return '⛰️';
    case 'desert':
      return '🏜️';
    case 'cave':
      return '🕳️';
    case 'volcano':
      return '🌋';
    default:
      return '❓';
  }
};

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  selectedEnvironment,
  onSelect,
}) => {
  return (
    <div className="environment-selector">
      {Object.values(environments).map((env) => (
        <button
          key={env.type}
          onClick={() => onSelect(env.type)}
          className={`environment-button ${
            selectedEnvironment === env.type ? 'selected' : ''
          }`}
          title={`生物適応度: ${Object.entries(env.adaptability)
            .filter(([stage, value]) => value > 0)
            .map(([stage, value]) => `${stage}: ${value}%`)
            .join(', ')}`}
        >
          <span className="environment-emoji">
            {getEnvironmentEmoji(env.type)}
          </span>
          <div className="environment-info">
            <span className="environment-name">{env.name}</span>
            <span className="environment-description">
              {env.description}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};