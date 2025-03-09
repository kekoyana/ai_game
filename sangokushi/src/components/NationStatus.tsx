import type { NationStatus as NationStatusType } from '../types/nation';
import { statusLabels } from '../types/nation';
import '../styles/NationStatus.css';

interface NationStatusProps {
  status: NationStatusType;
}

export function NationStatus({ status }: NationStatusProps) {
  const renderStatItem = (key: keyof NationStatusType, value: number) => {
    // id と provinceId は表示しない
    if (key === 'id' || key === 'provinceId') return null;

    // パーセント表示が必要なステータス
    const isPercentage = ['loyalty', 'commerce', 'agriculture', 'arms', 'training'].includes(key);
    
    return (
      <div key={key} className="status-item">
        <span className="label">{statusLabels[key]}</span>
        <span className="value">
          {isPercentage ? `${value}%` : value.toLocaleString()}
        </span>
      </div>
    );
  };

  return (
    <div className="nation-status">
      <div className="status-section">
        <h4>基本情報</h4>
        <div className="status-grid">
          {renderStatItem('population', status.population)}
          {renderStatItem('loyalty', status.loyalty)}
          {renderStatItem('commerce', status.commerce)}
          {renderStatItem('agriculture', status.agriculture)}
        </div>
      </div>

      <div className="status-section">
        <h4>軍事</h4>
        <div className="status-grid">
          {renderStatItem('military', status.military)}
          {renderStatItem('arms', status.arms)}
          {renderStatItem('training', status.training)}
        </div>
      </div>

      <div className="status-section">
        <h4>資源</h4>
        <div className="status-grid">
          {renderStatItem('gold', status.gold)}
          {renderStatItem('food', status.food)}
        </div>
      </div>
    </div>
  );
}