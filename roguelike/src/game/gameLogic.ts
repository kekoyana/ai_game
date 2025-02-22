import {
  GameState,
  GameMap,
  Position,
  Cell,
  Direction,
  Room,
  Monster,
  Status,
  BattleLog,
  Item,
  ItemType
} from '../types/game';

const FINAL_FLOOR = 10;

const MONSTER_TYPES = [
  { symbol: '👻', name: 'スライム', baseHp: 5, baseAttack: 2, baseDefense: 1, baseExp: 2 },
  { symbol: '👺', name: 'ゴブリン', baseHp: 8, baseAttack: 3, baseDefense: 2, baseExp: 3 },
  { symbol: '👹', name: 'オーク', baseHp: 12, baseAttack: 4, baseDefense: 3, baseExp: 5 }
] as const;

const ITEM_TYPES = [
  { type: 'potion' as ItemType, name: '回復薬', symbol: '🧪', power: 10 },
  { type: 'weapon' as ItemType, name: '鋼の剣', symbol: '⚔️', power: 3 },
  { type: 'armor' as ItemType, name: '鎧', symbol: '🛡️', power: 2 }
] as const;

const calculateDamage = (attacker: { attack: number }, defender: { defense: number }): number => {
  return Math.max(1, attacker.attack - Math.floor(defender.defense / 2));
};

const getDirectionOffset = (direction: Direction): Position => {
  switch (direction) {
    case 'up': return { x: 0, y: -1 };
    case 'down': return { x: 0, y: 1 };
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
    case 'upleft': return { x: -1, y: -1 };
    case 'upright': return { x: 1, y: -1 };
    case 'downleft': return { x: -1, y: 1 };
    case 'downright': return { x: 1, y: 1 };
  }
};

const distance = (a: Position, b: Position): number => {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
};

const isPositionOccupied = (
  pos: Position,
  monsters: Monster[],
  ignoreMonsterIndex: number = -1,
  items: Item[] = []
): boolean => {
  return monsters.some((m, index) =>
    index !== ignoreMonsterIndex &&
    m.hp > 0 &&
    m.position.x === pos.x &&
    m.position.y === pos.y
  ) || items.some(item =>
    item.position.x === pos.x &&
    item.position.y === pos.y
  );
};

const generateItems = (rooms: Room[]): Item[] => {
  const items: Item[] = [];
  const itemsPerRoom = Math.floor(Math.random() * 2) + 1;

  rooms.slice(1).forEach(room => {
    for (let i = 0; i < itemsPerRoom; i++) {
      const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
      let position: Position;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        position = {
          x: Math.floor(Math.random() * (room.w - 2)) + room.x + 1,
          y: Math.floor(Math.random() * (room.h - 2)) + room.y + 1
        };
        attempts++;
      } while (
        items.some(item =>
          item.position.x === position.x &&
          item.position.y === position.y
        ) && attempts < maxAttempts
      );

      if (attempts >= maxAttempts) continue;

      const item: Item = {
        position,
        ...itemType,
        isVisible: true // Always visible
      };
      items.push(item);
    }
  });

  return items;
};

const applyItem = (playerStatus: Status, item: Item): { updatedStatus: Status; message: string } => {
  switch (item.type) {
    case 'potion':
      return {
        updatedStatus: {
          ...playerStatus,
          hp: Math.min(playerStatus.maxHp, playerStatus.hp + item.power)
        },
        message: `🧪 HPが${item.power}回復した！`
      };
    case 'weapon':
      return {
        updatedStatus: {
          ...playerStatus,
          attack: playerStatus.attack + item.power
        },
        message: `⚔️ 攻撃力が${item.power}上昇した！`
      };
    case 'armor':
      return {
        updatedStatus: {
          ...playerStatus,
          defense: playerStatus.defense + item.power
        },
        message: `🛡️ 防御力が${item.power}上昇した！`
      };
  }
};

const createInitialPlayerStatus = (): Status => ({
  hp: 20,
  maxHp: 20,
  attack: 5,
  defense: 3,
  exp: 0,
  level: 1
});

const getExpForNextLevel = (level: number): number => {
  return level * 5;
};

const levelUp = (status: Status): Status => {
  return {
    hp: status.maxHp + 5,
    maxHp: status.maxHp + 5,
    attack: status.attack + 2,
    defense: status.defense + 1,
    exp: 0,
    level: status.level + 1
  };
};

const isInsideRoom = (pos: Position, room: Room): boolean => {
  return pos.x >= room.x &&
         pos.x < room.x + room.w &&
         pos.y >= room.y &&
         pos.y < room.y + room.h;
};

const generateGameMap = (width: number, height: number): { map: GameMap; rooms: Room[] } => {
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

  for (let i = 0; i < roomAttempts; i++) {
    const roomWidth = Math.floor(Math.random() * 4) + 3;
    const roomHeight = Math.floor(Math.random() * 4) + 3;
    const roomX = Math.floor(Math.random() * (width - roomWidth - 2)) + 1;
    const roomY = Math.floor(Math.random() * (height - roomHeight - 2)) + 1;
    const newRoom: Room = { x: roomX, y: roomY, w: roomWidth, h: roomHeight };

    const overlaps = rooms.some(other =>
      newRoom.x <= other.x + other.w &&
      newRoom.x + newRoom.w >= other.x &&
      newRoom.y <= other.y + other.h &&
      newRoom.y + newRoom.h >= other.y
    );
    if (!overlaps) {
      rooms.push(newRoom);
      for (let y = roomY; y < roomY + roomHeight; y++) {
        for (let x = roomX; x < roomX + roomWidth; x++) {
          map[y][x].type = 'floor';
        }
      }
    }
  }

  // Generate corridors connecting rooms
  for (let i = 1; i < rooms.length; i++) {
    const prev = rooms[i - 1];
    const current = rooms[i];
    const prevCenter = {
      x: Math.floor(prev.x + prev.w / 2),
      y: Math.floor(prev.y + prev.h / 2)
    };
    const currCenter = {
      x: Math.floor(current.x + current.w / 2),
      y: Math.floor(current.y + current.h / 2)
    };

    if (Math.random() < 0.5) {
      for (let x = Math.min(prevCenter.x, currCenter.x); x <= Math.max(prevCenter.x, currCenter.x); x++) {
        map[prevCenter.y][x].type = 'floor';
      }
      for (let y = Math.min(prevCenter.y, currCenter.y); y <= Math.max(prevCenter.y, currCenter.y); y++) {
        map[y][currCenter.x].type = 'floor';
      }
    } else {
      for (let y = Math.min(prevCenter.y, currCenter.y); y <= Math.max(prevCenter.y, currCenter.y); y++) {
        map[y][prevCenter.x].type = 'floor';
      }
      for (let x = Math.min(prevCenter.x, currCenter.x); x <= Math.max(prevCenter.x, currCenter.x); x++) {
        map[currCenter.y][x].type = 'floor';
      }
    }
  }

  if (rooms.length > 0) {
    const lastRoom = rooms[rooms.length - 1];
    const stairsX = Math.floor(lastRoom.x + lastRoom.w / 2);
    const stairsY = Math.floor(lastRoom.y + lastRoom.h / 2);
    map[stairsY][stairsX].type = 'stairs';
  }

  return { map, rooms };
};

const revealRoom = (map: GameMap, room: Room, monsters: Monster[]): void => {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      map[y][x].isVisible = true;
    }
  }

  for (let y = Math.max(0, room.y - 1); y < Math.min(map.length, room.y + room.h + 1); y++) {
    for (let x = Math.max(0, room.x - 1); x < Math.min(map[0].length, room.x + room.w + 1); x++) {
      map[y][x].isVisible = true;
    }
  }

  monsters.forEach(monster => {
    if (isInsideRoom(monster.position, room)) {
      monster.isVisible = true;
    }
  });
};

const revealSurroundings = (map: GameMap, pos: Position): void => {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const newY = pos.y + dy;
      const newX = pos.x + dx;
      if (newY >= 0 && newY < map.length && newX >= 0 && newX < map[0].length) {
        map[newY][newX].isVisible = true;
      }
    }
  }
};

const generateMonsters = (rooms: Room[], floor: number): Monster[] => {
  const monsters: Monster[] = [];
  const monstersPerRoom = Math.min(Math.floor(floor / 2) + 1, 3);

  rooms.slice(1).forEach(room => {
    for (let i = 0; i < monstersPerRoom; i++) {
      const monsterType = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];
      const stats = createMonsterStats(monsterType, floor);
      let position: Position;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        position = {
          x: Math.floor(Math.random() * (room.w - 2)) + room.x + 1,
          y: Math.floor(Math.random() * (room.h - 2)) + room.y + 1
        };
        attempts++;
      } while (
        monsters.some(m => m.position.x === position.x && m.position.y === position.y)
        && attempts < maxAttempts
      );

      if (attempts >= maxAttempts) continue;

      const monster: Monster = {
        position,
        hp: stats.hp,
        maxHp: stats.maxHp,
        attack: stats.attack,
        defense: stats.defense,
        exp: stats.exp,
        isVisible: false,
        symbol: monsterType.symbol,
        name: monsterType.name
      };
      monsters.push(monster);
    }
  });

  return monsters;
};

const createMonsterStats = (base: typeof MONSTER_TYPES[number], floor: number): Status => {
  const levelBonus = Math.floor(floor / 2);
  return {
    hp: base.baseHp + levelBonus * 2,
    maxHp: base.baseHp + levelBonus * 2,
    attack: base.baseAttack + levelBonus,
    defense: base.baseDefense + levelBonus,
    exp: base.baseExp + levelBonus,
    level: 1
  };
};

const processBattle = (
  playerStatus: Status,
  monster: Monster
): { updatedPlayerStatus: Status; updatedMonster: Monster; logs: BattleLog[] } => {
  const logs: BattleLog[] = [];
  const timestamp = Date.now();

  const playerDamage = calculateDamage(playerStatus, monster);
  const updatedMonster = { ...monster, hp: Math.max(0, monster.hp - playerDamage) };
  logs.push({
    message: `⚔️ ${playerDamage}のダメージを${monster.name}に与えた！`,
    timestamp
  });

  let updatedPlayerStatus = playerStatus;

  if (updatedMonster.hp > 0) {
    const monsterDamage = calculateDamage(monster, playerStatus);
    updatedPlayerStatus = {
      ...playerStatus,
      hp: Math.max(0, playerStatus.hp - monsterDamage)
    };
    logs.push({
      message: `💥 ${monsterDamage}のダメージを受けた！`,
      timestamp: timestamp + 1
    });
  } else {
    logs.push({
      message: `🎯 ${monster.name}を倒した！ ${monster.exp}の経験値を獲得！`,
      timestamp: timestamp + 1
    });

    const newExp = playerStatus.exp + monster.exp;
    const expForNext = getExpForNextLevel(playerStatus.level);

    if (newExp >= expForNext) {
      updatedPlayerStatus = levelUp(playerStatus);
      logs.push({
        message: `⭐️ レベルアップ！ Level ${updatedPlayerStatus.level}になった！`,
        timestamp: timestamp + 2
      });
    } else {
      updatedPlayerStatus = { ...playerStatus, exp: newExp };
    }
  }

  return { updatedPlayerStatus, updatedMonster, logs };
};

const processMonsterTurn = (
  state: GameState
): { updatedState: GameState; logs: BattleLog[] } => {
  const { map, monsters, items, player, playerStatus } = state;
  const updatedMonsters = [...monsters];
  const logs: BattleLog[] = [];
  const timestamp = Date.now();

  const monsterIndices = Array.from({ length: monsters.length }, (_, i) => i)
    .filter(i => monsters[i].hp > 0 && monsters[i].isVisible)
    .sort(() => Math.random() - 0.5);

  monsterIndices.forEach(index => {
    const monster = updatedMonsters[index];
    const currentPos = monster.position;

    if (distance(currentPos, player) === 1) {
      const monsterDamage = calculateDamage(monster, playerStatus);
      state.playerStatus = {
        ...playerStatus,
        hp: Math.max(0, playerStatus.hp - monsterDamage)
      };

      logs.push({
        message: `💥 ${monster.name}から${monsterDamage}のダメージを受けた！`,
        timestamp: timestamp + index
      });

      if (state.playerStatus.hp <= 0) {
        state.isGameOver = true;
      }
      return;
    }

    if (monster.isVisible && distance(currentPos, player) <= 5) {
      const possibleMoves: { x: number; y: number; dist: number }[] = [];

      for (const dy of [-1, 0, 1]) {
        for (const dx of [-1, 0, 1]) {
          if (dx === 0 && dy === 0) continue;

          const newX = currentPos.x + dx;
          const newY = currentPos.y + dy;

          if (
            newX >= 0 && newX < map[0].length &&
            newY >= 0 && newY < map.length &&
            map[newY][newX].type === 'floor' &&
            !(newX === player.x && newY === player.y) &&
            !isPositionOccupied({ x: newX, y: newY }, updatedMonsters, index, items)
          ) {
            possibleMoves.push({
              x: newX,
              y: newY,
              dist: Math.abs(newX - player.x) + Math.abs(newY - player.y)
            });
          }
        }
      }

      if (possibleMoves.length > 0) {
        possibleMoves.sort((a, b) => a.dist - b.dist);
        const bestMove = possibleMoves[0];
        updatedMonsters[index] = {
          ...monster,
          position: { x: bestMove.x, y: bestMove.y }
        };
      }
    }
  });

  return {
    updatedState: {
      ...state,
      monsters: updatedMonsters
    },
    logs
  };
};

const isWalkable = (cell: Cell): boolean =>
  cell.type === 'floor' || cell.type === 'stairs';

const createNextFloor = (
  width: number,
  height: number,
  floor: number,
  playerStatus: Status
): GameState => {
  const { map, rooms } = generateGameMap(width, height);
  let player: Position = { x: 1, y: 1 };

  if (rooms.length > 0) {
    const firstRoom = rooms[0];
    player = {
      x: Math.floor(firstRoom.x + firstRoom.w / 2),
      y: Math.floor(firstRoom.y + firstRoom.h / 2)
    };
  }

  const monsters = generateMonsters(rooms, floor);
  const items = generateItems(rooms);
  revealRoom(map, rooms[0], monsters);

  return {
    player,
    playerStatus,
    map,
    rooms,
    monsters,
    items,
    battleLogs: [],
    currentFloor: floor,
    isGameOver: false,
    isGameClear: floor > FINAL_FLOOR
  };
};

const findMonsterAtPosition = (monsters: Monster[], pos: Position): Monster | undefined => {
  return monsters.find(m =>
    m.position.x === pos.x &&
    m.position.y === pos.y &&
    m.hp > 0
  );
};

export const createInitialGameState = (width: number, height: number): GameState => {
  const { map, rooms } = generateGameMap(width, height);
  let initialPlayer: Position = { x: 1, y: 1 };
  const playerStatus = createInitialPlayerStatus();

  if (rooms.length > 0) {
    const firstRoom = rooms[0];
    initialPlayer = {
      x: Math.floor(firstRoom.x + firstRoom.w / 2),
      y: Math.floor(firstRoom.y + firstRoom.h / 2)
    };
    revealRoom(map, firstRoom, []); // 初期部屋を可視化
  }

  const monsters = generateMonsters(rooms, 1);
  const items = generateItems(rooms);

  return {
    player: initialPlayer,
    playerStatus,
    map,
    rooms,
    monsters,
    items,
    battleLogs: [],
    currentFloor: 1,
    isGameOver: false,
    isGameClear: false
  };
};

export const movePlayer = (state: GameState, direction: Direction): GameState => {
  const { player, map, rooms, monsters, items, playerStatus } = state;
  const offset = getDirectionOffset(direction);
  const newX = player.x + offset.x;
  const newY = player.y + offset.y;

  if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) {
    return state;
  }

  const targetCell = map[newY][newX];
  if (!isWalkable(targetCell)) {
    return state;
  }

  // アイテムの取得チェック
  const item = items.find(i => i.position.x === newX && i.position.y === newY && i.isVisible);
  if (item) {
    const { updatedStatus, message } = applyItem(playerStatus, item);
    return {
      ...state,
      player: { x: newX, y: newY },
      playerStatus: updatedStatus,
      items: items.filter(i => i !== item),
      battleLogs: [...state.battleLogs, { message, timestamp: Date.now() }]
    };
  }

  const monster = findMonsterAtPosition(monsters, { x: newX, y: newY });
  if (monster && monster.isVisible) {
    const { updatedPlayerStatus, updatedMonster, logs } = processBattle(playerStatus, monster);

    const battleState = {
      ...state,
      playerStatus: updatedPlayerStatus,
      monsters: monsters.map(m => m === monster ? updatedMonster : m),
      battleLogs: [...state.battleLogs, ...logs]
    };

    if (updatedPlayerStatus.hp <= 0) {
      return { ...battleState, isGameOver: true };
    }

    const movedState = updatedMonster.hp <= 0 ? {
      ...battleState,
      player: { x: newX, y: newY }
    } : battleState;

    const { updatedState: finalState, logs: monsterLogs } = processMonsterTurn(movedState);
    return {
      ...finalState,
      battleLogs: [...finalState.battleLogs, ...monsterLogs]
    };
  }

  map[newY][newX].isVisible = true;

  let inRoom = false;
  for (const room of rooms) {
    if (isInsideRoom({ x: newX, y: newY }, room)) {
      revealRoom(map, room, monsters);
      inRoom = true;
      break;
    }
  }

  if (!inRoom) {
    revealSurroundings(map, { x: newX, y: newY });
  }

  if (targetCell.type === 'stairs') {
    const nextFloor = state.currentFloor + 1;
    return createNextFloor(map.length, map[0].length, nextFloor, playerStatus);
  }

  const movedState = {
    ...state,
    player: { x: newX, y: newY }
  };

  const { updatedState: finalState, logs } = processMonsterTurn(movedState);
  return {
    ...finalState,
    battleLogs: [...finalState.battleLogs, ...logs]
  };
};
