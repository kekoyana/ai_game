// GameEngine.buildBuilding のテスト
import { GameEngine } from '../GameEngine';
import { BuildingCards } from '../BuildingCards';

describe('GameEngine.buildBuilding', () => {
  it('手札からコスト分支払い建物を建設できる', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    // 手札にコスト1の建物がある前提
    const smithy = BuildingCards.find(c => c.name === '鍛冶屋');
    if (!smithy) throw new Error('鍛冶屋が見つからない');
    // 手札を強制セット
    player.hand = ['x1', 'x2', 'x3', 'x4', 'x5'];
    // 建設
    const result = engine.buildBuilding(player.id, smithy.id, ['x1']);
    expect(result).toBe(true);
    expect(player.buildings).toContain(smithy.id);
    expect(player.hand).not.toContain('x1');
    expect(engine.state.discard).toContain('x1');
    expect(engine.state.log[engine.state.log.length-1]).toContain('鍛冶屋を建設');
  });

  it('コスト未満の支払いでは建設できない', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    const smithy = BuildingCards.find(c => c.name === '鍛冶屋');
    if (!smithy) throw new Error('鍛冶屋が見つからない');
    player.hand = ['a', 'b'];
    const result = engine.buildBuilding(player.id, smithy.id, []);
    expect(result).toBe(false);
    expect(player.buildings).not.toContain(smithy.id);
  });

  it('手札にないカードで支払うと建設できない', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    const smithy = BuildingCards.find(c => c.name === '鍛冶屋');
    if (!smithy) throw new Error('鍛冶屋が見つからない');
    player.hand = ['a', 'b'];
    const result = engine.buildBuilding(player.id, smithy.id, ['x']);
    expect(result).toBe(false);
    expect(player.buildings).not.toContain(smithy.id);
  });

  it('既に建設済みの建物は再建設できない', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    const smithy = BuildingCards.find(c => c.name === '鍛冶屋');
    if (!smithy) throw new Error('鍛冶屋が見つからない');
    player.hand = ['a', 'b', 'c'];
    player.buildings.push(smithy.id);
    const result = engine.buildBuilding(player.id, smithy.id, ['a']);
    expect(result).toBe(false);
  });
});