// GameEngine.produce のテスト
import { GameEngine } from '../GameEngine';
import { BuildingCards } from '../BuildingCards';

describe('GameEngine.produce', () => {
  it('生産施設があれば商品を生産できる', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    // インディゴ染料工場は初期配布済み
    const indigoId = player.buildings.find(id => id.startsWith('indigo'))!;
    // 商品がない状態
    player.products[indigoId] = null;
    const deckTop = engine.state.deck[0];
    const result = engine.produce(player.id);
    expect(result).toBe(true);
    expect(player.products[indigoId]).toBe(deckTop);
    expect(engine.state.log[engine.state.log.length-1]).toContain('商品を生産');
  });

  it('既に商品がある場合は生産しない', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    const indigoId = player.buildings.find(id => id.startsWith('indigo'))!;
    player.products[indigoId] = 'dummy';
    const result = engine.produce(player.id);
    expect(result).toBe(false);
  });

  it('生産施設がない場合は生産できない', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    player.buildings = [];
    const result = engine.produce(player.id);
    expect(result).toBe(false);
  });
});