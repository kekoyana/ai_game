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
  const [councilChoices, setCouncilChoices] = useState<string[] | null>(null);
  const [buildChoices, setBuildChoices] = useState<string[] | null>(null);
  // const [buildCost, setBuildCost] = useState<number>(0);

  // 参事会議員アクション
  function handleCouncil() {
    // 山札から2枚引く
    if (deck.length < 2) return; // 山札不足時は未対応
    const choices = deck.slice(0, 2);
    setCouncilChoices(choices);
    setMessage("1枚選んで手札に加えてください。");
  }

  // 参事会議員でカードを選択
  function selectCouncilCard(card: string) {
    setPlayers(ps => {
      const newPlayers = [...ps];
      newPlayers[0] = {
        ...newPlayers[0],
        hand: [...newPlayers[0].hand, card],
      };
      return newPlayers;
    });
    setDeck(d => d.filter((c, i) => i >= 2)); // 2枚分山札から除去
    setCouncilChoices(null);
    setMessage(`「${card}」を手札に加えました。`);

    // CPUの役割選択を順に実行
    setTimeout(() => {
      const roles = ["参事会議員"];
      const cpuMsgs = [];
      const allRoles = ["建築士", "監督", "商人", "参事会議員", "金鉱掘り"];
      for (let i = 1; i < 4; i++) {
        const remain = allRoles.filter(x => !roles.includes(x));
        const cpuRole = remain[Math.floor(Math.random() * remain.length)];
        roles.push(cpuRole);
        cpuMsgs.push(`CPU${i}は「${cpuRole}」を選択しました。`);
      }
      setSelectedRoles(roles);
      setMessage(`「${card}」を手札に加えました。\n${cpuMsgs.join("\n")}`);

      // 1ラウンド終了後、次のターンへ
      setTimeout(() => {
        setRole(null);
        setSelectedRoles([]);
        setMessage("次のラウンドです。役割を選んでください。");
        setTurn(t => (t + 1) % 4);
      }, 1200);
    }, 800);
  }

  // 役割選択後にCPUが順に役割を選ぶ
  function handleRoleSelect(r: string) {
    setRole(r);
    setMessage(`あなたは「${r}」を選択しました。`);
    setSelectedRoles([r]);

    // 建築士なら手札から建設カード選択UIへ
    if (r === "建築士") {
      setTimeout(() => {
        // 既に建てている建物（都市施設）は重複不可
        const built = players[0].buildings;
        const hand = players[0].hand;
        const buildable = hand.filter(cardName => {
          const info = buildings.find(b => b.name === cardName);
          if (!info) return false;
          if (info.type === "都市施設" && built.includes(cardName)) return false;
          return true;
        });
        setBuildChoices(buildable);
        setMessage("建設するカードを選んでください。");
      }, 500);
      return;
    }

    // 参事会議員ならカード選択UIへ
    if (r === "参事会議員") {
      setTimeout(() => {
        handleCouncil();
      }, 500);
      // CPU処理はカード選択後に進める
      return;
    }

    // 金鉱掘りなら山札から1枚引いて手札に加える
    if (r === "金鉱掘り") {
      setTimeout(() => {
        if (deck.length > 0) {
          setPlayers(ps => {
            const newPlayers = [...ps];
            newPlayers[0] = {
              ...newPlayers[0],
              hand: [...newPlayers[0].hand, deck[0]],
            };
            return newPlayers;
          });
          setDeck(d => d.slice(1));
          setMessage(`あなたは「金鉱掘り」でカードを1枚引きました。`);
        } else {
          setMessage(`山札がありません。`);
        }
        // CPUの役割選択を順に実行
        setTimeout(() => {
          const roles = [r];
          const cpuMsgs = [];
          const allRoles = ["建築士", "監督", "商人", "参事会議員", "金鉱掘り"];
          for (let i = 1; i < 4; i++) {
            const remain = allRoles.filter(x => !roles.includes(x));
            const cpuRole = remain[Math.floor(Math.random() * remain.length)];
            roles.push(cpuRole);
            cpuMsgs.push(`CPU${i}は「${cpuRole}」を選択しました。`);
          }
          setSelectedRoles(roles);
          setMessage(`あなたは「金鉱掘り」でカードを1枚引きました。\n${cpuMsgs.join("\n")}`);
          setTimeout(() => {
            setRole(null);
            setSelectedRoles([]);
            setMessage("次のラウンドです。役割を選んでください。");
            setTurn(t => (t + 1) % 4);
          }, 1200);
        }, 800);
      }, 500);
      return;
    }

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
        {/* 参事会議員のカード選択UI */}
        {councilChoices && (
          <div style={{ marginTop: "1em" }}>
            <div>カードを1枚選んでください:</div>
            <div className="hand-cards">
              {councilChoices.map((card, idx) => {
                const info = buildings.find(b => b.name === card);
                return (
                  <button className="card" key={idx} onClick={() => selectCouncilCard(card)}>
                    {card}
                    {info && (
                      <span style={{ fontSize: "0.8em", color: "#666", display: "block" }}>
                        コスト:{info.cost} 点:{info.basePoint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {/* 建築士のカード選択UI */}
        {buildChoices && (
          <div style={{ marginTop: "1em" }}>
            <div>建設するカードを1枚選んでください:</div>
            <div className="hand-cards">
              {buildChoices.map((card, idx) => {
                const info = buildings.find(b => b.name === card);
                return (
                  <button
                    className="card"
                    key={idx}
                    onClick={() => {
                      if (!info) return;
                      setBuildChoices(null);
                      // コスト分捨て札選択UI（簡易化のため自動で手札先頭から捨てる）
                      setPlayers(ps => {
                        const newPlayers = [...ps];
                        const hand = newPlayers[0].hand.filter(c => c !== card);
                        // const discard = hand.slice(0, info.cost - 1); // 建築士特権で-1
                        const remain = hand.slice(info.cost - 1);
                        newPlayers[0] = {
                          ...newPlayers[0],
                          hand: remain,
                          buildings: [...newPlayers[0].buildings, card],
                        };
                        return newPlayers;
                      });
                      setMessage(`「${card}」を建設しました。`);
                      // CPUの役割選択・ターン進行
                      setTimeout(() => {
                        const roles = ["建築士"];
                        const cpuMsgs = [];
                        const allRoles = ["建築士", "監督", "商人", "参事会議員", "金鉱掘り"];
                        for (let i = 1; i < 4; i++) {
                          const remain = allRoles.filter(x => !roles.includes(x));
                          const cpuRole = remain[Math.floor(Math.random() * remain.length)];
                          roles.push(cpuRole);
                          cpuMsgs.push(`CPU${i}は「${cpuRole}」を選択しました。`);
                        }
                        setSelectedRoles(roles);
                        setMessage(`「${card}」を建設しました。\n${cpuMsgs.join("\n")}`);
                        setTimeout(() => {
                          setRole(null);
                          setSelectedRoles([]);
                          setMessage("次のラウンドです。役割を選んでください。");
                          setTurn(t => (t + 1) % 4);
                        }, 1200);
                      }, 800);
                    }}
                  >
                    {card}
                    {info && (
                      <span style={{ fontSize: "0.8em", color: "#666", display: "block" }}>
                        コスト:{info.cost} 点:{info.basePoint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
