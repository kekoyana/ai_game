import React from "react";
import { render, screen } from "@testing-library/react";
import CpuArea from "../CpuArea";

describe("CpuArea", () => {
  it("CPUプレイヤーの名前・建物・手札・総督表示が正しく描画される", () => {
    render(
      <CpuArea
        cpus={[
          {
            name: "CPU1",
            buildings: ["インディゴ染料工場"],
            hand: ["製糖工場", "煙草工場"],
            isGovernor: false,
          },
          {
            name: "CPU2",
            buildings: ["製糖工場"],
            hand: ["インディゴ染料工場"],
            isGovernor: true,
          },
        ]}
      />
    );
    expect(screen.getByText("CPU1")).toBeInTheDocument();
    expect(screen.getByText("CPU2")).toBeInTheDocument();
    expect(screen.getAllByText(/建物:/).length).toBe(2);
    expect(screen.getAllByText(/手札:/).length).toBe(2);
    expect(screen.getByText(/総督/)).toBeInTheDocument();
  });
});