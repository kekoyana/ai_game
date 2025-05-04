import { useState } from 'react'
import './App.css'

function App() {
  // 仮のプレイヤー・CPUデータ
  const players = [
    { name: "あなた", buildings: ["インディゴ染料工場"], hand: ["サトウ精製所", "鍛冶屋", "金鉱", "井戸"] },
    { name: "CPU1", buildings: ["インディゴ染料工場"], hand: ["タバコ保存所", "闇市"] },
    { name: "CPU2", buildings: ["インディゴ染料工場"], hand: ["コーヒー焙煎場", "クレーン"] },
    { name: "CPU3", buildings: ["インディゴ染料工場"], hand: ["シルバー精錬所", "資料館"] },
  ];
  const [message] = useState("ゲーム開始！役割を選んでください。");
  const [role, setRole] = useState<string | null>(null);

  return (
    <div className="game-container">
      {/* CPUプレイヤー表示 */}
      <div className="cpu-area">
        {players.slice(1).map((cpu) => (
          <div className="cpu" key={cpu.name}>
            <div>{cpu.name}</div>
            <div>建物: {cpu.buildings.join(", ")}</div>
            <div>手札: {cpu.hand.length}枚</div>
          </div>
        ))}
      </div>

      {/* 中央エリア */}
      <div className="center-area">
        <div>現在の役割: {role ?? "未選択"}</div>
        <div className="role-buttons">
          {["建築士", "監督", "商人", "参事会議員", "金鉱掘り"].map(r => (
            <button key={r} onClick={() => setRole(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* メッセージ欄 */}
      <div className="message-area">
        {message}
      </div>

      {/* プレイヤーの建物 */}
      <div className="player-buildings">
        <div>あなたの建物: {players[0].buildings.join(", ")}</div>
      </div>

      {/* プレイヤーの手札 */}
      <div className="player-hand">
        <div>あなたの手札:</div>
        <div className="hand-cards">
          {players[0].hand.map((card, idx) => (
            <span className="card" key={idx}>{card}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
