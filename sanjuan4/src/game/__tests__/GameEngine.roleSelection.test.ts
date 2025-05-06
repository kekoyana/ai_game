import { GameEngine } from '../GameEngine';

describe('役割選択の自動進行', () => {
  it('人間が役割を選んだ後、CPUが自動で役割を選ぶ', () => {
    const engine = new GameEngine();
    // 人間プレイヤー（id:0）が金鉱掘りを選択
    const result = engine.chooseRole('prospector');
    expect(result).toBe(true);

    // ログに「CPU1が...を選択」などが含まれているか確認
    const cpuLogs = engine.state.log.filter(log => log.includes('CPU'));
    expect(cpuLogs.length).toBeGreaterThan(0);

    // availableRolesが減っていること
    expect(engine.state.availableRoles.length).toBeLessThan(5);

    // 全員分の役割選択が終わればavailableRolesが0になる
    if (engine.state.availableRoles.length === 0) {
      expect(engine.state.round).toBe(2);
    }
  });
});