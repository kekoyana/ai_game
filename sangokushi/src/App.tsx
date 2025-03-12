import { useState, useEffect } from 'react'
import './App.css'
import { Map } from './components/Map'
import { MessageArea } from './components/MessageArea'
import { Province, provinces } from './types/province'
import { getGeneralsByLordId, General } from './types/general'
import { LordSelection } from './components/LordSelection'
import { Lord } from './types/lord'
import { NationStatus } from './components/NationStatus'
import { CommandPanel } from './components/CommandPanel'
import { Command, CommandResult, WarCommand } from './types/command'
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
  const handleExecuteCommand = async (command: Command, general: General): Promise<CommandResult> => {
    const playerProvince = getPlayerProvince();
    if (!playerProvince) {
      return {
        success: false,
        message: "プレイヤーの国が見つかりません"
      };
    }

    // コマンドの実行結果を処理
    const result = executeCommand(command, playerProvince.nation, general);
    
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
      // コマンド実行結果をメッセージエリアに表示
      setResult(result);
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

  // 戦闘力の計算
  const calculateBattlePower = (
    province: Province,
    general: General
  ): number => {
    const nation = province.nation;
    // 基本戦闘力 = 兵力 × (1 + 訓練度/100) × (1 + 武器/100)
    const basePower = nation.military * (1 + nation.training / 100) * (1 + nation.arms / 100);
    // 武将補正 = (武力 + 統率) / 100
    const generalBonus = (general.stats.war + general.stats.lead) / 100;
    
    return Math.floor(basePower * (1 + generalBonus));
  };

  // 戦闘結果の処理
  const processBattleResult = (
    attackerProvince: Province,
    defenderProvince: Province,
    attacker: General,
    battlePowerDiff: number,
    won: boolean
  ): CommandResult => {
    if (won) {
      // 攻撃側が勝利
      // 領土を併合（防衛側の州をプレイヤーの支配下に）
      const updatedProvinces = gameProvinces.map(province => {
        if (province.id === defenderProvince.id) {
          return {
            ...province,
            lord: attackerProvince.lord,
            nation: {
              ...province.nation,
              military: Math.floor(province.nation.military * 0.5), // 残存兵力は半分に
              loyalty: Math.floor(province.nation.loyalty * 0.5)  // 民忠も半分に
            }
          };
        }
        return province;
      });
      setGameProvinces(updatedProvinces);
      
      // 勝利時の結果をreturn
      return {
        success: true,
        message: `${defenderProvince.name}を征服しました！`,
        effects: {
          military: -Math.floor(attackerProvince.nation.military * 0.2), // 兵力の20%を損失
          food: -(2000 + Math.floor(attackerProvince.nation.military * 0.1)), // 基本消費+兵力に応じた消費
          loyalty: -10 // 戦争による民忠低下
        }
      };
    } else {
      // 攻撃側が敗北
      return {
        success: false,
        message: `${defenderProvince.name}との戦いに敗れました...`,
        effects: {
          military: -Math.floor(attackerProvince.nation.military * 0.4), // 兵力の40%を損失
          food: -(2000 + Math.floor(attackerProvince.nation.military * 0.1)), // 基本消費+兵力に応じた消費
          loyalty: -20 // 大敗による民忠低下
        }
      };
    }
  };

  // コマンドの実行
  const executeCommand = (command: Command, nation: NationStatusType, general: General): CommandResult => {
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
      case 'war':
        // 攻撃対象の確認
        if (!selectedProvince || !selectedProvince.lord || selectedProvince.id === playerProvince.id) {
          return {
            success: false,
            message: "攻撃対象の州を選択してください"
          };
        }

        // 隣接チェック
        if (!playerProvince.adjacentProvinces.includes(selectedProvince.id)) {
          return {
            success: false,
            message: "隣接していない州には攻め込めません"
          };
        }

        // 戦闘力計算
        const attackerPower = calculateBattlePower(playerProvince, general);
        const defenderGenerals = getGeneralsByLordId(selectedProvince.lord.id);
        const defenderGeneral = defenderGenerals[0]; // 最初の武将を防御側として使用
        const defenderPower = calculateBattlePower(selectedProvince, defenderGeneral);
        
        const battlePowerDiff = attackerPower - defenderPower;
        const won = battlePowerDiff > 0;

        return processBattleResult(playerProvince, selectedProvince, general, battlePowerDiff, won);

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

      case 'charity':
        return {
          success: true,
          message: "民に兵糧を施しました",
          effects: {
            food: -(command.cost?.food || 0),
            loyalty: 10
          }
        };

      default:
        return {
          success: false,
          message: "未実装のコマンドです"
        };
    }
  };

  // 君主を武将として扱うためのヘルパー関数
  const convertLordToGeneral = (lord: Lord): General => {
    return {
      id: `lord_${lord.id}`,
      name: `${lord.name}（君主）`,
      stats: {
        war: lord.strength,
        int: lord.strength,
        lead: lord.strength,
        pol: lord.strength
      },
      loyalty: 100,
      lordId: lord.id,
      available: true
    };
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
      <MessageArea
        playerName={playerLord.name}
        selectedProvinceName={selectedProvince?.name}
        result={result}
      />
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
                generals={[convertLordToGeneral(playerLord), ...getGeneralsByLordId(playerLord.id)]}
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
