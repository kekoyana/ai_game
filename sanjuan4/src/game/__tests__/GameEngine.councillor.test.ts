// GameEngine.councillor のテスト
import { GameEngine } from '../GameEngine';

describe('GameEngine.councillor', () => {
  it('山札から2枚引き1枚選択して手札に加える', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    // 山札を固定
    engine.state.deck = ['a', 'b', ...engine.state.deck];
    const handBefore = [...player.hand];
    const chosen = engine.councillor(player.id, 1);
    expect(chosen).toBe('b');
    expect(player.hand.length).toBe(handBefore.length + 1);
    expect(player.hand).toContain('b');
    expect(engine.state.discard).toContain('a');
    expect(engine.state.log[engine.state.log.length-1]).toContain('参事会議員');
  });

  it('選択インデックスが不正ならnull', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    engine.state.deck = ['a', 'b', ...engine.state.deck];
    const chosen = engine.councillor(player.id, 2);
    expect(chosen).toBeNull();
  });

  it('山札が2枚未満ならnull', () => {
    const engine = new GameEngine();
    const player = engine.state.players[0];
    engine.state.deck = ['a'];
    const chosen = engine.councillor(player.id, 0);
    expect(chosen).toBeNull();
  });
});