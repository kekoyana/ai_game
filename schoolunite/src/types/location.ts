import { ClubId, CLUB_DATA } from './club';
import { Room } from './school';
import { Student } from './student';

// 生徒の現在位置を表す型
export interface StudentLocation {
  student: Student;
  roomId: string;
}

// 特別な場所の配置確率（％）
export const LOCATION_PROBABILITIES = {
  CLASSROOM: 60,      // 自分の教室にいる確率
  CLUB_LOCATION: 30,  // 部活動関連の場所にいる確率（増加）
  RANDOM: 10,         // その他の場所にいる確率
};

// 立ち入り可能な場所のリスト（ランダム配置用）
export const RANDOM_LOCATIONS = [
  'corridor1',
  'corridor2',
  'corridor3',
  'ground',
  'library',
  'infirmary',
  'student_council'
];

// 教室IDを生成する関数（例：2年B組 → "2b"）
export function getClassroomId(grade: number, class_: string): string {
  return `${grade}${class_.toLowerCase()}`;
}

// 生徒の配置場所を決定する関数
export function determineLocation(student: Student, rooms: Room[]): string {
  // デフォルトの教室ID
  const defaultClassroom = getClassroomId(student.grade, student.class);

  // ランダムな確率を生成（0-100）
  const random = Math.random() * 100;

  // 教室にいる確率
  if (random < LOCATION_PROBABILITIES.CLASSROOM) {
    return defaultClassroom;
  }

  // 部活動関連の場所にいる確率
  if (random < LOCATION_PROBABILITIES.CLASSROOM + LOCATION_PROBABILITIES.CLUB_LOCATION) {
    const clubData = CLUB_DATA[student.clubId];
    if (clubData && clubData.baseRoomId) {
      // 部活動の拠点に配置
      return clubData.baseRoomId;
    }
  }

  // それ以外はランダムな場所
  return RANDOM_LOCATIONS[Math.floor(Math.random() * RANDOM_LOCATIONS.length)];
}

// 部屋ごとの生徒リストを生成
export function groupStudentsByRoom(locations: StudentLocation[]): { [roomId: string]: Student[] } {
  const result: { [roomId: string]: Student[] } = {};
  
  for (const location of locations) {
    if (!result[location.roomId]) {
      result[location.roomId] = [];
    }
    result[location.roomId].push(location.student);
  }
  
  return result;
}