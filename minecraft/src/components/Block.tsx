import * as THREE from 'three';
import { useEffect, useMemo } from 'react';

interface BlockProps {
  position: THREE.Vector3;
  type: 'grass' | 'dirt' | 'stone';
  scene: THREE.Scene;
}

const BLOCK_COLORS = {
  grass: 0x67c240,
  dirt: 0x8b4513,
  stone: 0x808080,
};

export const Block = ({ position, type, scene }: BlockProps) => {
  const mesh = useMemo(() => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: BLOCK_COLORS[type] });
    const blockMesh = new THREE.Mesh(geometry, material);
    blockMesh.position.copy(position);
    return blockMesh;
  }, [position, type]);

  useEffect(() => {
    scene.add(mesh);
    return () => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    };
  }, [scene, mesh]);

  return null;
};