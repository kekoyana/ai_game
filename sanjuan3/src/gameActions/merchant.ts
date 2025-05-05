import { Player } from "../hooks/useSanJuanGame";

/**
 * 商人アクション: 全員が商品を売却しカードを1枚得る
 * @param players プレイヤー配列
 * @param deck 山札
 * @returns { players, deck, message }
 */
export function merchantAction(
  players: Player[],
  deck: string[]
): { players: Player[]; deck: string[]; message: string } {
  const newPlayers = [...players];
  let d = [...deck];
  for (let i = 0; i < newPlayers.length; i++) {
    const player = { ...newPlayers[i] };
    // 売却できる商品を探す
    const prodKeys = Object.keys(player.products).filter(k =>
      player.buildings.includes(k) && player.products[k]
    );
    if (prodKeys.length > 0 && d.length > 0) {
      const sellB = prodKeys[0];
      const products = { ...player.products };
      delete products[sellB];
      player.products = products;
      player.hand = [...player.hand, d[0]];
      d = d.slice(1);
      newPlayers[i] = player;
    }
  }
  return {
    players: newPlayers,
    deck: d,
    message: "全員が商品を売却し、カードを1枚獲得しました。"
  };
}