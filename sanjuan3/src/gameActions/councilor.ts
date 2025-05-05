import { Player } from "../hooks/useSanJuanGame";

/**
 * 参事会議員アクション: 全員が山札から2枚引き1枚選ぶ（手番プレイヤーは特権で5枚から1枚）
 * @param players プレイヤー配列
 * @param deck 山札
 * @param firstChoices 手番プレイヤーが選ぶカード名（5枚から1枚）
 * @param cpuChoices CPUが選ぶカード名配列（2枚から1枚ずつ）
 * @returns { players, deck, message }
 */
export function councilorAction(
  players: Player[],
  deck: string[],
  firstChoices: { choices: string[]; pick: string },
  cpuChoices: { choices: string[]; pick: string }[]
): { players: Player[]; deck: string[]; message: string } {
  const newPlayers = [...players];
  let d = [...deck];

  // あなた（特権: 5枚から1枚選ぶ。山札が足りない場合もchoices/pickで対応）
  if (
    firstChoices.choices.length > 0 &&
    firstChoices.choices.includes(firstChoices.pick) &&
    d.length >= firstChoices.choices.length
  ) {
    newPlayers[0] = {
      ...newPlayers[0],
      hand: [...newPlayers[0].hand, firstChoices.pick],
    };
    d = d.filter((c, i) => i >= firstChoices.choices.length); // choices分山札から除去
  }

  // CPU（2枚から1枚選ぶ）
  for (let i = 1; i < newPlayers.length; i++) {
    const cpu = { ...newPlayers[i] };
    const cpuChoice = cpuChoices[i - 1];
    if (cpuChoice && cpuChoice.choices.length === 2 && d.length >= 2) {
      cpu.hand = [...cpu.hand, cpuChoice.pick];
      d = d.filter((c, idx) => idx >= 2);
      newPlayers[i] = cpu;
    }
  }

  return {
    players: newPlayers,
    deck: d,
    message: "全員が参事会議員でカードを選びました。"
  };
}