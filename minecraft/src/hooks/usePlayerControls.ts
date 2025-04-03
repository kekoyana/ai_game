import { useEffect, useState } from 'react';
import * as THREE from 'three';

interface PlayerControls {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
}

export const usePlayerControls = () => {
  const [movement, setMovement] = useState<PlayerControls>({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMovement((m) => ({ ...m, moveForward: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setMovement((m) => ({ ...m, moveBackward: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setMovement((m) => ({ ...m, moveLeft: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setMovement((m) => ({ ...m, moveRight: true }));
          break;
        case 'Space':
          setMovement((m) => ({ ...m, jump: true }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMovement((m) => ({ ...m, moveForward: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setMovement((m) => ({ ...m, moveBackward: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setMovement((m) => ({ ...m, moveLeft: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setMovement((m) => ({ ...m, moveRight: false }));
          break;
        case 'Space':
          setMovement((m) => ({ ...m, jump: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return movement;
};

export const updatePlayerPosition = (
  camera: THREE.PerspectiveCamera,
  controls: PlayerControls,
  deltaTime: number
) => {
  const speed = 5;
  const direction = new THREE.Vector3();
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(camera.quaternion);
  forward.y = 0;
  forward.normalize();

  if (controls.moveForward) {
    direction.add(forward);
  }
  if (controls.moveBackward) {
    direction.sub(forward);
  }
  if (controls.moveRight) {
    direction.add(forward.clone().cross(new THREE.Vector3(0, 1, 0)));
  }
  if (controls.moveLeft) {
    direction.sub(forward.clone().cross(new THREE.Vector3(0, 1, 0)));
  }

  direction.normalize();
  camera.position.addScaledVector(direction, speed * deltaTime);
};