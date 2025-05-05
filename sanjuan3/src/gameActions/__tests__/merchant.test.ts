import { merchantAction } from "../merchant";
import type { Player } from "../../hooks/useSanJuanGame";

describe("merchantAction", () => {
  it("全員が商品を売却しカードを1枚得る", () => {
    const deck = ["A", "B", "C", "D"];
    const players: Player[] = [
      { name: "あなた", buildings: ["インディゴ染料工場"], hand: [], products: { "インディゴ染料工場": "インディゴ" } },
      { name: "CPU1", buildings: ["サトウ精製所"], hand: [], products: { "サトウ精製所": "サトウ" } },
      { name: "CPU2", buildings: ["鍛冶屋"], hand: [], products: {} },
      { name: "CPU3", buildings: ["インディゴ染料工場"], hand: [], products: { "インディゴ染料工場": "インディゴ" } },
    ];
    const result = merchantAction(players, deck);
    // あなた・CPU1・CPU3は売却しカードを得る
    expect(result.players[0].hand.length).toBe(1);
    expect(result.players[0].products["インディゴ染料工場"]).toBeUndefined();
    expect(result.players[1].hand.length).toBe(1);
    expect(result.players[1].products["サトウ精製所"]).toBeUndefined();
    expect(result.players[2].hand.length).toBe(0); // 商品なし
    expect(result.players[3].hand.length).toBe(1);
    expect(result.players[3].products["インディゴ染料工場"]).toBeUndefined();
    // 山札が3枚減る
    expect(result.deck.length).toBe(deck.length - 3);
    // メッセージ
    expect(result.message).toMatch(/商品を売却/);
  });

  it("山札が足りない場合でもエラーにならず売却できるだけする", () => {
    const deck = ["A"];
    const players: Player[] = [
      { name: "あなた", buildings: ["インディゴ染料工場"], hand: [], products: { "インディゴ染料工場": "インディゴ" } },
      { name: "CPU1", buildings: ["サトウ精製所"], hand: [], products: { "サトウ精製所": "サトウ" } },
    ];
    const result = merchantAction(players, deck);
    // 1人だけ売却できる
    expect(
      result.players[0].hand.length + result.players[1].hand.length
    ).toBe(1);
    expect(result.deck.length).toBe(0);
  });
});