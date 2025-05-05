import React from "react";
import { render, screen } from "@testing-library/react";
import PlayerBuildings from "../PlayerBuildings";

const buildingInfos = [
  { name: "インディゴ染料工場", cost: 1, basePoint: 1, type: "生産施設" },
  { name: "製糖工場", cost: 2, basePoint: 2, type: "生産施設" },
  { name: "市場", cost: 3, basePoint: 2, type: "都市施設" },
];

describe("PlayerBuildings", () => {
  it("建物名・コスト・点数・商品が正しく描画される", () => {
    render(
      <PlayerBuildings
        buildings={["インディゴ染料工場", "市場"]}
        products={{ "インディゴ染料工場": "インディゴ" }}
        buildingInfos={buildingInfos}
      />
    );
    expect(screen.getByText("インディゴ染料工場")).toBeInTheDocument();
    expect(screen.getByText("市場")).toBeInTheDocument();
    expect(screen.getByText(/コスト:1 点:1/)).toBeInTheDocument();
    expect(screen.getByText(/コスト:3 点:2/)).toBeInTheDocument();
    expect(screen.getByText(/商品: インディゴ/)).toBeInTheDocument();
  });
});