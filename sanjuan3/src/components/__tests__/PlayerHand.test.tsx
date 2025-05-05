import React from "react";
import { render, screen } from "@testing-library/react";
import PlayerHand from "../PlayerHand";

const buildingInfos = [
  { name: "インディゴ染料工場", cost: 1, basePoint: 1 },
  { name: "製糖工場", cost: 2, basePoint: 2 },
];

describe("PlayerHand", () => {
  it("手札のカード名・コスト・点数が正しく描画される", () => {
    render(
      <PlayerHand
        hand={["インディゴ染料工場", "製糖工場"]}
        buildingInfos={buildingInfos}
      />
    );
    expect(screen.getByText("インディゴ染料工場")).toBeInTheDocument();
    expect(screen.getByText("製糖工場")).toBeInTheDocument();
    expect(screen.getByText(/コスト:1 点:1/)).toBeInTheDocument();
    expect(screen.getByText(/コスト:2 点:2/)).toBeInTheDocument();
  });
});