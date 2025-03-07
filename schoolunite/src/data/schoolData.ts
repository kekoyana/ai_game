import { Room, RoomType, Floor, AccessLevel } from '../types/school';

const createRoom = (
  id: string,
  name: string,
  type: RoomType,
  floor: Floor,
  x: number,
  y: number,
  width: number = 1,
  height: number = 1,
  accessLevel: AccessLevel = AccessLevel.FREE,
  targetFloor?: Floor,
  requiredFromCorridor: boolean = true
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
  accessLevel,
  requiredFromCorridor
});

export const schoolRooms: Room[] = [
  // 屋上
  createRoom('roof', '屋上', 'roof', 'roof', 1, 0, 4, 3, AccessLevel.FREE, undefined, false),
  createRoom('roof_downstairs', '下り階段', 'downstairs', 'roof', 0, 1, 1, 1, AccessLevel.FREE, 3),

  // 3階
  createRoom('corridor3', '3階廊下', 'corridor', 3, 0, 2, 7, 1, AccessLevel.FREE, undefined, false),
  createRoom('upstairs3', '上り階段', 'upstairs', 3, 0, 1, 1, 1, AccessLevel.FREE, 'roof'),
  createRoom('downstairs3', '下り階段', 'downstairs', 3, 0, 3, 1, 1, AccessLevel.FREE, 2),
  createRoom('3a', '3-A', 'classroom', 3, 1, 1),
  createRoom('3b', '3-B', 'classroom', 3, 2, 1),
  createRoom('3c', '3-C', 'classroom', 3, 3, 1),
  createRoom('3d', '3-D', 'classroom', 3, 4, 1),
  createRoom('tech', '技術室', 'techlab', 3, 1, 3, 2, 1),
  createRoom('art', '美術室', 'artroom', 3, 3, 3, 2, 1),
  createRoom('computer', 'コンピューター室', 'computerlab', 3, 5, 1, 2, 1),
  createRoom('broadcast', '放送室', 'broadcastroom', 3, 5, 3),
  createRoom('student_council', '生徒会室', 'student_council', 3, 6, 3, 1, 1, AccessLevel.FREE),

  // 2階
  createRoom('corridor2', '2階廊下', 'corridor', 2, 0, 2, 7, 1, AccessLevel.FREE, undefined, false),
  createRoom('upstairs2', '上り階段', 'upstairs', 2, 0, 1, 1, 1, AccessLevel.FREE, 3),
  createRoom('downstairs2', '下り階段', 'downstairs', 2, 0, 3, 1, 1, AccessLevel.FREE, 1),
  createRoom('2a', '2-A', 'classroom', 2, 1, 1),
  createRoom('2b', '2-B', 'classroom', 2, 2, 1),
  createRoom('2c', '2-C', 'classroom', 2, 3, 1),
  createRoom('2d', '2-D', 'classroom', 2, 4, 1),
  createRoom('science', '理科室', 'sciencelab', 2, 1, 3, 2, 1),
  createRoom('homeec', '家庭科室', 'homeeclab', 2, 3, 3, 2, 1),
  createRoom('music', '音楽室', 'musicroom', 2, 5, 3, 2, 1),
  createRoom('library', '図書室', 'library', 2, 5, 1, 2, 1),

  // 1階
  createRoom('corridor1', '1階廊下', 'corridor', 1, 0, 2, 7, 1, AccessLevel.FREE, undefined, false),
  createRoom('upstairs1', '上り階段', 'upstairs', 1, 0, 1, 1, 1, AccessLevel.FREE, 2),
  createRoom('entrance', '昇降口', 'entrance', 1, 0, 3, 1, 1, AccessLevel.FREE, 'ground', false),
  createRoom('1a', '1-A', 'classroom', 1, 1, 1),
  createRoom('1b', '1-B', 'classroom', 1, 2, 1),
  createRoom('1c', '1-C', 'classroom', 1, 3, 1),
  createRoom('1d', '1-D', 'classroom', 1, 4, 1),
  createRoom('staff', '職員室', 'staffroom', 1, 5, 1, 2, 1, AccessLevel.RESTRICTED),
  createRoom('guidance', '生徒指導室', 'guidance_room', 1, 3, 3, 2, 1, AccessLevel.FREE),
  createRoom('principal', '校長室', 'principalroom', 1, 5, 3, 2, 1, AccessLevel.FORBIDDEN),
  createRoom('infirmary', '保健室', 'infirmary', 1, 1, 3, 2, 1, AccessLevel.RESTRICTED),

  // 校庭エリア
  createRoom('ground', 'グラウンド', 'ground', 'ground', 0, 0, 4, 3, AccessLevel.FREE, undefined, false),
  createRoom('tennis', 'テニスコート', 'tenniscourt', 'ground', 4, 0, 2, 2, AccessLevel.FREE, undefined, false),
  createRoom('baseball', '野球場', 'baseball_field', 'ground', 6, 0, 2, 2, AccessLevel.FREE, undefined, false),
  createRoom('gym', '体育館', 'gymnasium', 'ground', 0, 3, 2, 1, AccessLevel.FREE, undefined, false),
  createRoom('pool', 'プール', 'pool', 'ground', 2, 3, 2, 1, AccessLevel.FREE, undefined, false),
  createRoom('dojo', '武道場', 'dojo', 'ground', 4, 2, 2, 1, AccessLevel.FREE, undefined, false),
  createRoom('behind_gym', '体育館裏', 'behind_gym', 'ground', 0, 4, 2, 1, AccessLevel.FREE, undefined, false),
  createRoom('schoolgate', '正門', 'schoolgate', 'ground', 3, 4, 1, 1, AccessLevel.FREE, 1, false),
];