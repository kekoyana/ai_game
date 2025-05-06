import { GameEngine } from '../GameEngine';

describe('金鉱掘りの特権仕様', () => {
  it('金鉱掘りを選んだプレイヤーのみカードを獲得する', () => {
    const engine = new GameEngine();
    const player0 = engine.state.players[0];
    const handCountBefore = player0.hand.length;

    // 人間プレイヤー（id:0）が金鉱掘りを選択
    engine.chooseRole('prospector');
    const handCountAfter = player0.hand.length;

    // 自分だけカードが1枚増えている
    expect(handCountAfter).toBe(handCountBefore + 1);

    // CPU1, CPU2, CPU3の手札は変化しない
    for (let i = 1; i < 4; i++) {
      const cpu = engine.state.players[i];
      expect(cpu.hand.length).toBe(4);
    }
  });

  it('CPUが金鉱掘りを選んだ場合、そのCPUのみカードを獲得する', () => {
    const engine = new GameEngine();
    // 人間が適当な役割を選んで手番を進める
    engine.chooseRole('builder');

    // ログから「CPU?が金鉱掘りを選択」を探す
    const log = engine.state.log;
    const cpuProspectorLog = log.find(l => l.match(/CPU\d+が金鉱掘りを選択/));
    expect(cpuProspectorLog).toBeTruthy();

    // どのCPUが金鉱掘りを選んだか特定
    const cpuMatch = cpuProspectorLog!.match(/(CPU\d+)が金鉱掘りを選択/);
    expect(cpuMatch).toBeTruthy();
    const cpuName = cpuMatch![1];
    const cpuIdx = engine.state.players.findIndex(p => p.name === cpuName);

    // そのCPUだけ手札が1枚増えている
    for (let i = 0; i < 4; i++) {
      const player = engine.state.players[i];
      if (i === cpuIdx) {
        expect(player.hand.length).toBe(5);
      } else {
        expect(player.hand.length).toBe(4);
      }
    }
  });
});