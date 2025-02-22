import { GameState, GameMap, Position, Cell, Direction } from '../types/game';

export const generateGameMap = (width: number, height: number): GameMap => {
  // マップを壁で初期化
  const map: GameMap = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ type: 'wall', isVisible: false });
    }
    map.push(row);
  }

  interface Room { x: number; y: number; w: number; h: number; }
  const rooms: Room[] = [];
  const roomAttempts = 10;

  // ランダムな部屋を生成
  for (let i = 0; i < roomAttempts; i++) {
    const roomWidth = Math.floor(Math.random() * 4) + 3;
    const roomHeight = Math.floor(Math.random() * 4) + 3;
    const roomX = Math.floor(Math.random() * (width - roomWidth - 2)) + 1;
    const roomY = Math.floor(Math.random() * (height - roomHeight - 2)) + 1;
    const newRoom: Room = { x: roomX, y: roomY, w: roomWidth, h: roomHeight };

    const overlaps = rooms.some(other => {
      return (
        newRoom.x <= other.x + other.w &&
        newRoom.x + newRoom.w >= other.x &&
        newRoom.y <= other.y + other.h &&
        newRoom.y + newRoom.h >= other.y
      );
    });
    if (!overlaps) {
      rooms.push(newRoom);
      // 部屋内部を床にする
      for (let y = roomY; y < roomY + roomHeight; y++) {
        for (let x = roomX; x < roomX + roomWidth; x++) {
          map[y][x].type = 'floor';
        }
      }
    }
  }

  // 生成した部屋同士を通路で接続する
  for (let i = 1; i < rooms.length; i++) {
    const prev = rooms[i - 1];
    const current = rooms[i];
    const prevCenter = { x: Math.floor(prev.x + prev.w / 2), y: Math.floor(prev.y + prev.h / 2) };
    const currCenter = { x: Math.floor(current.x + current.w / 2), y: Math.floor(current.y + current.h / 2) };

    if (Math.random() < 0.5) {
      // 横方向に通路、その後縦方向
      for (let x = Math.min(prevCenter.x, currCenter.x); x <= Math.max(prevCenter.x, currCenter.x); x++) {
        map[prevCenter.y][x].type = 'floor';
      }
      for (let y = Math.min(prevCenter.y, currCenter.y); y <= Math.max(prevCenter.y, currCenter.y); y++) {
        map[y][currCenter.x].type = 'floor';
      }
    } else {
      // 縦方向に通路、その後横方向
      for (let y = Math.min(prevCenter.y, currCenter.y); y <= Math.max(prevCenter.y, currCenter.y); y++) {
        map[y][prevCenter.x].type = 'floor';
      }
      for (let x = Math.min(prevCenter.x, currCenter.x); x <= Math.max(prevCenter.x, currCenter.x); x++) {
        map[currCenter.y][x].type = 'floor';
      }
    }
  }

  return map;
};

export const createInitialGameState = (width: number, height: number): GameState => {
  const map = generateGameMap(width, height);
  let initialPlayer: Position = { x: 1, y: 1 };
  if (map.some(row => row.some(cell => cell.type === 'floor'))) {
    outer:
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (map[y][x].type === 'floor') {
          initialPlayer = { x, y };
          break outer;
        }
      }
    }
  }
  map[initialPlayer.y][initialPlayer.x].isVisible = true;
  return {
    player: initialPlayer,
    map,
    isGameOver: false,
  };
};

const isWalkable = (cell: Cell): boolean => cell.type === 'floor';

export const movePlayer = (state: GameState, direction: Direction): GameState => {
  const { player, map } = state;
  let newX = player.x;
  let newY = player.y;

  switch (direction) {
    case 'up':
      newY -= 1;
      break;
    case 'down':
      newY += 1;
      break;
    case 'left':
      newX -= 1;
      break;
    case 'right':
      newX += 1;
      break;
    default:
      break;
  }

  if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) {
    return state;
  }

  if (!isWalkable(map[newY][newX])) {
    return state;
  }

  map[newY][newX].isVisible = true;

  return { ...state, player: { x: newX, y: newY } };
};