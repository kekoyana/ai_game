import { useState } from "react";
import { buildings } from "../buildings";

export type Player = {
  name: string;
  buildings: string[];
  hand: string[];
  products: Record<string, string>;
};

export function useSanJuanGame() {
  // --- 状態管理 ---
  const [showLog, setShowLog] = useState(false);

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
          const already = !!products[b];
          if (info && info.type === "生産施設" && !already && d.length > 0) {
            products[b] = d[0];
            d = d.slice(1);
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
      setMessageWithLog("全員の生産施設に商品を生産しました。");
      return newPlayers;
    });
  }

  // ...（他のアクション関数も移植）

  // 役割選択後にCPUが順に役割を選ぶ
  function handleRoleSelect(r: string) {
    setRole(r);
    setMessageWithLog(`あなたは「${r}」を選択しました。`);
    setSelectedRoles([r]);
    // ...（他の役割処理省略）

    // CPUの役割選択を順に実行
    setTimeout(() => {
      const roles = [r];
      const cpuMsgs = [];
      const allRoles = ["建築士", "監督", "商人", "参事会議員", "金鉱掘り"];
      let overseerTriggered = false;
      for (let i = 1; i < players.length; i++) {
        // ...（省略: idx計算）
        const remain = allRoles.filter(x => !roles.includes(x));
        const cpuRole = remain[Math.floor(Math.random() * remain.length)];
        roles.push(cpuRole);
        cpuMsgs.push(`CPU${i}は「${cpuRole}」を選択しました。`);
        if (cpuRole === "監督" && !overseerTriggered) {
          handleOverseer(false);
          setMessageWithLog("全員の生産施設に商品を生産しました。");
          overseerTriggered = true;
        }
      }
      setSelectedRoles(roles);
      if (!overseerTriggered) {
        setMessageWithLog(`あなたは「${r}」を選択しました。\n${cpuMsgs.join("\n")}`);
      }
      // ...（ターン終了処理省略）
    }, 800);
  }

    return {
      players,
      deck,
      role,
      selectedRoles,
      buildChoices,
      councilChoices,
      sellChoices,
      governor,
      turn,
      message,
      messageLog,
      showLog,
      setShowLog,
      setPlayers,
      setDeck,
      setRole,
      setSelectedRoles,
      setBuildChoices,
      setCouncilChoices,
      setSellChoices,
      setGovernor,
      setTurn,
      setMessage,
      setMessageLog,
      handleRoleSelect,
      setMessageWithLog,
    };
  }