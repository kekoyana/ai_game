import { GameState, RoleType } from "../types";
import { initializeGame } from "./gameInitialization";
import { 
  selectRole, 
  advanceToNextPlayer, 
  hasAvailableRoles, 
  allPlayersHavePassed,
  setPlayerPassed,
  resetPlayerPassStatus,
  endRound,
  RoleSelection
} from "./roleSelection";
import { handleCouncillorPhase, CardSelectionStrategy } from "./phases/councillorPhase";
import { BuildingSelection, handleBuilderPhase } from "./phases/builderPhase";

/**
 * ゲーム状態の変更イベントリスナー
 */
export type GameStateChangeListener = (gameState: GameState) => void;

/**
 * サンファンゲームの全体的な流れを管理するクラス
 */
export class GameManager {
  private gameState: GameState | null = null;
  private listeners: GameStateChangeListener[] = [];
  
  /**
   * ゲームを初期化する
   * @param playerNames プレイヤー名の配列
   */
  public initializeGame(playerNames: string[]): void {
    this.gameState = initializeGame(playerNames);
    
    // ゲーム状態を初期化後、役割選択フェーズに設定
    if (this.gameState) {
      this.gameState = {
        ...this.gameState,
        currentPhase: "役割選択中"
      };
    }
    
    this.notifyListeners();
  }
  
  /**
   * 現在のゲーム状態を取得する
   * @returns 現在のゲーム状態
   */
  public getGameState(): GameState | null {
    return this.gameState;
  }
  
  /**
   * ゲーム状態変更リスナーを追加する
   * @param listener リスナー関数
   */
  public addChangeListener(listener: GameStateChangeListener): void {
    this.listeners.push(listener);
  }
  
  /**
   * ゲーム状態変更リスナーを削除する
   * @param listener 削除するリスナー関数
   */
  public removeChangeListener(listener: GameStateChangeListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  /**
   * 全てのリスナーに変更を通知する
   */
  private notifyListeners(): void {
    if (this.gameState) {
      this.listeners.forEach(listener => listener(this.gameState!));
    }
  }
  
  /**
   * プレイヤーが役割を選択する
   * @param playerIndex プレイヤーのインデックス
   * @param role 選択する役割（nullの場合はパス）
   */
  public selectRole(playerIndex: number, role: RoleType | null): void {
    if (!this.gameState) return;
    
    // 現在のプレイヤーの手番でない場合は何もしない
    if (this.gameState.currentTurnPlayerIndex !== playerIndex) {
      console.error(`プレイヤー${playerIndex + 1}の手番ではありません`);
      return;
    }
    
    // プレイヤーがパスした場合
    if (role === null) {
      // パス状態を設定
      this.gameState = setPlayerPassed(this.gameState, playerIndex);
      
      // 次のプレイヤーに手番を移す
      const { updatedGameState, nextPlayerIndex } = advanceToNextPlayer(this.gameState);
      this.gameState = updatedGameState;
      
      // 全員がパスした場合はラウンド終了
      if (allPlayersHavePassed(this.gameState)) {
        this.endRound();
      }
      
      this.notifyListeners();
      return;
    }
    
    // 役割選択の処理
    const selection: RoleSelection = { playerIndex, role };
    const updatedState = selectRole(this.gameState, selection);
    
    // 選択が有効だった場合（ゲーム状態が更新された場合）
    if (updatedState.selectedRole === role) {
      this.gameState = updatedState;
      
      // 選択された役割に応じたフェーズを実行
      this.executeRolePhase();
      
      // 利用可能な役割がまだあり、全員がパスしていない場合、次のプレイヤーに手番を移す
      if (hasAvailableRoles(this.gameState.roleCards) && !allPlayersHavePassed(this.gameState)) {
        const { updatedGameState, nextPlayerIndex } = advanceToNextPlayer(this.gameState);
        this.gameState = updatedGameState;
      } else {
        // そうでなければラウンド終了
        this.endRound();
      }
    }
    
    this.notifyListeners();
  }
  
  /**
   * 選択された役割に対応するフェーズを実行する
   */
  private executeRolePhase(): void {
    if (!this.gameState || !this.gameState.selectedRole) return;
    
    const rolePlayerIndex = this.gameState.currentRolePlayerIndex;
    
    // 選択された役割に基づいて対応するフェーズを実行
    switch (this.gameState.selectedRole) {
      case RoleType.COUNCILLOR:
        this.executeCouncillorPhase(rolePlayerIndex);
        break;
      case RoleType.BUILDER:
        this.executeBuilderPhase(rolePlayerIndex);
        break;
      // 他の役割も同様に実装
      case RoleType.PRODUCER:
        // producerフェーズの実装
        break;
      case RoleType.TRADER:
        // traderフェーズの実装
        break;
      case RoleType.PROSPECTOR:
        // prospectorフェーズの実装
        break;
      default:
        console.log(`役割「${this.gameState.selectedRole}」のフェーズ実装はまだありません`);
        // フェーズが実装されていない場合は何もせず次に進む
        this.gameState = {
          ...this.gameState,
          currentPhase: `${this.gameState.selectedRole}フェーズ完了`
        };
    }
  }
  
  /**
   * 参事フェーズを実行する
   * @param rolePlayerIndex 役割を選んだプレイヤーのインデックス
   */
  private executeCouncillorPhase(rolePlayerIndex: number): void {
    if (!this.gameState) return;
    
    // 参事フェーズを実行
    const updatedState = handleCouncillorPhase(
      this.gameState,
      rolePlayerIndex,
      CardSelectionStrategy.HIGHEST_COST // 戦略はUIから指定可能に拡張予定
    );
    
    this.gameState = updatedState;
  }
  
  /**
   * 建築家フェーズを実行する
   * @param rolePlayerIndex 役割を選んだプレイヤーのインデックス
   */
  private executeBuilderPhase(rolePlayerIndex: number): void {
    if (!this.gameState) return;
    
    // 現在は簡易的なビルダー選択を自動生成
    // 実際のアプリではUIからプレイヤーの選択を取得
    const buildingSelections: (BuildingSelection | null)[] = this.gameState.players.map((player, index) => {
      // 手札に建物カードがあるかを確認
      const buildingCard = player.hand.find(card => 
        card.type === "building" || card.type === "production" || card.type === "violet"
      );
      
      // 建物カードがあれば、それを建設する選択を返す
      if (buildingCard) {
        // 支払いに使用するカードを選択（簡略化のため最初のn枚を選択）
        const isBuilder = index === rolePlayerIndex;
        const cost = isBuilder ? buildingCard.cost : Math.max(0, buildingCard.cost - 1);
        const paymentIndices = Array.from({ length: Math.min(cost, player.hand.length - 1) }, (_, i) => i);
        
        return {
          cardId: buildingCard.id,
          paymentCardIndices: paymentIndices,
          fromProvinceRow: false // 手札から建設
        };
      }
      
      // 建物カードがなければnullを返す（建設しない）
      return null;
    });
    
    // 建築家フェーズを実行
    const result = handleBuilderPhase(
      this.gameState,
      rolePlayerIndex,
      buildingSelections
    );
    
    this.gameState = result.newGameState;
  }
  
  /**
   * ラウンドを終了し、次のラウンドを準備する
   */
  private endRound(): void {
    if (!this.gameState) return;
    
    // ラウンド終了処理
    const nextRoundState = endRound(this.gameState);
    
    // プレイヤーのパス状態をリセット
    this.gameState = resetPlayerPassStatus(nextRoundState);
    
    // 次のラウンドの開始プレイヤーを設定（新しい総督）
    const governorIndex = this.gameState.players.findIndex(p => p.isGovernor);
    this.gameState = {
      ...this.gameState,
      currentTurnPlayerIndex: governorIndex,
      currentPhase: "役割選択中"
    };
    
    // ゲーム終了条件のチェック
    this.checkGameEndCondition();
  }
  
  /**
   * ゲーム終了条件をチェックする
   */
  private checkGameEndCondition(): void {
    if (!this.gameState) return;
    
    // 12枚以上の建物を持つプレイヤーがいる場合、ゲーム終了
    const maxBuildingsPlayer = this.gameState.players.find(player => player.buildings.length >= 12);
    if (maxBuildingsPlayer) {
      this.gameState = {
        ...this.gameState,
        isGameOver: true,
        currentPhase: "ゲーム終了"
      };
    }
  }
} 