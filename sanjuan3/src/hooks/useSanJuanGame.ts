import { useState } from "react";
import { buildings } from "../buildings";

export type Player = {
  name: string;
  buildings: string[];
  hand: string[];
  products: Record<string, string>;
};

export function useSanJuanGame() {
  // ...（省略: 状態管理部分は前回と同じ）

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

  // ...（return部分省略）
}