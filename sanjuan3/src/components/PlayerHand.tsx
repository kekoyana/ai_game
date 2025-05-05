import React from "react";

type BuildingInfo = {
  name: string;
  cost: number;
  basePoint: number;
};

type PlayerHandProps = {
  hand: string[];
  buildingInfos: BuildingInfo[];
};

const PlayerHand: React.FC<PlayerHandProps> = ({ hand, buildingInfos }) => (
  <div className="player-hand">
    <div>あなたの手札:</div>
    <div className="hand-cards">
      {hand.map((card, idx) => {
        const info = buildingInfos.find(b => b.name === card);
        return (
          <span className="card" key={idx}>
            {card}
            {info && (
              <span style={{ fontSize: "0.8em", color: "#666", display: "block" }}>
                コスト:{info.cost} 点:{info.basePoint}
              </span>
            )}
          </span>
        );
      })}
    </div>
  </div>
);

export default PlayerHand;