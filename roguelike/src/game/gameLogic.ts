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
  { symbol: '🫠', name: 'スライム', baseHp: 8, baseAttack: 3, baseDefense: 1, baseExp: 5 },
  { symbol: '👹', name: 'ゴブリン', baseHp: 12, baseAttack: 4, baseDefense: 2, baseExp: 8 },
  { symbol: '🧌', name: 'オーク', baseHp: 25, baseAttack: 10, baseDefense: 5, baseExp: 15 },
  { symbol: '🐲', name: 'ドラゴン', baseHp: 40, baseAttack: 18, baseDefense: 8, baseExp: 25 },
  { symbol: '💀', name: 'リッチ', baseHp: 35, baseAttack: 20, baseDefense: 6, baseExp: 30 }
] as const;

const ITEM_TYPES = [
  { type: 'potion' as ItemType, name: '回復薬', symbol: '🧪', power: 15 },
  { type: 'potion' as ItemType, name: '上級回復薬', symbol: '🧪', power: 99 },
  // 食べ物（1種類）
  { type: 'food' as ItemType, name: 'パン', symbol: '🍞', power: 100 },
  // 武器（8種類）
  { type: 'weapon' as ItemType, name: 'ダガー', symbol: '⚔️', power: 4 },
  { type: 'weapon' as ItemType, name: 'グラディウス', symbol: '⚔️', power: 5 },
  { type: 'weapon' as ItemType, name: 'カタール', symbol: '⚔️', power: 6 },
  { type: 'weapon' as ItemType, name: 'ロングソード', symbol: '⚔️', power: 7 },
  { type: 'weapon' as ItemType, name: 'ランス', symbol: '⚔️', power: 8 },
  { type: 'weapon' as ItemType, name: 'バスタードソード', symbol: '⚔️', power: 9 },
  { type: 'weapon' as ItemType, name: '蛇矛', symbol: '⚔️', power: 10 },
  { type: 'weapon' as ItemType, name: 'エクスカリバー', symbol: '⚔️', power: 11 },
  // 防具（8種類）
  { type: 'armor' as ItemType, name: 'レザーアーマー', symbol: '🛡️', power: 3 },
  { type: 'armor' as ItemType, name: 'ブロンズアーマー', symbol: '🛡️', power: 4 },
  { type: 'armor' as ItemType, name: 'チェーンメイル', symbol: '🛡️', power: 5 },
  { type: 'armor' as ItemType, name: '南蛮胴', symbol: '🛡️', power: 6 },
  { type: 'armor' as ItemType, name: 'ラメラーアーマー', symbol: '🛡️', power: 7 },
  { type: 'armor' as ItemType, name: 'プレートメイル', symbol: '🛡️', power: 8 },
  { type: 'armor' as ItemType, name: 'ドラゴンメイル', symbol: '🛡️', power: 9 },
  { type: 'armor' as ItemType, name: 'アイギスの鎧', symbol: '🛡️', power: 10 }
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
  items: Item[] = [],
  checkItems: boolean = false
): boolean => {
  const monsterCollision = monsters.some((m, index) =>
    index !== ignoreMonsterIndex &&
    m.hp > 0 &&
    m.position.x === pos.x &&
    m.position.y === pos.y
  );

  if (!checkItems) return monsterCollision;

  const itemCollision = items.some(item =>
    item.position !== null &&
    item.position.x === pos.x &&
    item.position.y === pos.y
  );

  return monsterCollision || itemCollision;
};

const generateItems = (rooms: Room[]): Item[] => {
  const items: Item[] = [];
  
  // フロアごとに2-3個のアイテムを配置
  const totalItems = Math.floor(Math.random() * 2) + 2;
  const availableRooms = rooms.slice(1);
  
  for (let i = 0; i < totalItems && i < availableRooms.length; i++) {
    const room = availableRooms[i];
    const availableItems = ITEM_TYPES;
    const itemType = availableItems[Math.floor(Math.random() * availableItems.length)];
    
    // 強力なアイテムほど出現確率を下げる
    const dropChance = itemType.type === 'potion' ? 1 : Math.max(0.1, 1 - (itemType.power / 15));
    if (Math.random() > dropChance) continue;
    
    const position = {
      x: Math.floor(Math.random() * (room.w - 2)) + room.x + 1,
      y: Math.floor(Math.random() * (room.h - 2)) + room.y + 1
    };
    
    const item: Item = {
      ...itemType,
      position,
      isVisible: true,
      isEquipped: false,
    };
    items.push(item);
  }
  
  return items;
};

export const dropItem = (state: GameState, itemIndex: number): GameState => {
  const item = state.inventory.items[itemIndex];
  if (!item) return state;

  // 装備中のアイテムは破棄できない
  if (item.isEquipped) {
    return {
      ...state,
      battleLogs: [...state.battleLogs, {
        message: '装備中のアイテムは破棄できません！',
        timestamp: Date.now()
      }]
    };
  }

  return {
    ...state,
    inventory: {
      ...state.inventory,
      items: state.inventory.items.filter((_, i) => i !== itemIndex)
    },
    battleLogs: [...state.battleLogs, {
      message: `${item.name}を捨てました。`,
      timestamp: Date.now()
    }]
  };
};

export const applyItem = (state: GameState, itemIndex: number): GameState => {
  const item = state.inventory.items[itemIndex];
  if (!item) return state;

  switch (item.type) {
    case 'potion': {
      const newHp = Math.min(state.playerStatus.maxHp, state.playerStatus.hp + item.power);
      return {
        ...state,
        playerStatus: { ...state.playerStatus, hp: newHp },
        inventory: {
          ...state.inventory,
          items: state.inventory.items.filter((_, i) => i !== itemIndex)
        },
        battleLogs: [...state.battleLogs, {
          message: `🧪 ${item.name}を使用、HPが${item.power}回復した！`,
          timestamp: Date.now()
        }]
      };
    }
    case 'food': {
      const newSatiety = Math.min(state.playerStatus.maxSatiety, state.playerStatus.satiety + item.power);
      return {
        ...state,
        playerStatus: { ...state.playerStatus, satiety: newSatiety },
        inventory: {
          ...state.inventory,
          items: state.inventory.items.filter((_, i) => i !== itemIndex)
        },
        battleLogs: [...state.battleLogs, {
          message: `${item.symbol} ${item.name}を食べた！満腹度が${item.power}回復した！`,
          timestamp: Date.now()
        }]
      };
    }
    case 'weapon': {
      // 現在装備中の武器があれば装備解除
      const newInventoryItems = state.inventory.items.map(invItem => {
        if (invItem.type === 'weapon' && invItem.isEquipped) {
          return { ...invItem, isEquipped: false };
        }
        if (invItem === item) {
          return { ...invItem, isEquipped: true };
        }
        return invItem;
      });

      return {
        ...state,
        inventory: {
          ...state.inventory,
          items: newInventoryItems
        },
        equipment: {
          ...state.equipment,
          weapon: { ...item, isEquipped: true }
        },
        battleLogs: [...state.battleLogs, {
          message: `⚔️ ${item.name}を装備した！`,
          timestamp: Date.now()
        }]
      };
    }
    case 'armor': {
      // 現在装備中の防具があれば装備解除
      const newInventoryItems = state.inventory.items.map(invItem => {
        if (invItem.type === 'armor' && invItem.isEquipped) {
          return { ...invItem, isEquipped: false };
        }
        if (invItem === item) {
          return { ...invItem, isEquipped: true };
        }
        return invItem;
      });

      return {
        ...state,
        inventory: {
          ...state.inventory,
          items: newInventoryItems
        },
        equipment: {
          ...state.equipment,
          armor: { ...item, isEquipped: true }
        },
        battleLogs: [...state.battleLogs, {
          message: `🛡️ ${item.name}を装備した！`,
          timestamp: Date.now()
        }]
      };
    }
  }
  return state;
};

export const getPlayerPower = (playerStatus: Status, state: GameState): Status => {
  // インベントリから装備中のアイテムを探す
  const equippedWeapon = state.inventory.items.find(item => item.type === 'weapon' && item.isEquipped);
  const equippedArmor = state.inventory.items.find(item => item.type === 'armor' && item.isEquipped);

  return {
    ...playerStatus,
    attack: playerStatus.attack + (equippedWeapon?.power || 0),
    defense: playerStatus.defense + (equippedArmor?.power || 0)
  };
};

const createInitialPlayerStatus = (): Status => ({
  hp: 20,
  maxHp: 20,
  attack: 5,
  defense: 3,
  exp: 0,
  level: 1,
  satiety: 100,
  maxSatiety: 100
});

const getExpForNextLevel = (level: number): number => {
  return level * 5;
};

const levelUp = (status: Status): Status => {
  return {
    hp: status.hp,  // HPは現在値を維持
    maxHp: status.maxHp + 5,
    attack: status.attack + 2,
    defense: status.defense + 1,
    exp: 0,
    level: status.level + 1,
    satiety: status.satiety,  // 満腹度は現在値を維持
    maxSatiety: status.maxSatiety  // 最大満腹度は変更なし
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
  const availableRooms = rooms.slice(1);
  
  // フロアごとに1-5体のモンスターを配置
  const totalMonsters = Math.floor(Math.random() * 5) + 1;
  
  // 部屋をランダムに選んでモンスターを配置
  for (let i = 0; i < totalMonsters && i < availableRooms.length; i++) {
    const room = availableRooms[i];
    
    // 階層に応じて出現するモンスターを制限
    let availableMonsters;
    if (floor <= 3) {
      availableMonsters = MONSTER_TYPES.slice(0, 2);      // 1-3階：スライムとゴブリン
    } else if (floor <= 6) {
      availableMonsters = MONSTER_TYPES.slice(0, 3);      // 4-6階：オークまで
    } else if (floor <= 8) {
      availableMonsters = MONSTER_TYPES.slice(0, 4);      // 7-8階：ドラゴンまで
    } else {
      availableMonsters = MONSTER_TYPES;                  // 9階以降：全モンスター
    }
    
    const monsterType = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    const stats = createMonsterStats(monsterType, floor);
    
    // モンスターの位置を決定
    const position = {
      x: Math.floor(Math.random() * (room.w - 2)) + room.x + 1,
      y: Math.floor(Math.random() * (room.h - 2)) + room.y + 1
    };
    
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
  
  return monsters;
};

const createMonsterStats = (base: typeof MONSTER_TYPES[number], floor: number): Status => {
  const levelBonus = Math.floor(floor / 2);
  return {
    hp: base.baseHp + levelBonus * 3,
    maxHp: base.baseHp + levelBonus * 3,
    attack: base.baseAttack + levelBonus * 2,
    defense: base.baseDefense + levelBonus,
    exp: base.baseExp + levelBonus,
    level: 1,
    satiety: 100,  // モンスターの満腹度（使用しないが型のため必要）
    maxSatiety: 100
  };
};

const processBattle = (
  playerStatus: Status,
  monster: Monster,
  state: GameState
): { updatedPlayerStatus: Status; updatedMonster: Monster; logs: BattleLog[] } => {
  const logs: BattleLog[] = [];
  const timestamp = Date.now();

  const playerWithEquipment = getPlayerPower(playerStatus, state);
  const playerDamage = calculateDamage(playerWithEquipment, monster);
  const updatedMonster = { ...monster, hp: Math.max(0, monster.hp - playerDamage) };
  logs.push({
    message: `⚔️ ${playerDamage}のダメージを${monster.name}に与えた！`,
    timestamp
  });

  let updatedPlayerStatus = playerStatus;

  if (updatedMonster.hp <= 0) {
    logs.push({
      message: `🎯 ${monster.name}を倒した！ ${monster.exp}の経験値を獲得！`,
      timestamp: timestamp + 1
    });

    // アイテムドロップ処理
    const droppedItem = generateMonsterDrop(monster, monster.position);
    if (droppedItem) {
      state.items.push(droppedItem);
      logs.push({
        message: `${monster.name}は${droppedItem.name}を落とした！`,
        timestamp: timestamp + 2
      });
    }

    const newExp = playerStatus.exp + monster.exp;
    const expForNext = getExpForNextLevel(playerStatus.level);

    if (newExp >= expForNext) {
      updatedPlayerStatus = levelUp(playerStatus);
      logs.push({
        message: `⭐️ レベルアップ！ Level ${updatedPlayerStatus.level}になった！`,
        timestamp: timestamp + 3
      });
    } else {
      updatedPlayerStatus = { ...playerStatus, exp: newExp };
    }
  }

  return { updatedPlayerStatus, updatedMonster, logs };
};

const generateMonsterDrop = (monster: Monster, position: Position): Item | null => {
  // 10%の確率でアイテムをドロップ
  if (Math.random() > 0.1) return null;

  // ドロップするアイテムをランダムに選択
  const availableItems = ITEM_TYPES;
  const itemType = availableItems[Math.floor(Math.random() * availableItems.length)];

  const item: Item = {
    ...itemType,
    position,
    isVisible: true,
    isEquipped: false,
  };

  return item;
};

const spawnNewMonster = (state: GameState): Monster | null => {
  // 10ターンごとにモンスター出現判定（20%の確率）
  if (state.turns % 10 !== 0 || Math.random() > 0.2) return null;

  // ランダムな部屋を選択（プレイヤーのいる部屋は除外）
  const availableRooms = state.rooms.filter(room => !isInsideRoom(state.player, room));
  if (availableRooms.length === 0) return null;

  const room = availableRooms[Math.floor(Math.random() * availableRooms.length)];
  
  // フロアに応じて出現するモンスターを制限
  let availableMonsters;
  if (state.currentFloor <= 3) {
    availableMonsters = MONSTER_TYPES.slice(0, 2);      // 1-3階：スライムとゴブリン
  } else if (state.currentFloor <= 6) {
    availableMonsters = MONSTER_TYPES.slice(0, 3);      // 4-6階：オークまで
  } else if (state.currentFloor <= 8) {
    availableMonsters = MONSTER_TYPES.slice(0, 4);      // 7-8階：ドラゴンまで
  } else {
    availableMonsters = MONSTER_TYPES;                  // 9階以降：全モンスター
  }
  
  const monsterType = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
  const stats = createMonsterStats(monsterType, state.currentFloor);

  const position = {
    x: Math.floor(Math.random() * (room.w - 2)) + room.x + 1,
    y: Math.floor(Math.random() * (room.h - 2)) + room.y + 1
  };

  // 他のモンスターやアイテムと重ならないように確認
  if (isPositionOccupied(position, state.monsters, -1, state.items)) return null;

  return {
    position,
    hp: stats.hp,
    maxHp: stats.maxHp,
    attack: stats.attack,
    defense: stats.defense,
    exp: stats.exp,
    isVisible: isInsideRoom(position, room),
    symbol: monsterType.symbol,
    name: monsterType.name
  };
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
      if (currentPos.x !== player.x && currentPos.y !== player.y) {
        const inter1 = map[currentPos.y][player.x];
        const inter2 = map[player.y][currentPos.x];
        if (!isWalkable(inter1) || !isWalkable(inter2)) {
          return;
        }
      }
      const playerWithEquipment = getPlayerPower(playerStatus, state);
      const monsterDamage = calculateDamage(monster, playerWithEquipment);
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
          // 斜め移動の場合、中間マスの確認
          if (dx !== 0 && dy !== 0) {
            const inter1 = map[currentPos.y][currentPos.x + dx];
            const inter2 = map[currentPos.y + dy][currentPos.x];
            if (!isWalkable(inter1) || !isWalkable(inter2)) continue;
          }

          const newX = currentPos.x + dx;
          const newY = currentPos.y + dy;

          if (
            newX >= 0 && newX < map[0].length &&
            newY >= 0 && newY < map.length &&
            map[newY][newX].type === 'floor' &&
            !(newX === player.x && newY === player.y) &&
            !isPositionOccupied({ x: newX, y: newY }, updatedMonsters, index, items, false)
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
  playerStatus: Status,
  prevState: GameState
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
  inventory: prevState.inventory,
  equipment: prevState.equipment,
  battleLogs: [],
  currentFloor: floor,
  isGameOver: false,
  isGameClear: floor > FINAL_FLOOR,
  healingPool: 0,
  turns: 1
};
};

const findMonsterAtPosition = (monsters: Monster[], pos: Position): Monster | undefined => {
  return monsters.find(m =>
    m.position.x === pos.x &&
    m.position.y === pos.y &&
    m.hp > 0
  );
};

const processNaturalHealing = (state: GameState): GameState => {
  let updatedState = state;

  // 満腹度の減少（移動ごとに0.1減少）
  updatedState = {
    ...updatedState,
    playerStatus: {
      ...updatedState.playerStatus,
      satiety: Math.max(0, updatedState.playerStatus.satiety - 0.1)
    }
  };

  // 満腹度が0の場合、HPが減少
  if (updatedState.playerStatus.satiety <= 0) {
    const damage = 1;
    updatedState = {
      ...updatedState,
      playerStatus: {
        ...updatedState.playerStatus,
        hp: Math.max(0, updatedState.playerStatus.hp - damage)
      },
      battleLogs: [...updatedState.battleLogs, {
        message: '🍖 空腹によりHPが減少した！',
        timestamp: Date.now()
      }]
    };

    if (updatedState.playerStatus.hp <= 0) {
      updatedState.isGameOver = true;
      return updatedState;
    }
  }

  // HPの自然回復
  if (updatedState.playerStatus.hp >= updatedState.playerStatus.maxHp) {
    return updatedState;
  }

  const healingRate = Math.max(0.2, updatedState.playerStatus.maxHp * 0.01);
  const newHealingPool = updatedState.healingPool + healingRate;

  if (newHealingPool >= 1) {
    const healAmount = Math.floor(newHealingPool);
    const newHp = Math.min(
      updatedState.playerStatus.maxHp,
      updatedState.playerStatus.hp + healAmount
    );

    return {
      ...updatedState,
      healingPool: newHealingPool - healAmount,
      playerStatus: {
        ...updatedState.playerStatus,
        hp: newHp
      }
    };
  }

  return { ...updatedState, healingPool: newHealingPool };
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
  inventory: {
    items: [],
    maxSize: 10
  },
  equipment: {
    weapon: null,
    armor: null
  },
  battleLogs: [],
  currentFloor: 1,
  isGameOver: false,
  isGameClear: false,
  healingPool: 0,
  turns: 1
};
};

export const movePlayer = (state: GameState, direction: Direction): GameState => {
  const { player, map, rooms, monsters, items, playerStatus } = state;
  const offset = getDirectionOffset(direction);
  const newX = player.x + offset.x;
  const newY = player.y + offset.y;
  // 斜め移動の場合、中間マスの確認
  if (offset.x !== 0 && offset.y !== 0) {
    const intermediate1 = map[player.y][player.x + offset.x];
    const intermediate2 = map[player.y + offset.y][player.x];
    if (!isWalkable(intermediate1) || !isWalkable(intermediate2)) {
      return state;
    }
  }

  if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) {
    return state;
  }

  const targetCell = map[newY][newX];
  if (!isWalkable(targetCell)) {
    return state;
  }

  const monster = findMonsterAtPosition(monsters, { x: newX, y: newY });
  if (monster && monster.isVisible) {
    const { updatedPlayerStatus, updatedMonster, logs } = processBattle(playerStatus, monster, state);

    const battleState = {
      ...state,
      playerStatus: updatedPlayerStatus,
      monsters: monsters.map(m => m === monster ? updatedMonster : m),
      battleLogs: [...state.battleLogs, ...logs]
    };

    if (updatedPlayerStatus.hp <= 0) {
      return { ...battleState, isGameOver: true };
    }

    const movedState = battleState;

    const { updatedState: finalState, logs: monsterLogs } = processMonsterTurn(movedState);
    return {
      ...finalState,
      battleLogs: [...finalState.battleLogs, ...monsterLogs]
    };
  }

  map[newY][newX].isVisible = true;

  // アイテムの取得チェック
  const item = items.find(i =>
    i.position !== null &&
    i.position.x === newX &&
    i.position.y === newY &&
    i.isVisible
  );
  if (item && state.inventory.items.length < state.inventory.maxSize) {
    // アイテムをインベントリに追加
    const pickedItem = { ...item, position: null };
    return {
      ...state,
      player: { x: newX, y: newY },
      items: items.filter(i => i !== item),
      inventory: {
        ...state.inventory,
        items: [...state.inventory.items, pickedItem]
      },
      battleLogs: [...state.battleLogs, {
        message: `${item.name}を拾った！`,
        timestamp: Date.now()
      }]
    };
  } else if (item) {
    // インベントリがいっぱいの場合
    return {
      ...state,
      battleLogs: [...state.battleLogs, {
        message: 'インベントリがいっぱいです！',
        timestamp: Date.now()
      }]
    };
  }

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
    return createNextFloor(map.length, map[0].length, nextFloor, playerStatus, state);
  }

  let movedState = {
    ...state,
    player: { x: newX, y: newY },
    turns: state.turns + 1  // ターン数を増やす
  };

  // 新しいモンスターの生成を試みる
  const newMonster = spawnNewMonster(movedState);
  if (newMonster) {
    movedState = {
      ...movedState,
      monsters: [...movedState.monsters, newMonster],
      battleLogs: [...movedState.battleLogs, {
        message: `新しい${newMonster.name}が出現した！`,
        timestamp: Date.now()
      }]
    };
  }

  const { updatedState: finalState, logs } = processMonsterTurn(movedState);
  
  // 移動後に自然回復を処理する
  return processNaturalHealing({
    ...finalState,
    battleLogs: [...finalState.battleLogs, ...logs]
  });
};
