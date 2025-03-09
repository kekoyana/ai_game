import './App.css'
import { Map } from './components/Map'
import { Province } from './types/province'

function App() {
  const handleProvinceClick = (province: Province) => {
    console.log(`Clicked province: ${province.name}`);
    // 今後、クリック時の処理を実装
  };

  return (
    <div className="game-container">
      <div className="game-area">
        <Map onProvinceClick={handleProvinceClick} />
      </div>
      <div className="status-area">
        <h2>ステータス表示</h2>
      </div>
      <div className="message-area">
        <h2>メッセージ表示</h2>
      </div>
    </div>
  )
}

export default App
