import React from "react";

type BuildingInfo = {
  name: string;
  cost: number;
  basePoint: number;
  type: string;
};

type PlayerBuildingsProps = {
  buildings: string[];
  products: Record<string, string>;
  buildingInfos: BuildingInfo[];
};

const PlayerBuildings: React.FC<PlayerBuildingsProps> = ({ buildings, products, buildingInfos }) => (
  <div className="player-buildings">
    <div>あなたの建物:</div>
    <div className="hand-cards">
      {buildings.map((b, idx) => {
        const info = buildingInfos.find(card => card.name === b);
        const product = products?.[b];
        return (
          <span className="card" key={idx}>
            {b}
            {info && (
              <span style={{ fontSize: "0.8em", color: "#666", display: "block" }}>
                コスト:{info.cost} 点:{info.basePoint}
              </span>
            )}
            {info?.type === "生産施設" && product && (
              <span style={{ fontSize: "0.8em", color: "#2a7", display: "block" }}>
                商品: {product}
              </span>
            )}
          </span>
        );
      })}
    </div>
  </div>
);

export default PlayerBuildings;