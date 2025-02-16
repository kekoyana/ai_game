import React, { useState } from 'react';
import '../styles/Tutorial.css';

interface TutorialStep {
  title: string;
  content: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "環境の配置",
    content: "画面左の環境パネルから環境を選択し、ゲームボード上のマスをクリックして配置できます。生物の進化には適切な環境が必要です。"
  },
  {
    title: "進化の始まり",
    content: "深海や火山では原生生物が自然発生します。これが進化の始まりです。"
  },
  {
    title: "進化の条件",
    content: "生物が進化するには以下の条件が必要です：\n・十分な健康度(70-95)\n・一定の年齢\n・適切な環境\n環境への適応度が高いほど、健康度が上がりやすくなります。"
  },
  {
    title: "ゲームの目標",
    content: "最終的な目標は、10体以上の人類を誕生させることです。\n原生生物から始まり、様々な進化段階を経て人類まで進化させましょう。"
  }
];

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-content">
        <h2>{tutorialSteps[currentStep].title}</h2>
        <p>{tutorialSteps[currentStep].content}</p>
        <button onClick={handleNext}>
          {currentStep < tutorialSteps.length - 1 ? "次へ" : "始める"}
        </button>
      </div>
    </div>
  );
};