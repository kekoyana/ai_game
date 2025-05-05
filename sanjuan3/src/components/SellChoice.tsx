import React from "react";

type SellChoiceProps = {
  choices: string[];
  products: Record<string, string>;
  onSelect: (building: string) => void;
};

const SellChoice: React.FC<SellChoiceProps> = ({ choices, products, onSelect }) => (
  <div style={{ marginTop: "1em" }}>
    <div>売却する商品（生産施設）を選んでください:</div>
    <div className="hand-cards">
      {choices.map((b, idx) => (
        <button
          className="card"
          key={idx}
          onClick={() => onSelect(b)}
        >
          {b}の商品（{products[b]}）
        </button>
      ))}
    </div>
  </div>
);

export default SellChoice;