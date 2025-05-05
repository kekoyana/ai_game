import { Player } from "../hooks/useSanJuanGame";
import { buildings } from "../buildings";

/**
 * 監督アクション: 全員の生産施設に商品を生産する
 * @param players プレイヤー配列
 * @param deck 山札
 * @param isFirst 手番プレイヤーかどうか（特権で追加生産）
 * @returns { players, deck, message }
 */
export function overseerAction(
  players: Player[],
  deck: string[],
  isFirst: boolean
): { players: Player[]; deck: string[]; message: string } {
  const newPlayers = [...players];
  let d = [...deck];
  for (let i = 0; i < newPlayers.length; i++) {
    const player = { ...newPlayers[i] };
    const products = { ...player.products };
    player.buildings.forEach(b => {
      const info = buildings.find(card => card.name === b);
      const already = !!products[b];
      if (info && info.type === "生産施設" && !already && d.length > 0) {
        products[b] = d[0];
        d = d.slice(1);
        if (isFirst && i === 0 && d.length > 0) {
          products[b + "_bonus"] = d[0];
          d = d.slice(1);
        }
      }
    });
    player.products = products;
    newPlayers[i] = player;
  }
  return {
    players: newPlayers,
    deck: d,
    message: "全員の生産施設に商品を生産しました。"
  };
}