import { useRef, useEffect, useCallback } from 'react';
import { GameState } from './game/types';
import { createInitialState, tick, CANVAS_W, CANVAS_H } from './game/engine';
import { render, renderOverlay } from './game/renderer';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>({
    ...createInitialState(1),
    scene: 'title',
  });
  const dragRef = useRef<{ startX: number; playerStartX: number } | null>(null);
  const rafRef = useRef<number>(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const state = stateRef.current;
    if (state.scene === 'title') {
      stateRef.current = createInitialState(1);
      return;
    }
    if (state.scene === 'gameover') {
      stateRef.current = createInitialState(1);
      return;
    }
    if (state.scene === 'clear') {
      const next = createInitialState(state.stage + 1);
      next.score = state.score;
      stateRef.current = next;
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const pointerX = (e.clientX - rect.left) * scaleX;
    dragRef.current = { startX: pointerX, playerStartX: state.player.x };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const pointerX = (e.clientX - rect.left) * scaleX;
    const dx = pointerX - dragRef.current.startX;
    const newX = Math.max(20, Math.min(CANVAS_W - 20, dragRef.current.playerStartX + dx));
    stateRef.current.player.x = newX;
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function loop() {
      const state = stateRef.current;
      if (state.scene === 'playing') {
        stateRef.current = tick(state);
      }
      render(ctx!, stateRef.current);
      if (stateRef.current.scene !== 'playing') {
        renderOverlay(ctx!, stateRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{
        maxWidth: '100vw',
        maxHeight: '100vh',
        touchAction: 'none',
        cursor: 'pointer',
        border: '2px solid #333',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
