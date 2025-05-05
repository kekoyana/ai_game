import React from "react";

type CpuPlayer = {
  name: string;
  buildings: string[];
  hand: string[];
  isGovernor: boolean;
};

type CpuAreaProps = {
  cpus: CpuPlayer[];
};

const CpuArea: React.FC<CpuAreaProps> = ({ cpus }) => (
  <div className="cpu-area">
    {cpus.map((cpu) => (
      <div className="cpu" key={cpu.name}>
        <div>
          {cpu.name}
          {cpu.isGovernor && <span style={{ color: "orange", marginLeft: "4px" }}>（総督）</span>}
        </div>
        <div>建物: {cpu.buildings.join(", ")}</div>
        <div>手札: {cpu.hand.length}枚</div>
      </div>
    ))}
  </div>
);

export default CpuArea;