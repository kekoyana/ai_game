import React from 'react';
import { Cell as CellType, EvolutionStage } from '../types/game';

interface CellProps {
  cell: CellType;
  onClick: () => void;
}

const getEnvironmentColor = (cell: CellType): string => {
  if (!cell.environment) return '#ffffff';
  
  switch (cell.environment.type) {
    case 'deep_ocean':
      return '#1a5d97';
    case 'shallow_water':
      return '#4a90e2';
    case 'wetland':
      return '#7cb342';
    case 'beach':
      return '#ffd54f';
    case 'jungle':
      return '#2e7d32';
    case 'plains':
      return '#c0ca33';
    case 'mountain':
      return '#78909c';
    case 'desert':
      return '#ffa726';
    case 'cave':
      return '#5d4037';
    case 'volcano':
      return '#d32f2f';
    default:
      return '#ffffff';
  }
};

const getOrganismEmoji = (cell: CellType): string => {
  if (!cell.organism) return '';

  const stage: EvolutionStage = cell.organism.stage;
  switch (stage) {
    case 'primitive':
      return '🦠';
    case 'jellyfish':
      return '🎐';
    case 'shellfish':
      return '🐚';
    case 'fish':
      return '🐟';
    case 'lungfish':
      return '🐠';
    case 'amphibian':
      return '🐸';
    case 'reptile':
      return '🦎';
    case 'dinosaur':
      return '🦖';
    case 'mammal':
      return '🦁';
    case 'primate':
      return '🦧';
    case 'human':
      return '👤';
    default:
      return '';
  }
};

const getHealthColor = (health: number): string => {
  if (health > 80) return '#4caf50';
  if (health > 50) return '#ffd700';
  if (health > 30) return '#ff9800';
  return '#f44336';
};

export const Cell: React.FC<CellProps> = ({ cell, onClick }) => {
  const backgroundColor = getEnvironmentColor(cell);
  const organismEmoji = getOrganismEmoji(cell);

  return (
    <div
      onClick={onClick}
      style={{
        width: '60px',
        height: '60px',
        border: '1px solid #ccc',
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2em',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="cell-content">
        <span className="organism-emoji">{organismEmoji}</span>
      </div>
      {cell.organism && (
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            fontSize: '0.4em',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '2px',
            borderRadius: '2px',
            color: getHealthColor(cell.organism.health),
            fontWeight: 'bold',
          }}
        >
          {Math.round(cell.organism.health)}
        </div>
      )}
    </div>
  );
};