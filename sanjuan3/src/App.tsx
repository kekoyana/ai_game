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
  type Player = {
    name: string;
    buildings: string[];
    hand: string[];
    products: Record<string, string>;
  };
  const [players, setPlayers] = useState<Player[]>(() => {
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
        products: {},
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
  const [sellChoices, setSellChoices] = useState<string[] | null>(null);
// 総督（ラウンド開始プレイヤー）のインデックス
  const [governor, setGovernor] = useState(0);

  // 監督アクション
  // 監督アクション（全員分）
  function handleOverseer(isFirst: boolean) {
    setPlayers(ps => {
      const newPlayers = [...ps];
      let d = [...deck];
      for (let i = 0; i < 4; i++) {
        const player = { ...newPlayers[i] };
        const products = { ...player.products };
        player.buildings.forEach(b => {
          const info = buildings.find(card => card.name === b);
          // isFirst: 手番プレイヤーは特権で1つ多く生産
          const already = !!products[b];
          if (info && info.type === "生産施設" && !already && d.length > 0) {
            products[b] = d[0];
            d = d.slice(1);
            // 特権: もう1つ生産（最初のプレイヤーのみ）
            if (isFirst && d.length > 0) {
              products[b + "_bonus"] = d[0];
              d = d.slice(1);
            }
          }
        });
        player.products = products;
        newPlayers[i] = player;
      }
      setDeck(d);
      setMessage("全員の生産施設に商品を生産しました。");
      return newPlayers;
    });
  }

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
        setTurn(governor);
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

    // 監督なら生産処理
    if (r === "監督") {
      setTimeout(() => {
        handleOverseer(true); // 全員分生産（手番プレイヤーは特権）
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
          setMessage(`全員の生産施設に商品を生産しました。\n${cpuMsgs.join("\n")}`);
          setTimeout(() => {
            setRole(null);
            setSelectedRoles([]);
            setMessage("次のラウンドです。役割を選んでください。");
            setGovernor(g => (g + 1) % players.length);
            setTurn(governor);
          }, 1200);
        }, 800);
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
        // 手番プレイヤーのみカードを1枚引く
        setPlayers(ps => {
          const newPlayers = [...ps];
          let d = [...deck];
          if (d.length > 0) {
            newPlayers[0] = {
              ...newPlayers[0],
              hand: [...newPlayers[0].hand, d[0]],
            };
            d = d.slice(1);
          }
          setDeck(d);
          setMessage(`あなたは「金鉱掘り」でカードを1枚引きました。`);
          return newPlayers;
        });
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
            // ゲーム終了判定
            const winner = players.find(p => p.buildings.length >= 12);
            if (winner) {
              // 得点計算
              const scores = players.map(p => {
                let score = 0;
                p.buildings.forEach(b => {
                  const info = buildings.find(card => card.name === b);
                  if (info) score += info.basePoint;
                });
                return { name: p.name, score };
              });
              const maxScore = Math.max(...scores.map(s => s.score));
              const winners = scores.filter(s => s.score === maxScore).map(s => s.name);
              setMessage(
                `ゲーム終了！\n` +
                scores.map(s => `${s.name}: ${s.score}点`).join("\n") +
                `\n勝者: ${winners.join(", ")}`
              );
              return;
            }
            setRole(null);
            setSelectedRoles([]);
            setMessage("次のラウンドです。役割を選んでください。");
            setGovernor(g => (g + 1) % players.length);
            setTurn(governor);
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
      let overseerTriggered = false;
      for (let i = 1; i < players.length; i++) {
        const idx = (governor + i) % players.length;
        // 未選択の役割からランダム選択
        const remain = allRoles.filter(x => !roles.includes(x));
        const cpuRole = remain[Math.floor(Math.random() * remain.length)];
        roles.push(cpuRole);
        cpuMsgs.push(`${players[idx].name}は「${cpuRole}」を選択しました。`);
        // CPUが監督を選んだ場合も全員生産
        if (cpuRole === "監督" && !overseerTriggered) {
          handleOverseer(false);
          overseerTriggered = true;
        }
      }
      setSelectedRoles(roles);
      setMessage(`あなたは「${r}」を選択しました。\n${cpuMsgs.join("\n")}`);

      // 1ラウンド終了後、次のターンへ
      setTimeout(() => {
        setRole(null);
        setSelectedRoles([]);
        setMessage("次のラウンドです。役割を選んでください。");
        setGovernor(g => (g + 1) % players.length);
        setTurn(governor);
      }, 1200);
    }, 800);
  }

  return (
    <div className="game-container">
      <button style={{position: "absolute", right: 10, top: 10, zIndex: 10}} onClick={() => window.location.reload()}>
        リセット
      </button>
{/* あなたの情報表示 */}
      <div className="player-area">
        <div>
          {players[0].name}
          {governor === 0 && <span style={{ color: "orange", marginLeft: "4px" }}>（総督）</span>}
        </div>
        <div>建物: {players[0].buildings.join(", ")}</div>
        <div>手札: {players[0].hand.length}枚</div>
      </div>
      {/* CPUプレイヤー表示 */}
      <div className="cpu-area">
        {players.slice(1).map((cpu) => (
          <div className="cpu" key={cpu.name}>
            <div>
              {cpu.name}
              {players.findIndex(p => p.name === cpu.name) === governor && <span style={{ color: "orange", marginLeft: "4px" }}>（総督）</span>}
            </div>
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
              disabled={turn !== governor || !!role || selectedRoles.includes(r)}
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
            const product = players[0].products?.[b];
            return (
              <span className="card" key={idx}>
                {b}
                {info && (
                  <span style={{ fontSize: "0.8em", color: "#666", display: "block" }}>
                    コスト:{info.cost} 点:{info.basePoint}
                  </span>
                )}
                {info?.type === "生産施設" && product && (
                  <span style={{ fontSize: "0.8em", color: "#2a7", display: "block" }}>
                    商品: {product}
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
                      // あなた＋CPU全員が建設処理
                      setPlayers(ps => {
                        const newPlayers = [...ps];
                        // あなたの建設
                        const hand = newPlayers[0].hand.filter(c => c !== card);
                        const remain = hand.slice(info.cost - 1); // 特権で-1
                        newPlayers[0] = {
                          ...newPlayers[0],
                          hand: remain,
                          buildings: [...newPlayers[0].buildings, card],
                        };
                        // CPUの建設
                        for (let i = 1; i < 4; i++) {
                          const cpu = { ...newPlayers[i] };
                          const built = cpu.buildings;
                          const buildable = cpu.hand.filter(cardName => {
                            const binfo = buildings.find(b => b.name === cardName);
                            if (!binfo) return false;
                            if (binfo.type === "都市施設" && built.includes(cardName)) return false;
                            return cpu.hand.length >= (binfo.cost); // CPUは特権なし
                          });
                          if (buildable.length > 0) {
                            const buildCard = buildable[0];
                            const binfo = buildings.find(b => b.name === buildCard)!;
                            const hand2 = cpu.hand.filter(c => c !== buildCard);
                            const remain2 = hand2.slice(binfo.cost);
                            cpu.hand = remain2;
                            cpu.buildings = [...cpu.buildings, buildCard];
                            newPlayers[i] = cpu;
                          }
                        }
                        return newPlayers;
                      });
                      setMessage(`「${card}」を建設しました。\nCPUも建設を試みました。`);
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
                        setMessage(`「${card}」を建設しました。\nCPUも建設を試みました。\n${cpuMsgs.join("\n")}`);
                        setTimeout(() => {
                          setRole(null);
                          setSelectedRoles([]);
                          setMessage("次のラウンドです。役割を選んでください。");
                          setTurn(governor);
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
        {/* 商人の売却選択UI */}
        {sellChoices && (
          <div style={{ marginTop: "1em" }}>
            <div>売却する商品（生産施設）を選んでください:</div>
            <div className="hand-cards">
              {sellChoices.map((b, idx) => {
                const product = players[0].products[b];
                return (
                  <button
                    className="card"
                    key={idx}
                    onClick={() => {
                      // あなた＋CPU全員が売却処理
                      setPlayers(ps => {
                        const newPlayers = [...ps];
                        let d = [...deck];
                        // あなたの売却
                        const player = { ...newPlayers[0] };
                        const products = { ...player.products };
                        delete products[b];
                        player.products = products;
                        if (d.length > 0) {
                          player.hand = [...player.hand, d[0]];
                          d = d.slice(1);
                        }
                        newPlayers[0] = player;
                        // CPUの売却
                        for (let i = 1; i < 4; i++) {
                          const cpu = { ...newPlayers[i] };
                          // 売却できる商品を探す
                          const prodKeys = Object.keys(cpu.products).filter(k =>
                            cpu.buildings.includes(k) && cpu.products[k]
                          );
                          if (prodKeys.length > 0 && d.length > 0) {
                            const sellB = prodKeys[0];
                            const cproducts = { ...cpu.products };
                            delete cproducts[sellB];
                            cpu.products = cproducts;
                            cpu.hand = [...cpu.hand, d[0]];
                            d = d.slice(1);
                            newPlayers[i] = cpu;
                          }
                        }
                        setDeck(d);
                        return newPlayers;
                      });
                      setSellChoices(null);
                      setMessage(`全員が商品を売却し、カードを1枚獲得しました。`);
                      // CPUの役割選択・ターン進行
                      setTimeout(() => {
                        const roles = ["商人"];
                        const cpuMsgs = [];
                        const allRoles = ["建築士", "監督", "商人", "参事会議員", "金鉱掘り"];
                        for (let i = 1; i < 4; i++) {
                          const remain = allRoles.filter(x => !roles.includes(x));
                          const cpuRole = remain[Math.floor(Math.random() * remain.length)];
                          roles.push(cpuRole);
                          cpuMsgs.push(`CPU${i}は「${cpuRole}」を選択しました。`);
                        }
                        setSelectedRoles(roles);
                        setMessage(`全員が商品を売却し、カードを1枚獲得しました。\n${cpuMsgs.join("\n")}`);
                        setTimeout(() => {
                          setRole(null);
                          setSelectedRoles([]);
                          setMessage("次のラウンドです。役割を選んでください。");
                          setTurn(governor);
                        }, 1200);
                      }, 800);
                    }}
                  >
                    {b}の商品（{players[0].products[b]}）
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
