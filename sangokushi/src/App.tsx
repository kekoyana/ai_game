import { useState, useEffect } from 'react'
import './App.css'
import { Map } from './components/Map'
import { Province, provinces } from './types/province'
import { getGeneralsByLordId } from './types/general'
import { LordSelection } from './components/LordSelection'
import { Lord } from './types/lord'
import { NationStatus } from './components/NationStatus'
import { CommandPanel } from './components/CommandPanel'
import { Command, CommandResult } from './types/command'
import type { NationStatus as NationStatusType } from './types/nation'

function App() {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [playerLord, setPlayerLord] = useState<Lord | null>(null);
  const [gameProvinces, setGameProvinces] = useState(provinces);
  const [currentDate, setCurrentDate] = useState({ year: 189, month: 4 });

  // 月の進行処理
  const advanceMonth = (playerProvince: Province) => {
    const newDate = { ...currentDate };
    newDate.month++;
    if (newDate.month > 12) {
      newDate.month = 1;
      newDate.year++;
    }
    setCurrentDate(newDate);

    // 1月の商業収入
    if (newDate.month === 1) {
      const commerceIncome = Math.floor(playerProvince.nation.commerce * 100);
      const updatedProvinces = gameProvinces.map(province => {
        if (province.id === playerProvince.id) {
          return {
            ...province,
            nation: {
              ...province.nation,
              gold: province.nation.gold + commerceIncome
            }
          };
        }
        return province;
      });
      setGameProvinces(updatedProvinces);
      setResult({
        success: true,
        message: `商業による収入: ${commerceIncome}`,
        effects: { gold: commerceIncome }
      });
    }

    // 7月の農業収入
    if (newDate.month === 7) {
      const agricultureIncome = Math.floor(playerProvince.nation.agriculture * 100);
      const updatedProvinces = gameProvinces.map(province => {
        if (province.id === playerProvince.id) {
          return {
            ...province,
            nation: {
              ...province.nation,
              food: province.nation.food + agricultureIncome
            }
          };
        }
        return province;
      });
      setGameProvinces(updatedProvinces);
      setResult({
        success: true,
        message: `農業による収入: ${agricultureIncome}`,
        effects: { food: agricultureIncome }
      });
    }
  };

  // 結果表示用の状態
  const [result, setResult] = useState<CommandResult | null>(null);

  // プレイヤーの国を取得
  const getPlayerProvince = () => {
    return gameProvinces.find(p => p.lord?.id === playerLord?.id);
  };

  // コマンド実行のハンドラ
  const handleExecuteCommand = async (command: Command): Promise<CommandResult> => {
    const playerProvince = getPlayerProvince();
    if (!playerProvince) {
      return {
        success: false,
        message: "プレイヤーの国が見つかりません"
      };
    }

    // コマンドの実行結果を処理
    const result = executeCommand(command, playerProvince.nation);
    
    if (result.success && result.effects) {
      // 国のステータスを更新
      const updatedProvinces = gameProvinces.map(province => {
        if (province.id === playerProvince.id) {
          const updatedNation = updateNationStatus(province.nation, result.effects!);
          return { ...province, nation: updatedNation };
        }
        return province;
      });
      
      setGameProvinces(updatedProvinces);
    }

    return result;
  };

  // 国のステータスを更新
  const updateNationStatus = (
    nation: NationStatusType,
    effects: NonNullable<CommandResult['effects']>
  ): NationStatusType => {
    return {
      ...nation,
      gold: effects.gold ? nation.gold + effects.gold : nation.gold,
      food: effects.food ? nation.food + effects.food : nation.food,
      loyalty: effects.loyalty ? Math.max(0, Math.min(100, nation.loyalty + effects.loyalty)) : nation.loyalty,
      commerce: effects.commerce ? Math.max(0, Math.min(100, nation.commerce + effects.commerce)) : nation.commerce,
      agriculture: effects.agriculture ? Math.max(0, Math.min(100, nation.agriculture + effects.agriculture)) : nation.agriculture,
      military: effects.military ? Math.max(0, nation.military + effects.military) : nation.military,
      arms: effects.arms ? Math.max(0, Math.min(100, nation.arms + effects.arms)) : nation.arms,
      training: effects.training ? Math.max(0, Math.min(100, nation.training + effects.training)) : nation.training,
      population: effects.population ? Math.max(0, nation.population + effects.population) : nation.population
    };
  };

  // コマンドの実行
  const executeCommand = (command: Command, nation: NationStatusType): CommandResult => {
    // 補助関数
    const calculateTax = (nation: NationStatusType) => Math.floor(nation.commerce * 10);
    const calculateRecruits = (nation: NationStatusType) => Math.floor(nation.population * 0.01);

    const playerProvince = getPlayerProvince();
    if (!playerProvince) {
      return {
        success: false,
        message: "プレイヤーの国が見つかりません"
      };
    }

    switch (command.id) {
      case 'end_turn':
        advanceMonth(playerProvince);
        return {
          success: true,
          message: `${currentDate.year}年${currentDate.month}月が経過しました`
        };

      case 'develop_commerce':
        return {
          success: true,
          message: "商業が発展しました",
          effects: {
            gold: -(command.cost?.gold || 0),
            commerce: 5,
            loyalty: -2
          }
        };

      case 'develop_agriculture':
        return {
          success: true,
          message: "土地が開発されました",
          effects: {
            gold: -(command.cost?.gold || 0),
            agriculture: 5,
            loyalty: -2
          }
        };

      case 'collect_tax':
        return {
          success: true,
          message: `${calculateTax(nation)}の金を徴収しました`,
          effects: {
            gold: calculateTax(nation),
            loyalty: -5
          }
        };

      case 'conscript':
        return {
          success: true,
          message: `${calculateRecruits(nation)}の兵士を徴用しました`,
          effects: {
            military: calculateRecruits(nation),
            population: -calculateRecruits(nation),
            loyalty: -3,
            gold: -(command.cost?.gold || 0)
          }
        };

      case 'train_troops':
        return {
          success: true,
          message: "軍事訓練を実施しました",
          effects: {
            gold: -(command.cost?.gold || 0),
            food: -(command.cost?.food || 0),
            training: 5
          }
        };

      case 'improve_arms':
        return {
          success: true,
          message: "武装を強化しました",
          effects: {
            gold: -(command.cost?.gold || 0),
            arms: 5
          }
        };

      case 'distribute_food':
        return {
          success: true,
          message: "兵糧を配給しました",
          effects: {
            food: -(command.cost?.food || 0),
            training: 3,
            loyalty: 2
          }
        };

      default:
        return {
          success: false,
          message: "未実装のコマンドです"
        };
    }
  };

  // ゲームが開始されていない場合（君主未選択）
  if (!playerLord) {
    return (
      <div className="game-container">
        <LordSelection onSelect={setPlayerLord} />
      </div>
    );
  }

  const playerProvince = getPlayerProvince();

  const handleProvinceClick = (province: Province) => {
    setSelectedProvince(province);
  };

  return (
    <div className="game-container">
      <div className="game-area">
        <Map
          onProvinceClick={handleProvinceClick}
          currentDate={currentDate}
        />
      </div>
      <div className="message-area">
        <p>現在のターン: {playerLord.name}の作戦フェーズ</p>
        {selectedProvince && (
          <p>{selectedProvince.name}が選択されました</p>
        )}
      </div>
      <div className="status-area">
        <div className="player-info">
          <h2>プレイヤー情報</h2>
          <div className="lord-info">
            <p>君主：{playerLord.name}</p>
            <p>軍事力：{playerLord.strength}</p>
          </div>
          {playerProvince && (
            <>
              <NationStatus status={playerProvince.nation} />
              <CommandPanel
                nation={playerProvince.nation}
                generals={getGeneralsByLordId(playerLord.id)}
                currentDate={currentDate}
                onExecuteCommand={handleExecuteCommand}
              />
            </>
          )}
        </div>

        {selectedProvince && selectedProvince.id !== playerProvince?.id && (
          <>
            <h2>選択中の州の情報</h2>
            <div className="province-info">
              <h3>{selectedProvince.name}</h3>
              <div className="lord-info">
                <p>君主：{selectedProvince.lord?.name || '空白国'}</p>
                {selectedProvince.lord && (
                  <p>軍事力：{selectedProvince.lord.strength}</p>
                )}
              </div>
              
              <NationStatus status={selectedProvince.nation} />

              {selectedProvince.lord && (
                <div className="generals-info">
                  <h4>配下の武将</h4>
                  <div className="generals-list">
                    {getGeneralsByLordId(selectedProvince.lord.id).map(general => (
                      <div key={general.id} className="general-item">
                        <div className="general-header">
                          <span className="general-name">{general.name}</span>
                          <span className="general-loyalty">忠誠: {general.loyalty}</span>
                        </div>
                        <div className="general-stats">
                          <span className="stat">武力: {general.stats.war}</span>
                          <span className="stat">知力: {general.stats.int}</span>
                          <span className="stat">統率: {general.stats.lead}</span>
                          <span className="stat">政治: {general.stats.pol}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="adjacent-info">
                <p>隣接する州:</p>
                <ul>
                  {selectedProvince.adjacentProvinces.map(id => {
                    const province = gameProvinces.find(p => p.id === id);
                    return (
                      <li key={id}>
                        {province?.name} ({province?.lord?.name || '空白国'})
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
