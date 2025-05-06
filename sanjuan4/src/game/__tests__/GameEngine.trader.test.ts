// GameEngine.trade のテスト
import { GameEngine } from '../GameEngine';
import { BuildingCards } from '../BuildingCards';

describe('GameEngine.trade', () => {
  it('商品がある生産施設を売却すると手札が増え商品が消える', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    // インディゴ染料工場は初期配布済み
    const indigoId = player.buildings.find(id => id.startsWith('indigo'))!;
    // 商品をセット
    player.products[indigoId] = 'productCard';
    const handBefore = [...player.hand];
    const reward = engine.trade(player.id, indigoId);
    expect(Array.isArray(reward)).toBe(true);
    expect(player.hand.length).toBe(handBefore.length + reward!.length);
    expect(player.products[indigoId]).toBe(null);
    expect(engine.state.discard).toContain('productCard');
    expect(engine.state.log[engine.state.log.length-1]).toContain('売却');
  });

  it('商品がない場合は売却できない', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    const indigoId = player.buildings.find(id => id.startsWith('indigo'))!;
    player.products[indigoId] = null;
    const reward = engine.trade(player.id, indigoId);
    expect(reward).toBeNull();
  });

  it('生産施設でないIDでは売却できない', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    // 都市施設IDを仮定
    const cityCard = BuildingCards.find(c => c.category === 'city');
    if (!cityCard) throw new Error('都市施設が見つからない');
    player.buildings.push(cityCard.id);
    player.products[cityCard.id] = 'productCard';
    const reward = engine.trade(player.id, cityCard.id);
    expect(reward).toBeNull();
  });
});