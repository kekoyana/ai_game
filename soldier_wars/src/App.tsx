import { useState, useEffect, useRef } from 'react';
import './App.css';
import { BattleSimulation } from './simulation';
import { allFormations } from './formations';
import { Formation, AttackType, attackStrategies } from './types';

function App() {
  const [simulation, setSimulation] = useState<BattleSimulation | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [teamAFormation, setTeamAFormation] = useState<Formation>(allFormations[0]);
  const [teamBFormation, setTeamBFormation] = useState<Formation>(allFormations[0]);
  const [teamAStrategy, setTeamAStrategy] = useState<AttackType>('normal');
  const [teamBStrategy, setTeamBStrategy] = useState<AttackType>('normal');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const startSimulation = () => {
    const newSimulation = new BattleSimulation(
      teamAFormation,
      teamBFormation,
      teamAStrategy,
      teamBStrategy
    );
    setSimulation(newSimulation);
    setIsRunning(true);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setSimulation(null);
  };

  const renderSimulation = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !simulation) return;

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 兵士の描画
    simulation.getSoldiers().forEach((soldier) => {
      if (soldier.hp <= 0) return;

      ctx.fillStyle = soldier.team === 'A' ? '#ff0000' : '#0000ff';
      ctx.fillRect(soldier.x, soldier.y, 3, 3);
    });
  };

  useEffect(() => {
    if (!isRunning || !simulation) return;

    const animate = () => {
      // フレームレートを制御（約6FPS）
      setTimeout(() => {
        const battleContinues = simulation.simulateStep();
        renderSimulation();

        if (battleContinues) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setIsRunning(false);
        }
      }, 150); // 150ミリ秒のディレイ
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, simulation]);

  // 残存兵士数の計算
  const survivingCounts = simulation
    ? {
        A: simulation.getSoldiers().filter((s) => s.team === 'A' && s.hp > 0).length,
        B: simulation.getSoldiers().filter((s) => s.team === 'B' && s.hp > 0).length,
      }
    : { A: 100, B: 100 };

  return (
    <div className="App">
      <h1>兵士戦闘シミュレーター</h1>
      
      <div className="controls">
        <div className="formation-selector">
          <div>
            <label>チームA陣形（下）：</label>
            <select
              value={teamAFormation.name}
              onChange={(e) => setTeamAFormation(allFormations.find(f => f.name === e.target.value) || allFormations[0])}
              disabled={isRunning}
            >
              {allFormations.map((formation) => (
                <option key={formation.name} value={formation.name}>
                  {formation.name}
                </option>
              ))}
            </select>
            <label style={{ marginLeft: '10px' }}>攻撃タイプ：</label>
            <select
              value={teamAStrategy}
              onChange={(e) => setTeamAStrategy(e.target.value as AttackType)}
              disabled={isRunning}
            >
              {attackStrategies.map((strategy) => (
                <option key={strategy.type} value={strategy.type} title={strategy.description}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>チームB陣形（上）：</label>
            <select
              value={teamBFormation.name}
              onChange={(e) => setTeamBFormation(allFormations.find(f => f.name === e.target.value) || allFormations[0])}
              disabled={isRunning}
            >
              {allFormations.map((formation) => (
                <option key={formation.name} value={formation.name}>
                  {formation.name}
                </option>
              ))}
            </select>
            <label style={{ marginLeft: '10px' }}>攻撃タイプ：</label>
            <select
              value={teamBStrategy}
              onChange={(e) => setTeamBStrategy(e.target.value as AttackType)}
              disabled={isRunning}
            >
              {attackStrategies.map((strategy) => (
                <option key={strategy.type} value={strategy.type} title={strategy.description}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="battle-controls">
          {!simulation && (
            <button onClick={startSimulation}>シミュレーション開始</button>
          )}
          {simulation && (
            <>
              <button onClick={toggleSimulation}>
                {isRunning ? '一時停止' : '再開'}
              </button>
              <button onClick={resetSimulation}>リセット</button>
            </>
          )}
        </div>

        <div className="status">
          <div>チームA残存数: {survivingCounts.A}</div>
          <div>チームB残存数: {survivingCounts.B}</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={500}
        height={600}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
}

export default App;
