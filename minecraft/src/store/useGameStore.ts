import { create } from 'zustand';
import * as THREE from 'three';

interface Block {
  position: THREE.Vector3;
  type: 'grass' | 'dirt' | 'stone';
}

interface GameState {
  blocks: Block[];
  addBlock: (position: THREE.Vector3, type: Block['type']) => void;
  removeBlock: (position: THREE.Vector3) => void;
  generateInitialWorld: () => void;
}

// 疑似ランダムなノイズ関数（シンプルな高さマップ生成用）
const noise = (x: number, z: number) => {
  const value = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2;
  return Math.round(value);
};

export const useGameStore = create<GameState>((set) => ({
  blocks: [],

  addBlock: (position, type) =>
    set((state) => ({
      blocks: [...state.blocks, { position, type }],
    })),

  removeBlock: (position) =>
    set((state) => ({
      blocks: state.blocks.filter(
        (block) =>
          block.position.x !== position.x ||
          block.position.y !== position.y ||
          block.position.z !== position.z
      ),
    })),

  generateInitialWorld: () => {
    const newBlocks: Block[] = [];
    // 16x16のワールドを生成
    for (let x = -8; x <= 8; x++) {
      for (let z = -8; z <= 8; z++) {
        const height = noise(x, z);
        
        // 地表のブロック
        newBlocks.push({
          position: new THREE.Vector3(x, height, z),
          type: 'grass',
        });

        // 地中のブロック
        for (let y = height - 1; y >= height - 3; y--) {
          newBlocks.push({
            position: new THREE.Vector3(x, y, z),
            type: y === height - 1 ? 'dirt' : 'stone',
          });
        }
      }
    }
    set({ blocks: newBlocks });
  },
}));