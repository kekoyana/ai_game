import { Room, RoomType, Floor } from '../types/school';

const createRoom = (
  id: string,
  name: string,
  type: RoomType,
  floor: Floor,
  x: number,
  y: number,
  width: number = 1,
  height: number = 1,
  targetFloor?: Floor
): Room => ({
  id,
  name,
  type,
  floor,
  x,
  y,
  width,
  height,
  targetFloor,
});

export const schoolRooms: Room[] = [
  // 1階
  createRoom('staff', '職員室', 'staffroom', 1, 0, 0, 2, 2),
  createRoom('principal', '校長室', 'principalroom', 1, 2, 0),
  createRoom('infirmary', '保健室', 'infirmary', 1, 3, 0),
  createRoom('1a', '1-A', 'classroom', 1, 0, 2),
  createRoom('1b', '1-B', 'classroom', 1, 1, 2),
  createRoom('1c', '1-C', 'classroom', 1, 2, 2),
  createRoom('1d', '1-D', 'classroom', 1, 3, 2),
  createRoom('corridor1', '1階廊下', 'corridor', 1, 0, 1, 5, 1),
  createRoom('upstairs1', '上り階段', 'upstairs', 1, 4, 0, 1, 1, 2),
  createRoom('entrance', '昇降口', 'entrance', 1, 4, 2, 1, 1),

  // 2階
  createRoom('2a', '2-A', 'classroom', 2, 0, 2),
  createRoom('2b', '2-B', 'classroom', 2, 1, 2),
  createRoom('2c', '2-C', 'classroom', 2, 2, 2),
  createRoom('2d', '2-D', 'classroom', 2, 3, 2),
  createRoom('science', '理科室', 'sciencelab', 2, 0, 0, 2, 1),
  createRoom('music', '音楽室', 'musicroom', 2, 2, 0, 2, 1),
  createRoom('library', '図書室', 'library', 2, 4, 2, 2, 1),
  createRoom('corridor2', '2階廊下', 'corridor', 2, 0, 1, 5, 1),
  createRoom('upstairs2', '上り階段', 'upstairs', 2, 4, 0, 1, 1, 3),
  createRoom('downstairs2', '下り階段', 'downstairs', 2, 4, 1, 1, 1, 1),

  // 3階
  createRoom('3a', '3-A', 'classroom', 3, 0, 2),
  createRoom('3b', '3-B', 'classroom', 3, 1, 2),
  createRoom('3c', '3-C', 'classroom', 3, 2, 2),
  createRoom('3d', '3-D', 'classroom', 3, 3, 2),
  createRoom('tech', '技術室', 'techlab', 3, 0, 0, 2, 1),
  createRoom('home', '家庭科室', 'homeeclab', 3, 2, 0, 2, 1),
  createRoom('av', '視聴覚室', 'avroom', 3, 4, 2, 2, 1),
  createRoom('computer', 'コンピューター室', 'computerlab', 3, 4, 0, 2, 1),
  createRoom('broadcast', '放送室', 'broadcastroom', 3, 5, 1),
  createRoom('corridor3', '3階廊下', 'corridor', 3, 0, 1, 5, 1),
  createRoom('downstairs3', '下り階段', 'downstairs', 3, 4, 1, 1, 1, 2),

  // 校庭エリア
  createRoom('ground', 'グラウンド', 'ground', 'ground', 0, 0, 4, 3),
  createRoom('tennis', 'テニスコート', 'tenniscourt', 'ground', 4, 0, 2, 2),
  createRoom('gym', '体育館', 'gymnasium', 'ground', 0, 3, 2, 1),
  createRoom('pool', 'プール', 'pool', 'ground', 2, 3, 2, 1),
  createRoom('dojo', '武道場', 'dojo', 'ground', 4, 2, 2, 1),
  createRoom('schoolgate', '正門', 'schoolgate', 'ground', 3, 4, 1, 1),
];