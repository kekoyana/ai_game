import { builderAction } from "../builder";
import type { Player } from "../../hooks/useSanJuanGame";

describe("builderAction", () => {
  it("あなたが建設し、CPUも建設を試みる（特権でコスト-1）", () => {
    const players: Player[] = [
      { name: "あなた", buildings: ["インディゴ染料工場"], hand: ["製糖所", "製材所", "市場"], products: {} },
      { name: "CPU1", buildings: ["インディゴ染料工場"], hand: ["製糖所", "市場"], products: {} },
      { name: "CPU2", buildings: ["インディゴ染料工場"], hand: ["製材所", "市場"], products: {} }, // 修正
      { name: "CPU3", buildings: ["インディゴ染料工場"], hand: [], products: {} },
    ];
    const result = builderAction(players, "製糖所", true);
    // あなたは製糖所を建設し、手札が1枚減る（コスト2-1=1枚消費）
    expect(result.players[0].buildings).toContain("製糖所");
    expect(result.players[0].hand.length).toBe(1);
    // CPU1は製糖所を建設し、手札が1枚減る（コスト2）
    expect(result.players[1].buildings).toContain("製糖所");
    expect(result.players[1].hand.length).toBe(0);
    // CPU2は製材所を建設
    expect(result.players[2].buildings).toContain("製材所");
    // CPU3は建設できない
    expect(result.players[3].buildings.length).toBe(1);
    // メッセージ
    expect(result.message).toMatch(/CPUも建設を試みました/);
  });

  it("CPUが都市施設を重複して建てない", () => {
    const players: Player[] = [
      { name: "あなた", buildings: ["市役所"], hand: ["市役所", "市場"], products: {} },
      { name: "CPU1", buildings: ["市役所"], hand: ["市役所"], products: {} },
    ];
    const result = builderAction(players, "市役所", true);
    // あなたは市役所を建てられる（重複可否は都市施設のみチェック）
    expect(result.players[0].buildings.filter(b => b === "市役所").length).toBe(2);
    // CPU1は重複建設できない
    expect(result.players[1].buildings.filter(b => b === "市役所").length).toBe(1);
  });
});