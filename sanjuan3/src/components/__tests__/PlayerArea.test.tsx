import React from "react";
import { render, screen } from "@testing-library/react";
import PlayerArea from "../PlayerArea";

describe("PlayerArea", () => {
  it("名前・建物・手札・総督表示が正しく描画される", () => {
    render(
      <PlayerArea
        name="あなた"
        buildings={["インディゴ染料工場", "製糖工場"]}
        handCount={4}
        isGovernor={true}
      />
    );
    expect(screen.getByText("あなた")).toBeInTheDocument();
    expect(screen.getByText(/インディゴ染料工場/)).toBeInTheDocument();
    expect(screen.getByText(/製糖工場/)).toBeInTheDocument();
    expect(screen.getByText(/手札: 4枚/)).toBeInTheDocument();
    expect(screen.getByText(/総督/)).toBeInTheDocument();
  });
});