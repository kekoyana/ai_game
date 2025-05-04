import { useState } from 'react'
import './App.css'
import { buildings } from './buildings'

function App() {
  // 建物カードから山札を生成（インディゴ初期配布分を除く）
  function createDeck() {
    const deck: string[] = [];
    buildings.forEach(card => {
      // インディゴ染料工場は初期配布分（4枚）を除いて山札に入れる
      const count = card.name === "インディゴ染料工場" ? (card.count ?? 0) - 4 : (card.count ?? 0);
      for (let i = 0; i < count; i++) deck.push(card.name);
    });
    return deck;
  }

  // シャッフル関数
  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 初期化
  const [deck, setDeck] = useState<string[]>(() => shuffle(createDeck()));
  const [players, setPlayers] = useState(() => {
    // 各プレイヤーにインディゴ1枚＋手札4枚配布
    const names = ["あなた", "CPU1", "CPU2", "CPU3"];
    let d = shuffle(createDeck());
    const ps = names.map(name => {
      const hand = d.slice(0, 4);
      d = d.slice(4);
      return {
        name,
        buildings: ["インディゴ染料工場"],
        hand,
      };
    });
    setDeck(d);
    return ps;
  });
  const [turn, setTurn] = useState(0); // 0:あなた, 1:CPU1...
  const [role, setRole] = useState<string | null>(null);
  const [message, setMessage] = useState("ゲーム開始！役割を選んでください。");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // 役割選択後にCPUが順に役割を選ぶ
  function handleRoleSelect(r: string) {
    setRole(r);
    setMessage(`あなたは「${r}」を選択しました。`);
    setSelectedRoles([r]);

    // CPUの役割選択を順に実行
    setTimeout(() => {
      const roles = [r];
      const cpuMsgs = [];
      const allRoles = ["建築士", "監督", "商人", "参事会議員", "金鉱掘り"];
      for (let i = 1; i < 4; i++) {
        // 未選択の役割からランダム選択
        const remain = allRoles.filter(x => !roles.includes(x));
        const cpuRole = remain[Math.floor(Math.random() * remain.length)];
        roles.push(cpuRole);
        cpuMsgs.push(`CPU${i}は「${cpuRole}」を選択しました。`);
      }
      setSelectedRoles(roles);
      setMessage(`あなたは「${r}」を選択しました。\n${cpuMsgs.join("\n")}`);

      // 1ラウンド終了後、次のターンへ
      setTimeout(() => {
        setRole(null);
        setSelectedRoles([]);
        setMessage("次のラウンドです。役割を選んでください。");
        setTurn(t => (t + 1) % 4);
      }, 1200);
    }, 800);
  }

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
        <div>ターン: {players[turn].name}</div>
        <div className="role-buttons">
          {["建築士", "監督", "商人", "参事会議員", "金鉱掘り"].map(r => (
            <button
              key={r}
              onClick={() => handleRoleSelect(r)}
              disabled={turn !== 0 || !!role || selectedRoles.includes(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* メッセージ欄 */}
      <div className="message-area">
        {message}
      </div>

      {/* プレイヤーの建物 */}
      <div className="player-buildings">
        <div>あなたの建物:</div>
        <div className="hand-cards">
          {players[0].buildings.map((b, idx) => {
            const info = buildings.find(card => card.name === b);
            return (
              <span className="card" key={idx}>
                {b}
                {info && (
                  <span style={{ fontSize: "0.8em", color: "#666", display: "block" }}>
                    コスト:{info.cost} 点:{info.basePoint}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* プレイヤーの手札 */}
      <div className="player-hand">
        <div>あなたの手札:</div>
        <div className="hand-cards">
          {players[0].hand.map((card, idx) => {
            const info = buildings.find(b => b.name === card);
            return (
              <span className="card" key={idx}>
                {card}
                {info && (
                  <span style={{ fontSize: "0.8em", color: "#666", display: "block" }}>
                    コスト:{info.cost} 点:{info.basePoint}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default App
