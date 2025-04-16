import React from 'react';
import { PlayerState } from '../../store/gameStore';

interface CpuInfoDialogProps {
  cpu: PlayerState;
  onClose: () => void;
}

const CpuInfoDialog: React.FC<CpuInfoDialogProps> = ({ cpu, onClose }) => {
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h2>CPU {cpu.id}の情報</h2>
        <div className="cpu-info-content">
          <div className="cpu-hand">
            <h3>手札</h3>
            <ul>
              {cpu.hand.map(card => (
                <li key={card.id}>{card.name}</li>
              ))}
            </ul>
          </div>
          <div className="cpu-buildings">
            <h3>建物</h3>
            <ul>
              {cpu.buildings.map(building => (
                <li key={building.id}>{building.name}</li>
              ))}
            </ul>
          </div>
        </div>
        <button onClick={onClose}>閉じる</button>
      </div>
    </div>
  );
};

export default CpuInfoDialog;