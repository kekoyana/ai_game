import { GameState, GateChoice } from './types';
import { CANVAS_W, CANVAS_H, GATE_HEIGHT, OBSTACLE_H, gateLabel, worldToScreen } from './engine';

// Seeded pseudo-random for deterministic decorations
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Background ───

function renderBackground(ctx: CanvasRenderingContext2D, scrollY: number) {
  // Dark dungeon gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#0a0a1a');
  grad.addColorStop(0.5, '#101028');
  grad.addColorStop(1, '#0d0d20');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Stone floor tiles
  const tileSize = 50;
  const offY = scrollY % tileSize;
  ctx.strokeStyle = 'rgba(60, 50, 80, 0.3)';
  ctx.lineWidth = 1;
  for (let y = -offY; y < CANVAS_H + tileSize; y += tileSize) {
    for (let x = 0; x < CANVAS_W; x += tileSize) {
      const shift = (Math.floor((y + offY) / tileSize) % 2) * (tileSize / 2);
      ctx.strokeRect(x + shift, y, tileSize, tileSize);
    }
  }

  // Dungeon walls on left/right edges
  const wallW = 18;
  const wallGrad = ctx.createLinearGradient(0, 0, wallW, 0);
  wallGrad.addColorStop(0, '#2a1f3a');
  wallGrad.addColorStop(1, 'rgba(42, 31, 58, 0)');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, wallW, CANVAS_H);
  const wallGradR = ctx.createLinearGradient(CANVAS_W, 0, CANVAS_W - wallW, 0);
  wallGradR.addColorStop(0, '#2a1f3a');
  wallGradR.addColorStop(1, 'rgba(42, 31, 58, 0)');
  ctx.fillStyle = wallGradR;
  ctx.fillRect(CANVAS_W - wallW, 0, wallW, CANVAS_H);

  // Floating particles (magic dust)
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 20; i++) {
    const px = seededRandom(i * 3) * CANVAS_W;
    const py = (seededRandom(i * 7) * CANVAS_H + scrollY * (0.3 + seededRandom(i) * 0.4)) % CANVAS_H;
    const size = 1 + seededRandom(i * 11) * 2;
    const hue = 200 + seededRandom(i * 13) * 80;
    ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.6)`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Gates (Magic Portals) ───

function isGoodGate(c: GateChoice): boolean {
  return c.op === '+' || c.op === 'x';
}

function renderGate(ctx: CanvasRenderingContext2D, x: number, w: number, y: number, choice: GateChoice, time: number) {
  const good = isGoodGate(choice);
  const hue = good ? 130 : 0;
  const pulse = Math.sin(time * 0.05) * 0.15 + 0.85;

  // Portal glow
  ctx.globalAlpha = 0.3 * pulse;
  const glow = ctx.createLinearGradient(x, y - GATE_HEIGHT / 2, x, y + GATE_HEIGHT / 2);
  glow.addColorStop(0, `hsla(${hue}, 80%, 50%, 0)`);
  glow.addColorStop(0.5, `hsla(${hue}, 80%, 50%, 0.5)`);
  glow.addColorStop(1, `hsla(${hue}, 80%, 50%, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(x, y - GATE_HEIGHT / 2 - 5, w, GATE_HEIGHT + 10);
  ctx.globalAlpha = 1;

  // Portal body
  const bodyGrad = ctx.createLinearGradient(x, y - GATE_HEIGHT / 2, x, y + GATE_HEIGHT / 2);
  bodyGrad.addColorStop(0, `hsla(${hue}, 60%, 20%, 0.9)`);
  bodyGrad.addColorStop(0.5, `hsla(${hue}, 70%, 30%, 0.95)`);
  bodyGrad.addColorStop(1, `hsla(${hue}, 60%, 20%, 0.9)`);
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(x, y - GATE_HEIGHT / 2, w, GATE_HEIGHT);

  // Border runes
  ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.6 * pulse})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y - GATE_HEIGHT / 2 + 1, w - 2, GATE_HEIGHT - 2);

  // Small rune decorations on border
  const runeAlpha = 0.5 + Math.sin(time * 0.08) * 0.3;
  ctx.globalAlpha = runeAlpha;
  ctx.fillStyle = `hsla(${hue}, 90%, 70%, 0.8)`;
  ctx.font = '10px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const runes = good ? '\u2726 \u2727 \u2726' : '\u2720 \u2606 \u2720';
  ctx.fillText(runes, x + w / 2, y - GATE_HEIGHT / 2 + 8);
  ctx.globalAlpha = 1;

  // Label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.8)`;
  ctx.shadowBlur = 10;
  ctx.fillText(gateLabel(choice), x + w / 2, y);
  ctx.shadowBlur = 0;
}

// ─── Obstacles (Crystal Barriers) ───

function renderObstacle(ctx: CanvasRenderingContext2D, ox: number, oy: number, w: number, h: number, hpRatio: number, time: number) {
  const centerX = ox + w / 2;
  const centerY = oy + h / 2;

  // Crystal glow
  ctx.globalAlpha = 0.3;
  ctx.shadowColor = '#aa44ff';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#6622aa';
  ctx.fillRect(ox - 2, oy - 2, w + 4, h + 4);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Crystal body with gradient
  const crystalGrad = ctx.createLinearGradient(ox, oy, ox, oy + h);
  crystalGrad.addColorStop(0, '#7733bb');
  crystalGrad.addColorStop(0.3, '#5522aa');
  crystalGrad.addColorStop(0.7, '#6633cc');
  crystalGrad.addColorStop(1, '#4411aa');
  ctx.fillStyle = crystalGrad;
  ctx.fillRect(ox, oy, w, h);

  // Crystal facets
  ctx.strokeStyle = 'rgba(180, 140, 255, 0.4)';
  ctx.lineWidth = 1;
  for (let fx = ox + 25; fx < ox + w; fx += 30) {
    ctx.beginPath();
    ctx.moveTo(fx, oy);
    ctx.lineTo(fx - 10, oy + h);
    ctx.stroke();
  }

  // Shimmer
  const shimmerX = ox + ((time * 2) % (w + 40)) - 20;
  ctx.globalAlpha = 0.25;
  const shimmer = ctx.createLinearGradient(shimmerX - 10, 0, shimmerX + 10, 0);
  shimmer.addColorStop(0, 'rgba(255,255,255,0)');
  shimmer.addColorStop(0.5, 'rgba(255,255,255,0.6)');
  shimmer.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(ox, oy, w, h);
  ctx.globalAlpha = 1;

  // Crack overlay when damaged
  if (hpRatio < 0.7) {
    ctx.strokeStyle = `rgba(200, 150, 255, ${0.8 - hpRatio})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, oy);
    ctx.lineTo(centerX + 5, centerY);
    ctx.lineTo(centerX - 5, oy + h);
    ctx.stroke();
    if (hpRatio < 0.35) {
      ctx.beginPath();
      ctx.moveTo(centerX + 5, centerY);
      ctx.lineTo(centerX + 20, oy + 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + 5, centerY);
      ctx.lineTo(centerX - 20, oy + h - 3);
      ctx.stroke();
    }
  }

  // HP bar
  const barW = w;
  const barH = 5;
  const barY = oy - 10;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(ox, barY, barW, barH);
  ctx.fillStyle = '#bb66ff';
  ctx.fillRect(ox, barY, barW * hpRatio, barH);
  ctx.strokeStyle = '#8844cc';
  ctx.lineWidth = 1;
  ctx.strokeRect(ox, barY, barW, barH);
}

// ─── Enemies ───

function renderSlime(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, hpRatio: number, time: number) {
  const bounce = Math.sin(time * 0.1 + x) * 3;
  const cy = y + bounce;

  // Shadow
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x, y + h * 0.4, w * 0.4, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Slime body
  const bodyGrad = ctx.createRadialGradient(x - w * 0.1, cy - h * 0.15, w * 0.05, x, cy, w * 0.5);
  bodyGrad.addColorStop(0, '#66ee66');
  bodyGrad.addColorStop(0.4, '#33aa33');
  bodyGrad.addColorStop(1, '#116611');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.45, cy + h * 0.3);
  ctx.quadraticCurveTo(x - w * 0.5, cy - h * 0.2, x, cy - h * 0.45);
  ctx.quadraticCurveTo(x + w * 0.5, cy - h * 0.2, x + w * 0.45, cy + h * 0.3);
  ctx.quadraticCurveTo(x, cy + h * 0.35, x - w * 0.45, cy + h * 0.3);
  ctx.fill();

  // Highlight
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#aaffaa';
  ctx.beginPath();
  ctx.ellipse(x - w * 0.12, cy - h * 0.2, w * 0.12, h * 0.1, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(x - w * 0.15, cy - h * 0.08, w * 0.09, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + w * 0.15, cy - h * 0.08, w * 0.09, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(x - w * 0.13, cy - h * 0.05, w * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.17, cy - h * 0.05, w * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // HP bar
  renderHpBar(ctx, x, y - h * 0.55, w + 10, hpRatio, '#44ff44');
}

function renderBoss(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, hpRatio: number, time: number) {
  const pulse = Math.sin(time * 0.06) * 2;

  // Aura
  ctx.globalAlpha = 0.15 + Math.sin(time * 0.04) * 0.05;
  const aura = ctx.createRadialGradient(x, y, w * 0.2, x, y, w * 0.9);
  aura.addColorStop(0, 'rgba(255, 50, 50, 0.4)');
  aura.addColorStop(1, 'rgba(255, 50, 50, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(x, y, w * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Shadow
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x, y + h * 0.45, w * 0.5, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Dragon body
  const bodyGrad = ctx.createRadialGradient(x, y - h * 0.1, w * 0.05, x, y, w * 0.5);
  bodyGrad.addColorStop(0, '#ff4444');
  bodyGrad.addColorStop(0.5, '#cc1111');
  bodyGrad.addColorStop(1, '#660000');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - h * 0.5 + pulse);
  ctx.quadraticCurveTo(x + w * 0.55, y - h * 0.15, x + w * 0.45, y + h * 0.35);
  ctx.quadraticCurveTo(x, y + h * 0.45, x - w * 0.45, y + h * 0.35);
  ctx.quadraticCurveTo(x - w * 0.55, y - h * 0.15, x, y - h * 0.5 + pulse);
  ctx.fill();

  // Wings
  ctx.fillStyle = '#991111';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.25, y - h * 0.1);
  ctx.quadraticCurveTo(x - w * 0.7, y - h * 0.5 + pulse, x - w * 0.6, y + h * 0.1);
  ctx.lineTo(x - w * 0.25, y + h * 0.1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.25, y - h * 0.1);
  ctx.quadraticCurveTo(x + w * 0.7, y - h * 0.5 + pulse, x + w * 0.6, y + h * 0.1);
  ctx.lineTo(x + w * 0.25, y + h * 0.1);
  ctx.fill();

  // Horns
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.15, y - h * 0.35);
  ctx.lineTo(x - w * 0.25, y - h * 0.6 + pulse);
  ctx.lineTo(x - w * 0.05, y - h * 0.25);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.15, y - h * 0.35);
  ctx.lineTo(x + w * 0.25, y - h * 0.6 + pulse);
  ctx.lineTo(x + w * 0.05, y - h * 0.25);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#FFFF00';
  ctx.shadowColor = '#FFFF00';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.ellipse(x - w * 0.13, y - h * 0.1, w * 0.07, h * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + w * 0.13, y - h * 0.1, w * 0.07, h * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // HP bar (wider, red themed)
  renderHpBar(ctx, x, y - h * 0.65, w * 1.2, hpRatio, '#ff3333');
}

function renderHpBar(ctx: CanvasRenderingContext2D, cx: number, y: number, w: number, ratio: number, color: string) {
  const barH = 7;
  const x = cx - w / 2;
  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x - 1, y - 1, w + 2, barH + 2);
  // Fill
  const grad = ctx.createLinearGradient(x, y, x + w * ratio, y);
  grad.addColorStop(0, color);
  grad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w * ratio, barH);
  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, barH);
  // HP text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
}

// ─── Player (Wizard) ───

function renderPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, _h: number, power: number, time: number) {
  // Magic circle under feet
  ctx.globalAlpha = 0.3 + Math.sin(time * 0.08) * 0.1;
  ctx.strokeStyle = '#66aaff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y + w * 0.35, w * 0.5, w * 0.15, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Robe body
  const robeGrad = ctx.createLinearGradient(x, y - w * 0.5, x, y + w * 0.4);
  robeGrad.addColorStop(0, '#2244aa');
  robeGrad.addColorStop(0.6, '#1a2e7a');
  robeGrad.addColorStop(1, '#0f1a55');
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - w * 0.45);
  ctx.quadraticCurveTo(x + w * 0.35, y - w * 0.1, x + w * 0.3, y + w * 0.4);
  ctx.lineTo(x - w * 0.3, y + w * 0.4);
  ctx.quadraticCurveTo(x - w * 0.35, y - w * 0.1, x, y - w * 0.45);
  ctx.fill();

  // Hat
  ctx.fillStyle = '#1a2266';
  ctx.beginPath();
  ctx.moveTo(x, y - w * 0.85);
  ctx.lineTo(x + w * 0.3, y - w * 0.35);
  ctx.lineTo(x - w * 0.3, y - w * 0.35);
  ctx.closePath();
  ctx.fill();
  // Hat brim
  ctx.fillStyle = '#2244aa';
  ctx.beginPath();
  ctx.ellipse(x, y - w * 0.35, w * 0.35, w * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hat star
  ctx.fillStyle = '#ffdd44';
  ctx.font = `${Math.floor(w * 0.25)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('\u2605', x, y - w * 0.55);

  // Staff (points upward)
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.2, y + w * 0.3);
  ctx.lineTo(x + w * 0.15, y - w * 0.6);
  ctx.stroke();
  // Crystal on staff
  ctx.fillStyle = '#44ddff';
  ctx.shadowColor = '#44ddff';
  ctx.shadowBlur = 10 + Math.sin(time * 0.1) * 4;
  ctx.beginPath();
  ctx.arc(x + w * 0.15, y - w * 0.65, w * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Power number (glowing)
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = '#4488ff';
  ctx.shadowBlur = 12;
  ctx.font = `bold ${Math.min(20, 14 + Math.floor(Math.log10(Math.max(1, power)) * 3))}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${power}`, x, y + w * 0.55);
  ctx.shadowBlur = 0;
}

// ─── Bullets (Magic Bolts) ───

function renderBullet(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, idx: number) {
  // Trail
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#66aaff';
  ctx.beginPath();
  ctx.moveTo(x - 3, y + 10);
  ctx.lineTo(x + 3, y + 10);
  ctx.lineTo(x, y);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Core
  const glow = ctx.createRadialGradient(x, y, 0, x, y, 6);
  glow.addColorStop(0, '#FFFFFF');
  glow.addColorStop(0.4, '#88ccff');
  glow.addColorStop(1, 'rgba(68, 136, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Sparkle
  ctx.globalAlpha = 0.5 + Math.sin(time * 0.3 + idx) * 0.3;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── Effects ───

function renderEffects(ctx: CanvasRenderingContext2D, effects: GameState['effects']) {
  for (const eff of effects) {
    const alpha = eff.life / eff.maxLife;
    const floatY = eff.y - (1 - alpha) * 40;
    const scale = 0.8 + alpha * 0.4;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = eff.color;
    ctx.shadowColor = eff.color;
    ctx.shadowBlur = 8;
    ctx.font = `bold ${Math.floor(20 * scale)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(eff.text, eff.x, floatY);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

// ─── HUD ───

function renderHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const { player, scrollY } = state;

  // HUD background (parchment style)
  const hudGrad = ctx.createLinearGradient(0, 0, 0, 48);
  hudGrad.addColorStop(0, 'rgba(30, 20, 10, 0.85)');
  hudGrad.addColorStop(1, 'rgba(30, 20, 10, 0.6)');
  ctx.fillStyle = hudGrad;
  ctx.fillRect(0, 0, CANVAS_W, 48);
  // Gold border
  ctx.strokeStyle = 'rgba(200, 170, 100, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 48);
  ctx.lineTo(CANVAS_W, 48);
  ctx.stroke();

  // Stage
  ctx.fillStyle = '#d4a862';
  ctx.font = 'bold 14px serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Stage ${state.stage}`, 10, 16);

  // Power with icon
  ctx.textAlign = 'center';
  ctx.fillStyle = '#88bbff';
  ctx.fillText(`\u2726 ${player.power}`, CANVAS_W / 2, 16);

  // Score
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffdd66';
  ctx.fillText(`${state.score}`, CANVAS_W - 10, 16);

  // Progress bar (ornate)
  const progress = Math.min(1, scrollY / state.stageLength);
  const barY = 32;
  const barH = 8;
  const barPad = 10;
  const barW = CANVAS_W - barPad * 2;
  // Track
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(barPad, barY, barW, barH);
  // Fill
  const progGrad = ctx.createLinearGradient(barPad, 0, barPad + barW, 0);
  progGrad.addColorStop(0, '#33aa55');
  progGrad.addColorStop(1, '#88ff88');
  ctx.fillStyle = progGrad;
  ctx.fillRect(barPad, barY, barW * progress, barH);
  // Border
  ctx.strokeStyle = 'rgba(200, 170, 100, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(barPad, barY, barW, barH);
  // Progress marker
  const markerX = barPad + barW * progress;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(markerX, barY + barH / 2, 4, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Overlays ───

export function renderOverlay(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = 'rgba(5, 5, 15, 0.8)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const time = Date.now() * 0.001;

  if (state.scene === 'title') {
    // Magical circle background
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#6688cc';
    ctx.lineWidth = 2;
    for (let r = 50; r < 200; r += 40) {
      ctx.beginPath();
      ctx.arc(cx, cy - 20, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Title
    ctx.fillStyle = '#d4a862';
    ctx.shadowColor = '#ffaa22';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 38px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ARCANE', cx, cy - 60);
    ctx.fillText('RUNNER', cx, cy - 18);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = '#8899aa';
    ctx.font = '14px serif';
    ctx.fillText('~ A Wizard\'s Journey ~', cx, cy + 20);

    // Start prompt (pulsing)
    ctx.globalAlpha = 0.6 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = '#ccddee';
    ctx.font = '18px serif';
    ctx.fillText('TAP TO BEGIN', cx, cy + 70);
    ctx.globalAlpha = 1;

  } else if (state.scene === 'gameover') {
    // Red vignette
    ctx.globalAlpha = 0.2;
    const vignette = ctx.createRadialGradient(cx, cy, 50, cx, cy, 350);
    vignette.addColorStop(0, 'rgba(255,0,0,0)');
    vignette.addColorStop(1, 'rgba(255,0,0,0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DEFEATED', cx, cy - 40);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#cccccc';
    ctx.font = '20px serif';
    ctx.fillText(`Score: ${state.score}`, cx, cy + 15);

    ctx.globalAlpha = 0.6 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = '#999';
    ctx.font = '16px serif';
    ctx.fillText('TAP TO RETRY', cx, cy + 55);
    ctx.globalAlpha = 1;

  } else if (state.scene === 'clear') {
    // Golden particles
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 30; i++) {
      const px = seededRandom(i * 3) * CANVAS_W;
      const py = (seededRandom(i * 7) * CANVAS_H + time * 40 * (1 + seededRandom(i))) % CANVAS_H;
      ctx.fillStyle = `hsla(${40 + seededRandom(i) * 20}, 90%, 60%, 0.7)`;
      ctx.beginPath();
      ctx.arc(px, py, 2 + seededRandom(i * 11) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#ffdd44';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 34px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VICTORY!', cx, cy - 40);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#cccccc';
    ctx.font = '20px serif';
    ctx.fillText(`Score: ${state.score}`, cx, cy + 15);

    ctx.globalAlpha = 0.6 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = '#d4a862';
    ctx.font = '16px serif';
    ctx.fillText('TAP FOR NEXT STAGE', cx, cy + 55);
    ctx.globalAlpha = 1;
  }
}

// ─── Main Render ───

let frameCount = 0;

export function render(ctx: CanvasRenderingContext2D, state: GameState) {
  frameCount++;
  const { player, bullets, enemies, gates, obstacles, scrollY, effects } = state;

  renderBackground(ctx, scrollY);

  // Gates
  for (const g of gates) {
    if (g.passed) continue;
    const gy = worldToScreen(g.y, scrollY);
    if (gy < -GATE_HEIGHT || gy > CANVAS_H + GATE_HEIGHT) continue;

    const halfW = CANVAS_W / 2;
    // Divider pillar
    ctx.fillStyle = '#3a2a4a';
    ctx.fillRect(halfW - 3, gy - GATE_HEIGHT / 2 - 4, 6, GATE_HEIGHT + 8);
    ctx.fillStyle = '#d4a862';
    ctx.beginPath();
    ctx.arc(halfW, gy - GATE_HEIGHT / 2 - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    renderGate(ctx, 0, halfW - 4, gy, g.left, frameCount);
    renderGate(ctx, halfW + 4, halfW - 4, gy, g.right, frameCount);
  }

  // Obstacles
  for (const o of obstacles) {
    if (o.hp <= 0) continue;
    const oy = worldToScreen(o.y, scrollY);
    if (oy < -OBSTACLE_H * 2 || oy > CANVAS_H + OBSTACLE_H * 2) continue;
    renderObstacle(ctx, o.x - o.width / 2, oy - o.height / 2, o.width, o.height, o.hp / o.maxHp, frameCount);
  }

  // Enemies
  for (const e of enemies) {
    const ey = worldToScreen(e.y, scrollY);
    if (ey < -60 || ey > CANVAS_H + 60) continue;
    if (e.isBoss) {
      renderBoss(ctx, e.x, ey, e.width, e.height, e.hp / e.maxHp, frameCount);
    } else {
      renderSlime(ctx, e.x, ey, e.width, e.height, e.hp / e.maxHp, frameCount);
    }
    // HP number above bar
    ctx.fillStyle = '#FFFFFF';
    ctx.font = e.isBoss ? 'bold 14px serif' : '11px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${e.hp}`, e.x, ey - e.height * 0.55 - 10);
  }

  // Bullets
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    renderBullet(ctx, b.x, b.y, frameCount, i);
  }

  // Player
  renderPlayer(ctx, player.x, player.y, player.width, player.height, player.power, frameCount);

  // Effects
  renderEffects(ctx, effects);

  // HUD
  renderHUD(ctx, state);
}
