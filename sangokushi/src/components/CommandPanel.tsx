import { useState } from 'react';
import { Command, CommandCategory, CommandResult, domesticCommands, militaryCommands, personnelCommands, otherCommands, infoCommands } from '../types/command';
import type { NationStatus } from '../types/nation';
import { General, isGeneralAvailable } from '../types/general';
import { GeneralSelector } from './GeneralSelector';
import { GameDate } from '../types/gameState';
import '../styles/CommandPanel.css';

interface CommandPanelProps {
  nation: NationStatus;
  generals: General[];
  currentDate: GameDate;
  onExecuteCommand: (command: Command, general: General) => Promise<CommandResult>;
}

export function CommandPanel({ nation, generals, currentDate, onExecuteCommand }: CommandPanelProps) {
  const [activeCategory, setActiveCategory] = useState<CommandCategory>('domestic');
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [showGeneralSelector, setShowGeneralSelector] = useState(false);
  const [executing, setExecuting] = useState(false);

  const getCommandsByCategory = (category: CommandCategory) => {
    switch (category) {
      case 'domestic':
        return domesticCommands;
      case 'military':
        return militaryCommands;
      case 'personnel':
        return personnelCommands;
      case 'info':
        return infoCommands;
      case 'other':
        return otherCommands;
      default:
        return [];
    }
  };

  const commands = getCommandsByCategory(activeCategory);

  const handleCommandClick = async (command: Command) => {
    setSelectedCommand(command);

    if (['other', 'info'].includes(command.category)) {
      setExecuting(true);
      try {
        await onExecuteCommand(command, generals[0]); // 武将は使用しないため、適当な武将を渡す
      } finally {
        setExecuting(false);
      }
    } else {
      setShowGeneralSelector(true);
    }
  };

  const handleGeneralSelect = async (general: General) => {
    if (!selectedCommand) return;
    
    setShowGeneralSelector(false);
    setExecuting(true);
    try {
      await onExecuteCommand(selectedCommand, general);
    } finally {
      setExecuting(false);
    }
  };
const canExecuteCommand = (command: Command): boolean => {
  // 実行条件をチェックし、適切なメッセージを設定

  // 民忠チェック
  if (command.requirements?.loyalty && nation.loyalty < command.requirements.loyalty) {
    command.disabledReason = `民忠が不足しています (必要: ${command.requirements.loyalty}, 現在: ${nation.loyalty})`;
    return false;
  }

  // 兵力チェック
  if (command.requirements?.military && nation.military < command.requirements.military) {
    command.disabledReason = `兵力が不足しています (必要: ${command.requirements.military}, 現在: ${nation.military})`;
    return false;
  }

  // コストチェック
  if (command.cost?.gold && nation.gold < command.cost.gold) {
    command.disabledReason = `金が不足しています (必要: ${command.cost.gold}, 現在: ${nation.gold})`;
    return false;
  }
  if (command.cost?.food && nation.food < command.cost.food) {
    command.disabledReason = `兵糧が不足しています (必要: ${command.cost.food}, 現在: ${nation.food})`;
    return false;
  }

  // 実行可能な武将が1人以上いるかチェック
  const availableGenerals = generals.filter(general =>
    isGeneralAvailable(general, currentDate.year, currentDate.month)
  );
  
  if (availableGenerals.length === 0) {
    command.disabledReason = '行動可能な武将がいません';
    return false;
  }

  // すべての条件を満たしている場合
  command.disabledReason = undefined;
  return true;
  };

  return (
    <div className="command-panel">
      <div className="command-categories">
        <button
          className={`category-button ${activeCategory === 'domestic' ? 'active' : ''}`}
          onClick={() => setActiveCategory('domestic')}
        >
          内政
        </button>
        <button
          className={`category-button ${activeCategory === 'military' ? 'active' : ''}`}
          onClick={() => setActiveCategory('military')}
        >
          軍事
        </button>
        <button
          className={`category-button ${activeCategory === 'personnel' ? 'active' : ''}`}
          onClick={() => setActiveCategory('personnel')}
        >
          人事
        </button>
        <button
          className={`category-button ${activeCategory === 'info' ? 'active' : ''}`}
          onClick={() => setActiveCategory('info')}
        >
          情報
        </button>
        <button
          className={`category-button ${activeCategory === 'other' ? 'active' : ''}`}
          onClick={() => setActiveCategory('other')}
        >
          その他
        </button>
      </div>

      <div className="commands-list">
        {commands.map(command => (
          <div
            key={command.id}
            className={`command-item ${selectedCommand?.id === command.id ? 'selected' : ''} ${
              canExecuteCommand(command) ? '' : 'disabled'
            } ${executing ? 'executing' : ''}`}
            onClick={() => !executing && canExecuteCommand(command) && handleCommandClick(command)}
          >
            <div className="command-header">
              <span className="command-name">{command.name}</span>
              {command.cost && (
                <span className="command-cost">
                  {command.cost.gold && `金${command.cost.gold} `}
                  {command.cost.food && `兵糧${command.cost.food}`}
                </span>
              )}
            </div>
            <p className="command-description">{command.description}</p>
            {command.requirements && (
              <div className="command-requirements">
                必要条件：
                {command.requirements.loyalty && `民忠${command.requirements.loyalty} `}
                {command.requirements.military && `兵力${command.requirements.military}`}
                {command.disabledReason && (
                  <div className="command-disabled-reason">
                    ⚠️ {command.disabledReason}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showGeneralSelector && (
        <GeneralSelector
          generals={generals}
          currentYear={currentDate.year}
          currentMonth={currentDate.month}
          onSelect={handleGeneralSelect}
          onCancel={() => setShowGeneralSelector(false)}
        />
      )}
    </div>
  );
}