import { overseerAction } from "../overseer";
import { buildings } from "../../buildings";
import type { Player } from "../../hooks/useSanJuanGame";

describe("overseerAction", () => {
  it("全員の生産施設に商品を生産する（手番プレイヤーは特権あり）", () => {
    const deck = ["A", "B", "C", "D", "E"];
    const players: Player[] = [
      { name: "あなた", buildings: ["インディゴ染料工場"], hand: [], products: {} },
      { name: "CPU1", buildings: ["インディゴ染料工場"], hand: [], products: {} },
      { name: "CPU2", buildings: ["インディゴ染料工場"], hand: [], products: {} },
      { name: "CPU3", buildings: ["インディゴ染料工場"], hand: [], products: {} },
    ];
    const result = overseerAction(players, deck, true);
    // あなたは特権で2つ生産
    expect(Object.values(result.players[0].products).length).toBe(2);
    // CPUは1つ生産
    expect(Object.values(result.players[1].products).length).toBe(1);
    expect(Object.values(result.players[2].products).length).toBe(1);
    expect(Object.values(result.players[3].products).length).toBe(1);
    // 山札が4枚減る
    expect(result.deck.length).toBe(deck.length - 5);
    // メッセージ
    expect(result.message).toMatch(/生産施設に商品を生産/);
  });

  it("山札が足りない場合でもエラーにならず生産できるだけする", () => {
    const deck = ["A", "B"];
    const players: Player[] = [
      { name: "あなた", buildings: ["インディゴ染料工場"], hand: [], products: {} },
      { name: "CPU1", buildings: ["インディゴ染料工場"], hand: [], products: {} },
    ];
    const result = overseerAction(players, deck, true);
    // 2枚しか生産できない
    expect(
      Object.values(result.players[0].products).length +
      Object.values(result.players[1].products).length
    ).toBe(2);
    expect(result.deck.length).toBe(0);
  });
});