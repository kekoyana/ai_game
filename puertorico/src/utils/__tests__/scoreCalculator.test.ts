import { describe, it, expect } from 'vitest';
import { calculateFinalScore } from '../scoreCalculator';
import { type GameState, type Player } from '../../types/game';

describe('calculateFinalScore', () => {
  const createMockGameState = (players: Partial<Player>[]): GameState => ({
    players: players.map(player => ({
      id: 1,
      name: "Player 1",
      money: 0,
      victoryPoints: 0,
      colonists: 0,
      goods: {
        corn: 0,
        indigo: 0,
        sugar: 0,
        tobacco: 0,
        coffee: 0
      },
      plantations: [],
      buildings: [],
      ...player
    })) as Player[],
    currentPlayer: 0,
    phase: "選択待ち",
    victoryPointsRemaining: 0,
    colonistsRemaining: 0,
    colonistsOnShip: 0,
    availablePlantations: [],
    availableRoles: [],
    selectedRole: null,
    ships: [],
    tradeShip: { cargo: null, value: 0 }
  });

  it('正しく基本得点を計算する', () => {
    const gameState = createMockGameState([
      {
        id: 1,
        name: "Player 1",
        victoryPoints: 10,
        colonists: 5,
        buildings: [],
      }
    ]);

    const scores = calculateFinalScore(gameState);
    expect(scores[1]).toBe(10);
  });

  it('ギルドホールのボーナスを正しく計算する', () => {
    const gameState = createMockGameState([
      {
        id: 1,
        name: "Player 1",
        victoryPoints: 10,
        colonists: 5,
        buildings: [
          { type: "guildHall", colonists: 1, maxColonists: 1, victoryPoints: 2 },
          { type: "smallIndigoPlant", colonists: 1, maxColonists: 1, victoryPoints: 1 },
          { type: "sugarMill", colonists: 1, maxColonists: 2, victoryPoints: 2 }
        ],
      }
    ]);

    const scores = calculateFinalScore(gameState);
    // 基本点(10) + ギルドホール(2) + 生産施設ボーナス(2x2=4) + 小規模建物ボーナス(1x1=1) = 17
    expect(scores[1]).toBe(17);
  });

  it('公邸のボーナスを正しく計算する', () => {
    const gameState = createMockGameState([
      {
        id: 1,
        name: "Player 1",
        victoryPoints: 10,
        colonists: 5,
        buildings: [
          { type: "residence", colonists: 1, maxColonists: 1, victoryPoints: 2 },
          { type: "smallIndigoPlant", colonists: 1, maxColonists: 1, victoryPoints: 1 },
          { type: "sugarMill", colonists: 1, maxColonists: 2, victoryPoints: 2 },
          { type: "tobaccoStorage", colonists: 1, maxColonists: 3, victoryPoints: 3 },
          { type: "coffeeRoaster", colonists: 1, maxColonists: 2, victoryPoints: 2 },
          { type: "factory", colonists: 1, maxColonists: 1, victoryPoints: 3 },
          { type: "university", colonists: 1, maxColonists: 1, victoryPoints: 3 },
          { type: "harbor", colonists: 1, maxColonists: 1, victoryPoints: 3 }
        ],
      }
    ]);

    const scores = calculateFinalScore(gameState);
    // 基本点(10) + 公邸(2) + 建物8個ボーナス(2) = 14
    expect(scores[1]).toBe(14);
  });

  it('砦のボーナスを正しく計算する', () => {
    const gameState = createMockGameState([
      {
        id: 1,
        name: "Player 1",
        victoryPoints: 10,
        colonists: 9,
        buildings: [
          { type: "fortress", colonists: 1, maxColonists: 1, victoryPoints: 2 }
        ],
      }
    ]);

    const scores = calculateFinalScore(gameState);
    // 基本点(10) + 砦(2) + 入植者ボーナス(9÷3=3) = 15
    expect(scores[1]).toBe(15);
  });

  it('税関のボーナスを正しく計算する', () => {
    const gameState = createMockGameState([
      {
        id: 1,
        name: "Player 1",
        victoryPoints: 20,
        colonists: 5,
        buildings: [
          { type: "customsHouse", colonists: 1, maxColonists: 1, victoryPoints: 2 }
        ],
      }
    ]);

    const scores = calculateFinalScore(gameState);
    // 基本点(20) + 税関(2) + 勝利点ボーナス(20÷4=5) = 27
    expect(scores[1]).toBe(27);
  });

  it('市役所のボーナスを正しく計算する', () => {
    const gameState = createMockGameState([
      {
        id: 1,
        name: "Player 1",
        victoryPoints: 10,
        colonists: 5,
        buildings: [
          { type: "cityHall", colonists: 1, maxColonists: 1, victoryPoints: 2 },
          { type: "smallIndigoPlant", colonists: 1, maxColonists: 1, victoryPoints: 1 },
          { type: "sugarMill", colonists: 1, maxColonists: 2, victoryPoints: 2 },
          { type: "factory", colonists: 1, maxColonists: 1, victoryPoints: 3 }
        ],
      }
    ]);

    const scores = calculateFinalScore(gameState);
    // 基本点(10) + 市役所(2) + 異なる建物ボーナス(4) = 16
    expect(scores[1]).toBe(16);
  });
});