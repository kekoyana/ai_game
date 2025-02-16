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
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {Object.values(environments).map((env) => (
        <button
          key={env.type}
          onClick={() => onSelect(env.type)}
          style={{
            padding: '8px',
            border: selectedEnvironment === env.type ? '2px solid #007bff' : '1px solid #dee2e6',
            borderRadius: '4px',
            backgroundColor: selectedEnvironment === env.type ? '#e7f5ff' : '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '80px',
            position: 'relative',
            transition: 'all 0.2s ease',
          }}
          title={env.description}
        >
          <div style={{ fontSize: '1.5em', marginBottom: '4px' }}>
            {getEnvironmentEmoji(env.type)}
          </div>
          <div style={{ fontSize: '0.8em', fontWeight: 500 }}>{env.name}</div>
        </button>
      ))}
    </div>
  );
};