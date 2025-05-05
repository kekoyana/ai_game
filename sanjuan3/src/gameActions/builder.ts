import { Player } from "../hooks/useSanJuanGame";
import { buildings } from "../buildings";

/**
 * 建築士アクション: 全員が建設を試みる（手番プレイヤーはコスト-1の特権）
 * @param players プレイヤー配列
 * @param buildCard あなたが建てるカード名
 * @param isFirst 手番プレイヤーかどうか
 * @returns { players, message }
 */
export function builderAction(
  players: Player[],
  buildCard: string,
  isFirst: boolean
): { players: Player[]; message: string } {
  const newPlayers = [...players];
  // あなたの建設
  const info = buildings.find(b => b.name === buildCard);
  if (info) {
    // 建設カードを除外した手札からコスト-1枚を消費
    const handWithoutBuild = [...newPlayers[0].hand];
    const buildIdx = handWithoutBuild.indexOf(buildCard);
    if (buildIdx !== -1) handWithoutBuild.splice(buildIdx, 1);
    // コスト-1枚だけ消費
    handWithoutBuild.splice(0, info.cost - 1);
    newPlayers[0] = {
      ...newPlayers[0],
      hand: handWithoutBuild,
      buildings: [...newPlayers[0].buildings, buildCard],
    };
  }
  // CPUの建設
  for (let i = 1; i < newPlayers.length; i++) {
    const cpu = { ...newPlayers[i] };
    const built = cpu.buildings;
    const buildable = cpu.hand.filter(cardName => {
      const binfo = buildings.find(b => b.name === cardName);
      if (!binfo) return false;
      if (binfo.type === "都市施設" && built.includes(cardName)) return false;
      return cpu.hand.length >= binfo.cost;
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
  return {
    players: newPlayers,
    message: `「${buildCard}」を建設しました。\nCPUも建設を試みました。`
  };
}