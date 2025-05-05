import React from "react";

type PlayerAreaProps = {
  name: string;
  buildings: string[];
  handCount: number;
  isGovernor: boolean;
};

const PlayerArea: React.FC<PlayerAreaProps> = ({ name, buildings, handCount, isGovernor }) => (
  <div className="player-area">
    <div>
      {name}
      {isGovernor && <span style={{ color: "orange", marginLeft: "4px" }}>（総督）</span>}
    </div>
    <div>建物: {buildings.join(", ")}</div>
    <div>手札: {handCount}枚</div>
  </div>
);

export default PlayerArea;