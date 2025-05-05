import { prospectorAction } from "../prospector";
import type { Player } from "../../hooks/useSanJuanGame";

describe("prospectorAction", () => {
  it("手番プレイヤーのみ山札から1枚引く", () => {
    const deck = ["A", "B", "C"];
    const players: Player[] = [
      { name: "あなた", buildings: [], hand: [], products: {} },
      { name: "CPU1", buildings: [], hand: [], products: {} },
      { name: "CPU2", buildings: [], hand: [], products: {} },
      { name: "CPU3", buildings: [], hand: [], products: {} },
    ];
    const result = prospectorAction(players, deck);
    // あなただけ手札が1枚増える
    expect(result.players[0].hand.length).toBe(1);
    expect(result.players[0].hand).toContain("A");
    expect(result.players[1].hand.length).toBe(0);
    expect(result.players[2].hand.length).toBe(0);
    expect(result.players[3].hand.length).toBe(0);
    // 山札が1枚減る
    expect(result.deck.length).toBe(deck.length - 1);
    expect(result.deck).toEqual(["B", "C"]);
    // メッセージ
    expect(result.message).toMatch(/金鉱掘り/);
  });

  it("山札が空の場合は誰もカードを引けない", () => {
    const deck: string[] = [];
    const players: Player[] = [
      { name: "あなた", buildings: [], hand: [], products: {} },
      { name: "CPU1", buildings: [], hand: [], products: {} },
    ];
    const result = prospectorAction(players, deck);
    // 誰もカードを引けない
    expect(result.players[0].hand.length).toBe(0);
    expect(result.players[1].hand.length).toBe(0);
    expect(result.deck.length).toBe(0);
    // メッセージ
    expect(result.message).toMatch(/金鉱掘り/);
  });
});