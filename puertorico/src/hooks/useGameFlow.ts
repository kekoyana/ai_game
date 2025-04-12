import { GameState } from '../types/game';
import { calculateFinalScore } from '../utils/scoreCalculator';

type GameFlowReturnType = {
  isRoundEnd: boolean;
  moveToNextPlayer: () => void;
  gameEndState: {
    isGameEnd: boolean;
    reason?: string;
    finalScores?: { [key: string]: number };
  };
};

export const useGameFlow = (
  gameState: GameState,
  setGameState: (state: GameState) => void
): GameFlowReturnType => {
  const isRoundEnd = gameState.availableRoles.every(role => role.used);

  const moveToNextPlayer = (): void => {
    // ラウンド終了時の処理
    if (isRoundEnd) {
      // 新しい状態を作成（スプレッド演算子で完全なコピーを作成）
      const newState = {
        ...gameState,
        // availableRolesだけを更新
        availableRoles: gameState.availableRoles.map(role => ({
          ...role,
          used: false,
          // 使用されなかった役割にドブロンを追加
          money: role.used ? role.money : role.money + 1
        })),
        selectedRole: null,
        currentPlayer: (gameState.currentPlayer + 1) % gameState.players.length
      };

      setGameState(newState);
    } else {
      // 通常の手番移動
      const nextPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
      const nextPlayerIndex = nextPlayer; // 次のプレイヤーのインデックス

      // 次のプレイヤーが現在のプレイヤーと同じ場合（全員が行動済み）
      const allPlayersActed = nextPlayerIndex === gameState.currentPlayer;

      setGameState({
        ...gameState,
        currentPlayer: nextPlayerIndex,
        // 全プレイヤーが行動済みの場合は、選択された役割をリセット
        selectedRole: allPlayersActed ? null : gameState.selectedRole
      });
    }
  };

  const checkGameEnd = (): {
    isGameEnd: boolean;
    reason?: string;
    finalScores?: { [key: string]: number };
  } => {
    let endReason: string | undefined;
    let isGameEnd = false;

    // 勝利点が尽きた場合
    if (gameState.victoryPointsRemaining <= 0) {
      isGameEnd = true;
      endReason = "勝利点が尽きました";
    }
    // 入植者が不足している場合
    else if (gameState.colonistsRemaining <= 0) {
      isGameEnd = true;
      endReason = "入植者が不足しています";
    }
    // 誰かが12区画建設した場合
    else if (gameState.players.some(player => player.buildings.length >= 12)) {
      isGameEnd = true;
      endReason = "12区画の建物が建設されました";
    }

    if (!isGameEnd) {
      return { isGameEnd: false };
    }

    // ゲーム終了時は最終得点を計算
    const finalScores = calculateFinalScore(gameState);

    return {
      isGameEnd: true,
      reason: endReason,
      finalScores
    };
  };

  const gameEndState = checkGameEnd();

  return {
    isRoundEnd,
    moveToNextPlayer,
    gameEndState
  };
};

export default useGameFlow;