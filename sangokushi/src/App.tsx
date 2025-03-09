import { useState } from 'react'
import './App.css'
import { Map } from './components/Map'
import { Province, provinces } from './types/province'

function App() {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);

  const handleProvinceClick = (province: Province) => {
    setSelectedProvince(province);
  };

  return (
    <div className="game-container">
      <div className="game-area">
        <Map onProvinceClick={handleProvinceClick} />
      </div>
      <div className="status-area">
        <h2>州の情報</h2>
        {selectedProvince && (
          <div className="province-info">
            <h3>{selectedProvince.name}</h3>
            <p>隣接する州:</p>
            <ul>
              {selectedProvince.adjacentProvinces.map(id => (
                <li key={id}>
                  {provinces.find((p: Province) => p.id === id)?.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="message-area">
        <h2>メッセージ</h2>
        {selectedProvince && (
          <p>{selectedProvince.name}が選択されました</p>
        )}
      </div>
    </div>
  )
}

export default App
