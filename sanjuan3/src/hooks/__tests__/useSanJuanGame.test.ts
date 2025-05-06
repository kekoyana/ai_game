import { renderHook, act } from "@testing-library/react";
import { useSanJuanGame } from "../useSanJuanGame";

describe("useSanJuanGame", () => {
  it("初期状態でプレイヤーが4人いる", () => {
    const { result } = renderHook(() => useSanJuanGame());
    expect(result.current.players.length).toBe(4);
    expect(result.current.players[0].name).toBe("あなた");
  });

  it("役割選択で状態が変化する", () => {
    const { result } = renderHook(() => useSanJuanGame());
    act(() => {
      result.current.handleRoleSelect("監督");
    });
    expect(result.current.role).toBe("監督");
    expect(result.current.selectedRoles).toContain("監督");
  });

  it("建築士選択でbuildChoicesがセットされる", () => {
    const { result } = renderHook(() => useSanJuanGame());
    act(() => {
      result.current.handleRoleSelect("建築士");
    });
    expect(Array.isArray(result.current.buildChoices)).toBe(true);
  });

  it("参事会議員選択でcouncilChoicesがセットされる", () => {
    const { result } = renderHook(() => useSanJuanGame());
    act(() => {
      result.current.handleRoleSelect("参事会議員");
    });
    expect(Array.isArray(result.current.councilChoices)).toBe(true);
  });

  it("金鉱掘り選択で山札が減る", () => {
    const { result } = renderHook(() => useSanJuanGame());
    const before = result.current.deck.length;
    act(() => {
      result.current.handleRoleSelect("金鉱掘り");
    });
    expect(result.current.deck.length).toBeLessThan(before);
  });
});