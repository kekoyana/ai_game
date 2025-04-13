// src/test-utils.ts
import { GameState } from './store/gameStore';

export function validateGameState(state: unknown): state is GameState {
  if (!state || typeof state !== 'object') return false;
  const gameState = state as GameState;
  return (
    Array.isArray(gameState.players) &&
    Array.isArray(gameState.deck) &&
    Array.isArray(gameState.discardPile) &&
    Array.isArray(gameState.tradingHouseTiles) &&
    Array.isArray(gameState.currentRoundRoles) &&
    typeof gameState.governorPlayerId === 'string' &&
    typeof gameState.currentPlayerId === 'string' &&
    (!gameState.selectedRole || typeof gameState.selectedRole === 'string')
  );
}

export function assertGameState(state: unknown): asserts state is GameState {
  if (!validateGameState(state)) {
    throw new Error('Invalid game state');
  }
}