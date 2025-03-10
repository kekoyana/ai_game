import { CommandResult } from '../types/command';
import '../styles/MessageArea.css';

interface MessageAreaProps {
  playerName: string;
  selectedProvinceName?: string;
  result: CommandResult | null;
}

export function MessageArea({ playerName, selectedProvinceName, result }: MessageAreaProps) {
  return (
    <div className="message-area">
      <p>現在のターン: {playerName}の作戦フェーズ</p>
      {selectedProvinceName && (
        <p>{selectedProvinceName}が選択されました</p>
      )}
      {result && (
        <>
          <p>{result.message}</p>
          {result.effects && (
            <div className="command-effects">
              {Object.entries(result.effects).map(([key, value]) => {
                const labels: { [key: string]: string } = {
                  gold: '金',
                  food: '兵糧',
                  loyalty: '民忠',
                  commerce: '商業',
                  agriculture: '農業',
                  military: '兵力',
                  arms: '武器',
                  training: '訓練',
                  population: '人口'
                };
                return value !== undefined ? (
                  <span
                    key={key}
                    className={`effect-item ${value > 0 ? 'positive' : value < 0 ? 'negative' : ''}`}
                  >
                    {labels[key]}: {value > 0 ? '+' : ''}{value}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}