import type { NationStatus as NationStatusType } from '../types/nation';
import { statusLabels } from '../types/nation';
import '../styles/NationStatus.css';

interface NationStatusProps {
  status: NationStatusType;
}

export function NationStatus({ status }: NationStatusProps) {
  return (
    <div className="nation-status">
      <div className="status-section">
        <h4>基本情報</h4>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">{statusLabels.civilPower}</span>
            <span className="value">{status.civilPower}</span>
          </div>
          <div className="status-item">
            <span className="label">{statusLabels.militaryPower}</span>
            <span className="value">{status.militaryPower}</span>
          </div>
          <div className="status-item">
            <span className="label">{statusLabels.civilLoyalty}</span>
            <span className="value">{status.civilLoyalty}</span>
          </div>
          <div className="status-item">
            <span className="label">{statusLabels.population}</span>
            <span className="value">{status.population.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="status-section">
        <h4>施設</h4>
        <div className="status-grid">
          {Object.entries(status.facilities).map(([key, value]) => (
            <div key={key} className="status-item">
              <span className="label">
                {statusLabels.facilities[key as keyof typeof status.facilities]}
              </span>
              <span className="value">Lv.{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="status-section">
        <h4>資源</h4>
        <div className="status-grid">
          {Object.entries(status.resources).map(([key, value]) => (
            <div key={key} className="status-item">
              <span className="label">
                {statusLabels.resources[key as keyof typeof status.resources]}
              </span>
              <span className="value">{value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="status-section">
        <h4>収入（1ターン）</h4>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">金</span>
            <span className="value income">+{status.income.gold}</span>
          </div>
          <div className="status-item">
            <span className="label">食料</span>
            <span className="value income">+{status.income.food}</span>
          </div>
        </div>
      </div>
    </div>
  );
}