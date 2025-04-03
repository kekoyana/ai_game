import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '../hooks/useFrame';
import { Block } from './Block';
import { useGameStore } from '../store/useGameStore';
import { usePlayerControls, updatePlayerPosition } from '../hooks/usePlayerControls';

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const blocks = useGameStore((state) => state.blocks);
  const generateInitialWorld = useGameStore((state) => state.generateInitialWorld);
  const controls = usePlayerControls();

  useEffect(() => {
    if (!canvasRef.current) return;

    // カメラの設定
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // レンダラーの設定
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87ceeb); // 空色の背景
    rendererRef.current = renderer;

    // 基本的な光源の追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    sceneRef.current.add(ambientLight);
    sceneRef.current.add(directionalLight);

    // 初期ワールドの生成
    generateInitialWorld();

    // マウス操作の設定
    let isPointerLocked = false;
    let rotationX = 0;
    let rotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked || !cameraRef.current) return;

      const sensitivity = 0.002;
      rotationX -= event.movementY * sensitivity;
      rotationY -= event.movementX * sensitivity;

      // 上下の視点制限
      rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));

      cameraRef.current.rotation.order = 'YXZ';
      cameraRef.current.rotation.x = rotationX;
      cameraRef.current.rotation.y = rotationY;
    };

    const handlePointerLockChange = () => {
      isPointerLocked = document.pointerLockElement === canvasRef.current;
    };

    const handleCanvasClick = () => {
      canvasRef.current?.requestPointerLock();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    canvasRef.current.addEventListener('click', handleCanvasClick);

    // ウィンドウリサイズ時の処理
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      canvasRef.current?.removeEventListener('click', handleCanvasClick);
    };
  }, [generateInitialWorld]);

  // ゲームループ
  useFrame(() => {
    if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    // プレイヤーの移動を更新
    updatePlayerPosition(cameraRef.current, controls, deltaTime);

    // シーンのレンダリング
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  });

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {blocks.map((block, index) => (
        <Block
          key={`${block.position.x}-${block.position.y}-${block.position.z}-${index}`}
          position={block.position}
          type={block.type}
          scene={sceneRef.current}
        />
      ))}
      <div className="controls-info" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '10px',
        borderRadius: '5px',
      }}>
        <p>WASDまたは矢印キー: 移動</p>
        <p>マウス: 視点操作</p>
        <p>スペース: ジャンプ</p>
        <p>クリック: 視点操作開始</p>
      </div>
    </>
  );
};