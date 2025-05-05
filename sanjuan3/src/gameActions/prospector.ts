import { Player } from "../hooks/useSanJuanGame";

/**
 * 金鉱掘りアクション: 手番プレイヤーのみ山札から1枚引く
 * @param players プレイヤー配列
 * @param deck 山札
 * @returns { players, deck, message }
 */
export function prospectorAction(
  players: Player[],
  deck: string[]
): { players: Player[]; deck: string[]; message: string } {
  const newPlayers = [...players];
  let d = [...deck];
  if (d.length > 0) {
    newPlayers[0] = {
      ...newPlayers[0],
      hand: [...newPlayers[0].hand, d[0]],
    };
    d = d.slice(1);
  }
  return {
    players: newPlayers,
    deck: d,
    message: "あなたは「金鉱掘り」でカードを1枚引きました。"
  };
}