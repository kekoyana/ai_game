import { General, isGeneralAvailable } from '../types/general';
import '../styles/GeneralSelector.css';

interface GeneralSelectorProps {
  generals: General[];
  currentYear: number;
  currentMonth: number;
  onSelect: (general: General) => void;
  onCancel: () => void;
}

export function GeneralSelector({ 
  generals,
  currentYear,
  currentMonth,
  onSelect,
  onCancel
}: GeneralSelectorProps) {
  return (
    <div className="general-selector-overlay">
      <div className="general-selector">
        <h3>担当武将を選択</h3>
        <div className="generals-grid">
          {generals.map(general => (
            <div
              key={general.id}
              className={`general-card ${!isGeneralAvailable(general, currentYear, currentMonth) ? 'disabled' : ''}`}
              onClick={() => isGeneralAvailable(general, currentYear, currentMonth) && onSelect(general)}
            >
              <div className="general-header">
                <span className="general-name">{general.name}</span>
                <span className="general-status">
                  {isGeneralAvailable(general, currentYear, currentMonth) ? '待機' : '行動済'}
                </span>
              </div>
              <div className="general-stats">
                <div className="stat">武力: {general.stats.war}</div>
                <div className="stat">知力: {general.stats.int}</div>
                <div className="stat">統率: {general.stats.lead}</div>
                <div className="stat">政治: {general.stats.pol}</div>
              </div>
              {!isGeneralAvailable(general, currentYear, currentMonth) && (
                <div className="action-date">
                  {general.lastActionDate?.year}年{general.lastActionDate?.month}月に行動済
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="cancel-button" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </div>
  );
}