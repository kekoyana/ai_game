import { useState } from 'react'
import './App.css'
import { Map } from './components/Map'
import { Province, provinces } from './types/province'
import { getGeneralsByLordId } from './types/general'
import { LordSelection } from './components/LordSelection'
import { Lord } from './types/lord'

function App() {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [playerLord, setPlayerLord] = useState<Lord | null>(null);

  // ゲームが開始されていない場合（君主未選択）
  if (!playerLord) {
    return (
      <div className="game-container">
        <LordSelection onSelect={setPlayerLord} />
      </div>
    );
  }

  const handleProvinceClick = (province: Province) => {
    setSelectedProvince(province);
  };

  const renderGeneralStats = (stats: { war: number; int: number; lead: number; pol: number }) => {
    return (
      <div className="general-stats">
        <span className="stat">武力: {stats.war}</span>
        <span className="stat">知力: {stats.int}</span>
        <span className="stat">統率: {stats.lead}</span>
        <span className="stat">政治: {stats.pol}</span>
      </div>
    );
  };

  return (
    <div className="game-container">
      <div className="game-area">
        <Map onProvinceClick={handleProvinceClick} />
      </div>
      <div className="status-area">
        <div className="player-info">
          <h2>プレイヤー情報</h2>
          <div className="lord-info">
            <p>君主：{playerLord.name}</p>
            <p>軍事力：{playerLord.strength}</p>
          </div>
        </div>
        <h2>州の情報</h2>
        {selectedProvince && (
          <div className="province-info">
            <h3>{selectedProvince.name}</h3>
            <div className="lord-info">
              <p>君主：{selectedProvince.lord?.name || '空白国'}</p>
              {selectedProvince.lord && (
                <p>軍事力：{selectedProvince.lord.strength}</p>
              )}
            </div>
            {selectedProvince.lord && (
              <div className="generals-info">
                <h4>配下の武将</h4>
                <div className="generals-list">
                  {getGeneralsByLordId(selectedProvince.lord.id).map(general => (
                    <div key={general.id} className="general-item">
                      <div className="general-header">
                        <span className="general-name">{general.name}</span>
                        <span className="general-loyalty">忠誠: {general.loyalty}</span>
                      </div>
                      {renderGeneralStats(general.stats)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="adjacent-info">
              <p>隣接する州:</p>
              <ul>
                {selectedProvince.adjacentProvinces.map(id => {
                  const province = provinces.find(p => p.id === id);
                  return (
                    <li key={id}>
                      {province?.name} ({province?.lord?.name || '空白国'})
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="message-area">
        <h2>メッセージ</h2>
        <p>現在のターン: {playerLord.name}の作戦フェーズ</p>
        {selectedProvince && (
          <p>{selectedProvince.name}が選択されました</p>
        )}
      </div>
    </div>
  )
}

export default App
