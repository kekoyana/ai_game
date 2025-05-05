import { useState } from 'react'
import './App.css'
import { buildings } from './buildings'
import PlayerArea from './components/PlayerArea'
import CpuArea from './components/CpuArea'
import PlayerBuildings from './components/PlayerBuildings'
import PlayerHand from './components/PlayerHand'
import RoleButtons from './components/RoleButtons'
import MessageArea from './components/MessageArea'
import CouncilChoice from './components/CouncilChoice'
import BuildChoice from './components/BuildChoice'
import SellChoice from './components/SellChoice'
import { builderAction } from './gameActions/builder'
import { overseerAction } from './gameActions/overseer'
import { merchantAction } from './gameActions/merchant'
import { councilorAction } from './gameActions/councilor'
import { prospectorAction } from './gameActions/prospector'

function App() {
  // --- 状態管理 ---
  function createDeck() {
    const deck: string[] = [];
    buildings.forEach(card => {
      const count = card.name === "インディゴ染料工場" ? (card.count ?? 0) - 4 : (card.count ?? 0);
      for (let i = 0; i < count; i++) deck.push(card.name);
    });
    return deck;
  }
  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  const [deck, setDeck] = useState<string[]>(() => shuffle(createDeck()));
  type Player = {
    name: string;
    buildings: string[];
    hand: string[];
    products: Record<string, string>;
  };
  const [players, setPlayers] = useState<Player[]>(() => {
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
  const [messageLog, setMessageLog] = useState<string[]>(["ゲーム開始！役割を選んでください。"]);
  function setMessageWithLog(msg: string) {
    setMessage(msg);
    setMessageLog(log => [...log, msg]);
  }
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [councilChoices, setCouncilChoices] = useState<string[] | null>(null);
  const [buildChoices, setBuildChoices] = useState<string[] | null>(null);
  const [sellChoices, setSellChoices] = useState<string[] | null>(null);
  const [governor, setGovernor] = useState(0);

  // --- 役割選択 ---
  function handleRoleSelect(r: string) {
    setRole(r);
    setSelectedRoles([r]);
    if (r === "建築士") {
      // 建築士: 手札から建設カード選択UIへ
      const built = players[0].buildings;
      const hand = players[0].hand;
      const buildable = hand.filter(cardName => {
        const info = buildings.find(b => b.name === cardName);
        if (!info) return false;
        if (info.type === "都市施設" && built.includes(cardName)) return false;
        return true;
      });
      setBuildChoices(buildable);
      setMessageWithLog("建設するカードを選んでください。");
      return;
    }
    if (r === "監督") {
      // 監督: 全員生産
      const { players: newPlayers, deck: newDeck, message: msg } = overseerAction(players, deck, true);
      setPlayers(newPlayers);
      setDeck(newDeck);
      setMessageWithLog(msg);
      // CPUの役割選択を順に実行（省略: 必要ならロジック追加）
      setTimeout(() => {
        setRole(null);
        setSelectedRoles([]);
        setMessageWithLog("次のラウンドです。役割を選んでください。");
        setGovernor(g => (g + 1) % players.length);
        setTurn(governor);
      }, 1200);
      return;
    }
    if (r === "商人") {
      // 商人: 売却選択UIへ
      const sellable = Object.keys(players[0].products).filter(b =>
        players[0].buildings.includes(b) && players[0].products[b]
      );
      setSellChoices(sellable);
      setMessageWithLog("売却する商品（生産施設）を選んでください。");
      return;
    }
    if (r === "参事会議員") {
      // 参事会議員: 山札から2枚引く（UIで選択）
      if (deck.length < 2) return;
      setCouncilChoices(deck.slice(0, 2));
      setMessageWithLog("1枚選んで手札に加えてください。");
      return;
    }
    if (r === "金鉱掘り") {
      // 金鉱掘り: 山札から1枚引く
      const { players: newPlayers, deck: newDeck, message: msg } = prospectorAction(players, deck);
      setPlayers(newPlayers);
      setDeck(newDeck);
      setMessageWithLog(msg);
      setTimeout(() => {
        setRole(null);
        setSelectedRoles([]);
        setMessageWithLog("次のラウンドです。役割を選んでください。");
        setGovernor(g => (g + 1) % players.length);
        setTurn(governor);
      }, 1200);
      return;
    }
  }

  // --- UI ---
  return (
    <div className="game-container">
      <button style={{position: "absolute", right: 10, top: 10, zIndex: 10}} onClick={() => window.location.reload()}>
        リセット
      </button>
      <PlayerArea
        name={players[0].name}
        buildings={players[0].buildings}
        handCount={players[0].hand.length}
        isGovernor={governor === 0}
      />
      <CpuArea
        cpus={players.slice(1).map((cpu, idx) => ({
          name: cpu.name,
          buildings: cpu.buildings,
          hand: cpu.hand,
          isGovernor: (idx + 1) === governor
        }))}
      />
      <div className="center-area">
        <div>現在の役割: {role ?? "未選択"}</div>
        <div>ターン: {players[turn].name}</div>
        <RoleButtons
          roles={["建築士", "監督", "商人", "参事会議員", "金鉱掘り"]}
          selectedRoles={selectedRoles}
          currentRole={role}
          turn={turn}
          governor={governor}
          onSelect={handleRoleSelect}
        />
      </div>
      <MessageArea message={message} messageLog={messageLog} />
      <PlayerBuildings
        buildings={players[0].buildings}
        products={players[0].products}
        buildingInfos={buildings}
      />
      <PlayerHand
        hand={players[0].hand}
        buildingInfos={buildings}
      />
      {councilChoices && (
        <CouncilChoice choices={councilChoices} onSelect={card => {
          setPlayers(ps => {
            const newPlayers = [...ps];
            newPlayers[0] = {
              ...newPlayers[0],
              hand: [...newPlayers[0].hand, card],
            };
            return newPlayers;
          });
          setDeck(d => d.filter((c, i) => i >= 2));
          setCouncilChoices(null);
          setMessageWithLog(`「${card}」を手札に加えました。`);
          // CPUの役割選択を順に実行（省略: 必要ならロジック追加）
          setTimeout(() => {
            setRole(null);
            setSelectedRoles([]);
            setMessageWithLog("次のラウンドです。役割を選んでください。");
            setTurn(governor);
          }, 1200);
        }} />
      )}
      {buildChoices && (
        <BuildChoice
          choices={buildChoices}
          onSelect={card => {
            const { players: newPlayers, message: msg } = builderAction(players, card, true);
            setPlayers(newPlayers);
            setBuildChoices(null);
            setMessageWithLog(msg);
            // CPUの役割選択・ターン進行（省略: 必要ならロジック追加）
            setTimeout(() => {
              setRole(null);
              setSelectedRoles([]);
              setMessageWithLog("次のラウンドです。役割を選んでください。");
              setTurn(governor);
            }, 1200);
          }}
        />
      )}
      {sellChoices && (
        <SellChoice
          choices={sellChoices}
          products={players[0].products}
          onSelect={b => {
            const { players: newPlayers, deck: newDeck, message: msg } = merchantAction(players, deck);
            setPlayers(newPlayers);
            setDeck(newDeck);
            setSellChoices(null);
            setMessageWithLog(msg);
            // CPUの役割選択・ターン進行（省略: 必要ならロジック追加）
            setTimeout(() => {
              setRole(null);
              setSelectedRoles([]);
              setMessageWithLog("次のラウンドです。役割を選んでください。");
              setTurn(governor);
            }, 1200);
          }}
        />
      )}
    </div>
  );
}

export default App;
