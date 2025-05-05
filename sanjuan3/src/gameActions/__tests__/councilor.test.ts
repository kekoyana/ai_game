import { councilorAction } from "../councilor";
import type { Player } from "../../hooks/useSanJuanGame";

describe("councilorAction", () => {
  it("全員が参事会議員でカードを選ぶ（手番は5枚から1枚、CPUは2枚から1枚）", () => {
    const deck = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    const players: Player[] = [
      { name: "あなた", buildings: [], hand: [], products: {} },
      { name: "CPU1", buildings: [], hand: [], products: {} },
      { name: "CPU2", buildings: [], hand: [], products: {} },
      { name: "CPU3", buildings: [], hand: [], products: {} },
    ];
    const result = councilorAction(
      players,
      deck,
      { choices: deck.slice(0, 5), pick: "C" },
      [
        { choices: deck.slice(5, 7), pick: "F" },
        { choices: deck.slice(7, 9), pick: "H" },
        { choices: [], pick: "" }
      ]
    );
    // あなたはC、CPU1はF、CPU2はHを手札に加える
    expect(result.players[0].hand).toContain("C");
    expect(result.players[1].hand).toContain("F");
    expect(result.players[2].hand).toContain("H");
    // 山札が5+2+2=9枚減る
    expect(result.deck.length).toBe(deck.length - 9);
    // メッセージ
    expect(result.message).toMatch(/参事会議員/);
  });

  it("山札が足りない場合でもエラーにならず選べるだけ選ぶ", () => {
    const deck = ["A", "B", "C"];
    const players: Player[] = [
      { name: "あなた", buildings: [], hand: [], products: {} },
      { name: "CPU1", buildings: [], hand: [], products: {} },
    ];
    const result = councilorAction(
      players,
      deck,
      { choices: deck.slice(0, 3), pick: "B" },
      [
        { choices: [], pick: "" }
      ]
    );
    // あなたはBを手札に加える
    expect(result.players[0].hand).toContain("B");
    // CPU1は選べない
    expect(result.players[1].hand.length).toBe(0);
    expect(result.deck.length).toBe(0);
  });
});