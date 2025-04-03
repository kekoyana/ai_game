import { useEffect } from 'react';

export const useFrame = (callback: () => void) => {
  useEffect(() => {
    let frameId: number;

    const animate = () => {
      callback();
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [callback]);
};