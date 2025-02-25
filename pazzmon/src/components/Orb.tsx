import React from 'react';
import { OrbType } from '../types';
import '../styles/Orb.css';

interface OrbProps {
  type: OrbType;
  isMoving?: boolean;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: () => void;
}

const orbColors: Record<OrbType, string> = {
  fire: '#FF4444',
  water: '#4444FF',
  wood: '#44FF44',
  light: '#FFFF44',
  dark: '#AA44FF',
  heal: '#FF99AA',
};

export const Orb: React.FC<OrbProps> = ({
  type,
  isMoving = false,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  return (
    <div
      className={`orb ${isMoving ? 'moving' : ''}`}
      style={{ backgroundColor: orbColors[type] }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="orb-inner" />
    </div>
  );
};