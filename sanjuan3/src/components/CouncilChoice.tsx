import React from "react";
import { buildings } from "../buildings";

type CouncilChoiceProps = {
  choices: string[];
  onSelect: (card: string) => void;
};

const CouncilChoice: React.FC<CouncilChoiceProps> = ({ choices, onSelect }) => (
  <div style={{ marginTop: "1em" }}>
    <div>カードを1枚選んでください:</div>
    <div className="hand-cards">
      {choices.map((card, idx) => {
        const info = buildings.find(b => b.name === card);
        return (
          <button className="card" key={idx} onClick={() => onSelect(card)}>
            {card}
            {info && (
              <span style={{ fontSize: "0.8em", color: "#666", display: "block" }}>
                コスト:{info.cost} 点:{info.basePoint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default CouncilChoice;