import { useState } from 'react';
import { Lord, lords } from '../types/lord';
import { getGeneralsByLordId } from '../types/general';
import '../styles/LordSelection.css';

interface LordSelectionProps {
  onSelect: (lord: Lord) => void;
}

export function LordSelection({ onSelect }: LordSelectionProps) {
  const [selectedLord, setSelectedLord] = useState<Lord | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLordClick = (lord: Lord) => {
    setSelectedLord(lord);
    setShowConfirm(false);
  };

  const handleConfirm = () => {
    if (selectedLord) {
      setShowConfirm(true);
    }
  };

  const handleStart = () => {
    if (selectedLord) {
      onSelect(selectedLord);
    }
  };

  return (
    <div className="lord-selection">
      <h1>君主を選択してください</h1>
      <div className="lords-grid">
        {Object.values(lords).map(lord => (
          <div
            key={lord.id}
            className={`lord-card ${selectedLord?.id === lord.id ? 'selected' : ''}`}
            onClick={() => handleLordClick(lord)}
          >
            <h3>{lord.name}</h3>
            <div className="lord-strength">軍事力: {lord.strength}</div>
            <div className="generals-preview">
              <h4>配下の武将</h4>
              <ul>
                {getGeneralsByLordId(lord.id).map(general => (
                  <li key={general.id}>
                    {general.name} (武:{general.stats.war})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {selectedLord && !showConfirm && (
        <div className="lord-detail">
          <h2>{selectedLord.name}を選択中</h2>
          <button className="confirm-button" onClick={handleConfirm}>
            この君主で始める
          </button>
        </div>
      )}

      {showConfirm && selectedLord && (
        <div className="confirmation">
          <h2>{selectedLord.name}でゲームを開始しますか？</h2>
          <div className="button-group">
            <button className="start-button" onClick={handleStart}>
              開始
            </button>
            <button className="back-button" onClick={() => setShowConfirm(false)}>
              選択に戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}