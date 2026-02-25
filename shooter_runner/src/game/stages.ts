import { StageData, GateChoice } from './types';

const CANVAS_W = 390;

function gateScore(c: GateChoice): number {
  switch (c.op) {
    case 'x': return c.value * 10;
    case '+': return c.value;
    case '-': return -c.value;
    case '÷': return -c.value * 5;
  }
}

export function generateStage(stageNum: number): StageData {
  const length = 3000 + stageNum * 1000;
  const enemies: StageData['enemies'] = [];
  const gates: StageData['gates'] = [];
  const obstacles: StageData['obstacles'] = [];

  // Place gates every ~400px
  for (let y = 600; y < length - 600; y += 400) {
    // Progress through the stage (0~1)
    const progress = y / length;

    // Early: mostly +N gates. Later: more x and risky ÷/- mixed in
    const goodOps: GateChoice[] = progress < 0.4
      ? [
          { op: '+', value: Math.floor(Math.random() * 3) + 1 },
          { op: '+', value: Math.floor(Math.random() * 5) + 2 },
        ]
      : [
          { op: '+', value: Math.floor(Math.random() * 5) + 1 },
          { op: 'x', value: 2 },
          { op: 'x', value: 3 },
        ];

    const badOps: GateChoice[] = [
      { op: '+', value: 1 },
      { op: '-', value: Math.floor(Math.random() * 3) + 1 },
      { op: '÷', value: 2 },
    ];

    // One side good, one side bad (or mediocre)
    const good = goodOps[Math.floor(Math.random() * goodOps.length)];
    const bad = badOps[Math.floor(Math.random() * badOps.length)];
    const leftIsGood = Math.random() < 0.5;
    const left = leftIsGood ? good : bad;
    const right = leftIsGood ? bad : good;

    const gateIdx = gates.length;
    gates.push({ y, left, right });

    // Place obstacle in front of the better gate
    // Chance increases with progress (40% early → 80% late)
    const obstacleChance = 0.4 + progress * 0.4;
    if (Math.random() < obstacleChance) {
      const leftScore = gateScore(left);
      const rightScore = gateScore(right);
      const betterSide: 'left' | 'right' = leftScore >= rightScore ? 'left' : 'right';
      const halfW = CANVAS_W / 2;
      const obstacleX = betterSide === 'left' ? halfW / 2 : halfW + halfW / 2;
      // Obstacle HP: low early in each stage, scales with progress within stage
      const obstacleHp = Math.floor(3 + progress * progress * (40 + stageNum * 10));
      obstacles.push({
        x: obstacleX,
        y: y - 80,
        hp: obstacleHp,
        side: betterSide,
        gateIndex: gateIdx,
      });
    }
  }

  // First gate Y position — before this, only 1 enemy per row
  const firstGateY = gates.length > 0 ? gates[0].y : 600;

  // Place enemies — HP and count scale with depth
  for (let y = 300; y < length - 400; y += 200) {
    const progress = y / length;
    // Before first gate: 1 enemy only. After: scales with progress
    const count = y < firstGateY
      ? 1
      : 1 + Math.floor(progress * 3) + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      // Before first gate: fixed low HP so power=1 can handle it
      // After: HP scales exponentially with progress
      let hp: number;
      if (y < firstGateY) {
        hp = 3;
      } else {
        const hpBase = 3 + Math.floor(progress * progress * 100) + stageNum * 3;
        hp = hpBase + Math.floor(Math.random() * hpBase * 0.3);
      }
      enemies.push({
        x: 40 + Math.random() * (CANVAS_W - 80),
        y,
        hp,
      });
    }
  }

  // Boss at the end — very high HP
  const bossHp = Math.floor(150 + stageNum * 100);
  enemies.push({
    x: CANVAS_W / 2,
    y: length - 200,
    hp: bossHp,
    isBoss: true,
  });

  return { enemies, gates, obstacles, length };
}
