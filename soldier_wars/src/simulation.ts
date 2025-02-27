import { Soldier, Formation, AttackType } from './types';

export class BattleSimulation {
  private soldiers: Soldier[] = [];
  private nextId = 0;
  private teamAStrategy: AttackType;
  private teamBStrategy: AttackType;
  private readonly MINIMUM_DISTANCE = 4; // 兵士同士の最小距離
  private readonly REPULSION_RANGE = 6; // 反発力が働く範囲

  constructor(formationA: Formation, formationB: Formation, teamAStrategy: AttackType, teamBStrategy: AttackType) {
    this.teamAStrategy = teamAStrategy;
    this.teamBStrategy = teamBStrategy;

    // チームAの初期化（下から上へ）
    formationA.positions.forEach((pos) => {
      this.soldiers.push({
        id: this.nextId++,
        x: pos.x,
        y: pos.y + 100,
        team: 'A',
        hp: 3,
        canMove: true,
      });
    });

    // チームBの初期化（上から下へ）
    formationB.positions.forEach((pos) => {
      this.soldiers.push({
        id: this.nextId++,
        x: pos.x,
        y: pos.y - 50,
        team: 'B',
        hp: 3,
        canMove: true,
      });
    });
  }

  private getDistance(a: Soldier, b: Soldier): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  private getNearestEnemy(soldier: Soldier): Soldier | null {
    const enemies = this.soldiers.filter(
      (s) => s.team !== soldier.team && s.hp > 0
    );
    if (enemies.length === 0) return null;

    return enemies.reduce((nearest, current) => {
      const distanceToCurrent = this.getDistance(soldier, current);
      const distanceToNearest = this.getDistance(soldier, nearest);
      return distanceToCurrent < distanceToNearest ? current : nearest;
    });
  }

  private getSoldierPosition(soldier: Soldier): 'left' | 'center' | 'right' {
    const allies = this.soldiers.filter(
      (s) => s.team === soldier.team && s.hp > 0
    );
    const xPositions = allies.map(a => a.x);
    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);
    const range = maxX - minX;
    const relativeX = soldier.x - minX;

    if (relativeX < range * 0.3) return 'left';
    if (relativeX > range * 0.7) return 'right';
    return 'center';
  }

  private calculateRepulsion(soldier: Soldier): { x: number; y: number } {
    const repulsion = { x: 0, y: 0 };
    const allies = this.soldiers.filter(
      (s) => s.hp > 0 && s.id !== soldier.id
    );

    allies.forEach((ally) => {
      const dx = soldier.x - ally.x;
      const dy = soldier.y - ally.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.REPULSION_RANGE) {
        const force = (this.REPULSION_RANGE - distance) / distance;
        repulsion.x += dx * force * 0.5;
        repulsion.y += dy * force * 0.5;
      }
    });

    return repulsion;
  }

  private applyMovement(soldier: Soldier, dx: number, dy: number, speed: number) {
    const repulsion = this.calculateRepulsion(soldier);
    soldier.x += dx * speed + repulsion.x;
    soldier.y += dy * speed + repulsion.y;
  }

  private moveSoldierNormal(soldier: Soldier, target: Soldier) {
    const dx = target.x - soldier.x;
    const dy = target.y - soldier.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 4) return;

    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    this.applyMovement(soldier, normalizedDx, normalizedDy, 2);
  }

  private moveSoldierSurround(soldier: Soldier, target: Soldier) {
    const dx = target.x - soldier.x;
    const dy = target.y - soldier.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 4) return; // 攻撃範囲内なら移動しない

    const position = this.getSoldierPosition(soldier);
    let targetX: number;
    let targetY: number;
    const behindDistance = 15; // 後方への回り込み距離を短縮

    switch (position) {
      case 'left':
        // 左翼は敵の左後方を目指す
        targetX = target.x - behindDistance;
        targetY = target.y + (soldier.team === 'A' ? -behindDistance : behindDistance);
        break;
      case 'right':
        // 右翼は敵の右後方を目指す
        targetX = target.x + behindDistance;
        targetY = target.y + (soldier.team === 'A' ? -behindDistance : behindDistance);
        break;
      default:
        // 中央部隊は正面から接近
        targetX = target.x;
        targetY = target.y;
    }

    const toDx = targetX - soldier.x;
    const toDy = targetY - soldier.y;
    const toDistance = Math.sqrt(toDx * toDx + toDy * toDy);

    const normalizedDx = toDx / toDistance;
    const normalizedDy = toDy / toDistance;
    
    // 両翼が目標位置に近づいたら攻撃に参加
    const isNearTarget = position !== 'center' && 
      Math.abs(soldier.x - targetX) < 10 && 
      Math.abs(soldier.y - targetY) < 10;

    if (isNearTarget) {
      // 敵に向かって攻撃
      this.applyMovement(soldier, dx / distance, dy / distance, 2);
    } else {
      // 目標位置に向かって移動
      this.applyMovement(soldier, normalizedDx, normalizedDy, 2);
    }
  }

  private moveSoldierBreakthrough(soldier: Soldier, target: Soldier) {
    const dx = target.x - soldier.x;
    const dy = target.y - soldier.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 4) return;

    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    this.applyMovement(soldier, normalizedDx, normalizedDy * 1.5, 3);
  }

  private moveSoldier(soldier: Soldier, target: Soldier) {
    const strategy = soldier.team === 'A' ? this.teamAStrategy : this.teamBStrategy;

    switch (strategy) {
      case 'surround':
        this.moveSoldierSurround(soldier, target);
        break;
      case 'breakthrough':
        this.moveSoldierBreakthrough(soldier, target);
        break;
      case 'normal':
      default:
        this.moveSoldierNormal(soldier, target);
        break;
    }
  }

  private attackSoldier(attacker: Soldier, target: Soldier) {
    target.hp--;
    attacker.canMove = false;
  }

  simulateStep(): boolean {
    // 移動可能なすべての兵士の行動
    this.soldiers.forEach((soldier) => {
      if (soldier.hp <= 0 || !soldier.canMove) return;

      const nearestEnemy = this.getNearestEnemy(soldier);
      if (!nearestEnemy) return;

      const distance = this.getDistance(soldier, nearestEnemy);
      if (distance <= 4) {
        this.attackSoldier(soldier, nearestEnemy);
      } else {
        this.moveSoldier(soldier, nearestEnemy);
      }
    });

    // 次のターンの準備
    this.soldiers.forEach((soldier) => {
      soldier.canMove = true;
    });

    // 戦闘が終了したかチェック
    const teamAAlive = this.soldiers.some((s) => s.team === 'A' && s.hp > 0);
    const teamBAlive = this.soldiers.some((s) => s.team === 'B' && s.hp > 0);

    return teamAAlive && teamBAlive;
  }

  getSoldiers(): Soldier[] {
    return this.soldiers;
  }
}