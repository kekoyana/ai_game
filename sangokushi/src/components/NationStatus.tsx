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
    
    return (
      <div key={key} className="status-item">
        <span className="label">{statusLabels[key]}</span>
        <span className="value">{value.toLocaleString()}</span>
      </div>
    );
  };

  return (
    <div className="nation-status">
      <div className="status-row">
        {renderStatItem('population', status.population)}
        {renderStatItem('military', status.military)}
      </div>
      <div className="status-row">
        {renderStatItem('loyalty', status.loyalty)}
        {renderStatItem('commerce', status.commerce)}
        {renderStatItem('agriculture', status.agriculture)}
      </div>
      <div className="status-row">
        {renderStatItem('arms', status.arms)}
        {renderStatItem('training', status.training)}
      </div>
      <div className="status-row">
        {renderStatItem('gold', status.gold)}
        {renderStatItem('food', status.food)}
      </div>
    </div>
  );
}