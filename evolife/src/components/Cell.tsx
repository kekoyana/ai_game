import React from 'react';
import { Cell as CellType, EvolutionStage } from '../types/game';

interface CellProps {
  cell: CellType;
  onClick: () => void;
}

const getEnvironmentClassName = (cell: CellType): string => {
  if (!cell.environment) return 'env-default';
  return `env-${cell.environment.type}`;
};

const getOrganismEmoji = (cell: CellType): string => {
  if (!cell.organism) return '';

  const stage: EvolutionStage = cell.organism.stage;
  switch (stage) {
    case 'primitive':
      return '🦠';
    case 'bacteria':
      return '🧫';
    case 'jellyfish':
      return '🎐';
    case 'shellfish':
      return '🐚';
    case 'squid':
      return '🦑';
    case 'fish':
      return '🐟';
    case 'lungfish':
      return '🐠';
    case 'amphibian':
      return '🐸';
    case 'insect':
      return '🦗';
    case 'reptile':
      return '🦎';
    case 'dinosaur':
      return '🦖';
    case 'bird':
      return '🦅';
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

const getHealthClassName = (health: number): string => {
  if (health > 80) return 'health-high';
  if (health > 50) return 'health-medium';
  if (health > 30) return 'health-low';
  return 'health-critical';
};

const getAdaptationIndicator = (adaptationScore: number): string => {
  if (adaptationScore >= 90) return '⭐';
  if (adaptationScore >= 70) return '✨';
  if (adaptationScore >= 50) return '✧';
  return '❗';
};

export const Cell: React.FC<CellProps> = ({ cell, onClick }) => {
  const envClassName = getEnvironmentClassName(cell);
  const organismEmoji = getOrganismEmoji(cell);

  return (
    <div
      onClick={onClick}
      className={`cell ${envClassName}`}
    >
      <div className="cell-content">
        <span className="organism-emoji">{organismEmoji}</span>
      </div>
      {cell.organism && (
        <>
          <div className={`cell-health ${getHealthClassName(cell.organism.health)}`}>
            {Math.round(cell.organism.health)}
          </div>
          <div className="cell-adaptation">
            {getAdaptationIndicator(cell.organism.adaptationScore)}
          </div>
        </>
      )}
    </div>
  );
};