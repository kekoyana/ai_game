import { GameState, Bullet, Enemy, Obstacle, Gate, Effect, GateChoice } from './types';
import { generateStage } from './stages';

const CANVAS_W = 390;
const CANVAS_H = 700;
const PLAYER_W = 36;
const PLAYER_H = 36;
const BULLET_SPEED = 8;
const SCROLL_SPEED = 2;
const ENEMY_W = 52;
const ENEMY_H = 52;
const BOSS_W = 80;
const BOSS_H = 80;
const GATE_HEIGHT = 50;
const OBSTACLE_W = 160;
const OBSTACLE_H = 30;

// World Y → Screen Y conversion
// Objects with higher worldY are further ahead in the stage.
// They appear from the top and move down as scrollY increases.
function worldToScreen(worldY: number, scrollY: number): number {
  return CANVAS_H - 100 - (worldY - scrollY);
}

export function createInitialState(stage: number): GameState {
  const stageData = generateStage(stage);
  const enemies: Enemy[] = stageData.enemies.map((e) => ({
    x: e.x,
    y: e.y,
    width: e.isBoss ? BOSS_W : ENEMY_W,
    height: e.isBoss ? BOSS_H : ENEMY_H,
    hp: e.hp,
    maxHp: e.hp,
    speed: 0,
    isBoss: !!e.isBoss,
  }));
  const gates: Gate[] = stageData.gates.map((g) => ({
    y: g.y,
    left: g.left,
    right: g.right,
    passed: false,
  }));
  const obstacles: Obstacle[] = stageData.obstacles.map((o) => ({
    x: o.x,
    y: o.y,
    width: OBSTACLE_W,
    height: OBSTACLE_H,
    hp: o.hp,
    maxHp: o.hp,
    side: o.side,
    gateIndex: o.gateIndex,
  }));

  return {
    scene: 'playing',
    player: {
      x: CANVAS_W / 2,
      y: CANVAS_H - 100,
      width: PLAYER_W,
      height: PLAYER_H,
      power: 1,
      fireRate: 10,
      fireCooldown: 0,
    },
    bullets: [],
    enemies,
    gates,
    obstacles,
    scrollY: 0,
    stageLength: stageData.length,
    score: 0,
    stage,
    canvasWidth: CANVAS_W,
    canvasHeight: CANVAS_H,
    effects: [],
  };
}

function applyGateOp(power: number, choice: GateChoice): number {
  switch (choice.op) {
    case '+': return power + choice.value;
    case '-': return Math.max(0, power - choice.value);
    case 'x': return power * choice.value;
    case '÷': return Math.max(1, Math.floor(power / choice.value));
  }
}

function gateLabel(choice: GateChoice): string {
  return `${choice.op}${choice.value}`;
}

export function tick(state: GameState): GameState {
  if (state.scene !== 'playing') return state;

  const s = { ...state };
  const p = { ...s.player };

  // Scroll
  s.scrollY += SCROLL_SPEED;

  // Fire bullets
  p.fireCooldown -= 1;
  const newBullets = [...s.bullets];
  if (p.fireCooldown <= 0) {
    p.fireCooldown = p.fireRate;
    newBullets.push({
      x: p.x,
      y: p.y - p.height / 2,
      speed: BULLET_SPEED,
      damage: p.power,
    });
  }

  // Update bullets (move upward on screen)
  const activeBullets: Bullet[] = [];
  for (const b of newBullets) {
    b.y -= b.speed;
    if (b.y > -10) {
      activeBullets.push(b);
    }
  }

  // Obstacle collision with bullets & player
  const activeObstacles: Obstacle[] = [];
  const newEffects: Effect[] = [...s.effects];

  for (const o of s.obstacles) {
    if (o.hp <= 0) continue;
    const screenY = worldToScreen(o.y, s.scrollY);

    // Remove obstacles that scrolled past (player already passed them)
    if (screenY > CANVAS_H + 300) continue;
    // Keep obstacles not yet visible
    if (screenY < -100) {
      activeObstacles.push(o);
      continue;
    }

    let obs = { ...o };
    const ox = obs.x - obs.width / 2;
    const oy = screenY - obs.height / 2;

    // Bullet-obstacle collision
    for (let i = activeBullets.length - 1; i >= 0; i--) {
      const b = activeBullets[i];
      if (b.x > ox && b.x < ox + obs.width && b.y > oy && b.y < oy + obs.height) {
        obs.hp -= b.damage;
        activeBullets.splice(i, 1);
        if (obs.hp <= 0) {
          newEffects.push({
            x: obs.x,
            y: screenY,
            text: 'BREAK!',
            life: 30,
            maxLife: 30,
            color: '#FF8800',
          });
        }
        break;
      }
    }

    // Player-obstacle collision (block player from passing)
    if (obs.hp > 0) {
      const dx = Math.abs(obs.x - p.x);
      const dy = Math.abs(screenY - p.y);
      if (dx < (obs.width + p.width) / 2 && dy < (obs.height + p.height) / 2) {
        if (obs.side === 'left') {
          p.x = Math.max(CANVAS_W / 2 + p.width / 2, p.x);
        } else {
          p.x = Math.min(CANVAS_W / 2 - p.width / 2, p.x);
        }
      }
    }

    if (obs.hp > 0) {
      activeObstacles.push(obs);
    }
  }

  // Enemy collisions
  const screenEnemies: Enemy[] = [];

  for (const e of s.enemies) {
    const screenY = worldToScreen(e.y, s.scrollY);

    // Enemy scrolled past player (below screen) → penalty for missed enemy
    if (screenY > CANVAS_H + 100) {
      const missed = e.hp;
      p.power = Math.max(0, p.power - missed);
      newEffects.push({
        x: e.x,
        y: CANVAS_H - 40,
        text: `-${missed}`,
        life: 40,
        maxLife: 40,
        color: '#FF2222',
      });
      if (p.power <= 0) {
        s.scene = 'gameover';
      }
      continue;
    }
    // Enemy not yet visible (above/ahead) → keep but skip processing
    if (screenY < -200) {
      screenEnemies.push(e);
      continue;
    }

    let enemy = { ...e };
    // Bullet-enemy collision
    for (let i = activeBullets.length - 1; i >= 0; i--) {
      const b = activeBullets[i];
      const ex = enemy.x - enemy.width / 2;
      const ey = screenY - enemy.height / 2;
      if (
        b.x > ex &&
        b.x < ex + enemy.width &&
        b.y > ey &&
        b.y < ey + enemy.height
      ) {
        enemy.hp -= b.damage;
        activeBullets.splice(i, 1);
        if (enemy.hp <= 0) {
          s.score += enemy.isBoss ? 1000 : 100;
          newEffects.push({
            x: enemy.x,
            y: screenY,
            text: enemy.isBoss ? '+1000' : '+100',
            life: 30,
            maxLife: 30,
            color: '#FFD700',
          });
        }
        break;
      }
    }

    // Enemy-player collision → damage scales with enemy strength
    if (enemy.hp > 0) {
      const dx = Math.abs(enemy.x - p.x);
      const dy = Math.abs(screenY - p.y);
      if (dx < (enemy.width + p.width) / 2 && dy < (enemy.height + p.height) / 2) {
        // Contact damage: lose power proportional to enemy's max HP
        // At least 1, scales up so big enemies really hurt
        const contactDamage = Math.max(1, Math.ceil(p.power * 0.15));
        p.power = Math.max(0, p.power - contactDamage);
        enemy.hp = 0;
        s.score += 50;
        newEffects.push({
          x: p.x,
          y: p.y - 30,
          text: `-${contactDamage}`,
          life: 30,
          maxLife: 30,
          color: '#FF4444',
        });
        if (p.power <= 0) {
          s.scene = 'gameover';
        }
      }
    }

    if (enemy.hp > 0) {
      screenEnemies.push(enemy);
    }
  }

  // Gate collision
  const newGates = s.gates.map((g) => {
    if (g.passed) return g;
    const gateScreenY = worldToScreen(g.y, s.scrollY);
    // Also skip gates that scrolled past
    if (gateScreenY > CANVAS_H + 200) return { ...g, passed: true };
    if (Math.abs(gateScreenY - p.y) < GATE_HEIGHT / 2 + p.height / 2) {
      const isLeft = p.x < CANVAS_W / 2;
      const choice = isLeft ? g.left : g.right;
      const oldPower = p.power;
      p.power = applyGateOp(p.power, choice);
      if (p.power <= 0) {
        s.scene = 'gameover';
      }
      newEffects.push({
        x: p.x,
        y: p.y - 40,
        text: `${gateLabel(choice)} → ${p.power}`,
        life: 45,
        maxLife: 45,
        color: p.power > oldPower ? '#44FF44' : '#FF4444',
      });
      return { ...g, passed: true };
    }
    return g;
  });

  // Check stage clear: scrolled past end and no enemies remain
  if (s.scrollY >= s.stageLength && screenEnemies.length === 0) {
    s.scene = 'clear';
  }

  // Update effects
  const activeEffects: Effect[] = [];
  for (const eff of newEffects) {
    eff.life -= 1;
    if (eff.life > 0) activeEffects.push(eff);
  }

  s.player = p;
  s.bullets = activeBullets;
  s.enemies = screenEnemies;
  s.gates = newGates;
  s.obstacles = activeObstacles;
  s.effects = activeEffects;

  return s;
}

export { CANVAS_W, CANVAS_H, GATE_HEIGHT, OBSTACLE_W, OBSTACLE_H, gateLabel, worldToScreen };
