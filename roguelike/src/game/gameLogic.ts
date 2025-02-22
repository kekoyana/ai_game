import { GameState, GameMap, Position, Cell, Direction, Room } from '../types/game';

const FINAL_FLOOR = 10;

const isInsideRoom = (pos: Position, room: Room): boolean => {
  return pos.x >= room.x && 
         pos.x < room.x + room.w && 
         pos.y >= room.y && 
         pos.y < room.y + room.h;
};

const revealRoom = (map: GameMap, room: Room): void => {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      map[y][x].isVisible = true;
    }
  }
};

export const generateGameMap = (width: number, height: number): { map: GameMap, rooms: Room[] } => {
  // マップを壁で初期化
  const map: GameMap = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ type: 'wall', isVisible: false });
    }
    map.push(row);
  }

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

  // 部屋同士を通路で接続
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

  // 最後の部屋に階段を配置（最終階の場合はゴール）
  if (rooms.length > 0) {
    const lastRoom = rooms[rooms.length - 1];
    const stairsX = Math.floor(lastRoom.x + lastRoom.w / 2);
    const stairsY = Math.floor(lastRoom.y + lastRoom.h / 2);
    map[stairsY][stairsX].type = 'stairs';
  }

  return { map, rooms };
};

export const createInitialGameState = (width: number, height: number): GameState => {
  const { map, rooms } = generateGameMap(width, height);
  let initialPlayer: Position = { x: 1, y: 1 };

  // プレイヤーを最初の部屋に配置
  if (rooms.length > 0) {
    const firstRoom = rooms[0];
    initialPlayer = {
      x: Math.floor(firstRoom.x + firstRoom.w / 2),
      y: Math.floor(firstRoom.y + firstRoom.h / 2)
    };
    revealRoom(map, firstRoom); // 初期部屋を可視化
  }

  return {
    player: initialPlayer,
    map,
    rooms,
    currentFloor: 1,
    isGameOver: false,
    isGameClear: false
  };
};

const isWalkable = (cell: Cell): boolean => 
  cell.type === 'floor' || cell.type === 'stairs';

const createNextFloor = (
  width: number,
  height: number,
  floor: number,
  player: Position
): GameState => {
  const { map, rooms } = generateGameMap(width, height);
  
  // プレイヤーを最初の部屋に配置
  if (rooms.length > 0) {
    const firstRoom = rooms[0];
    player = {
      x: Math.floor(firstRoom.x + firstRoom.w / 2),
      y: Math.floor(firstRoom.y + firstRoom.h / 2)
    };
    revealRoom(map, firstRoom); // 初期部屋を可視化
  }

  return {
    player,
    map,
    rooms,
    currentFloor: floor,
    isGameOver: false,
    isGameClear: floor > FINAL_FLOOR
  };
};

export const movePlayer = (state: GameState, direction: Direction): GameState => {
  const { player, map, rooms } = state;
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

  const targetCell = map[newY][newX];
  if (!isWalkable(targetCell)) {
    return state;
  }

  // 新しい位置を可視化
  map[newY][newX].isVisible = true;

  // 新しい位置が部屋の中にあるかチェック
  for (const room of rooms) {
    if (isInsideRoom({ x: newX, y: newY }, room)) {
      revealRoom(map, room);
      break;
    }
  }

  // 階段に到達した場合
  if (targetCell.type === 'stairs') {
    const nextFloor = state.currentFloor + 1;
    return createNextFloor(map.length, map[0].length, nextFloor, { x: newX, y: newY });
  }

  return { ...state, player: { x: newX, y: newY } };
};