import { ClubId } from './club';
import { Room } from './school';
import { Student } from './student';

// 部活動と関連する場所のマッピング
export const CLUB_LOCATIONS: { [key in ClubId]: string[] } = {
  [ClubId.NONE]: [],
  [ClubId.BASEBALL]: ['ground'],
  [ClubId.SOCCER]: ['ground'],
  [ClubId.ART]: ['art'],
  [ClubId.LIBRARY]: ['library'],
};

// 特別な場所の配置確率（％）
export const LOCATION_PROBABILITIES = {
  CLASSROOM: 70,      // 自分の教室にいる確率
  CLUB_LOCATION: 20,  // 部活動関連の場所にいる確率
  RANDOM: 10,         // その他の場所にいる確率
};

// 立ち入り可能な場所のリスト（ランダム配置用）
export const RANDOM_LOCATIONS = [
  'corridor1',
  'corridor2',
  'corridor3',
  'ground',
  'infirmary',
  'library',
  'art',
  'music',
  'computer',
  'tech',
  'science',
];

// 生徒の現在位置を表す型
export interface StudentLocation {
  student: Student;
  roomId: string;
}

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
    const clubLocations = CLUB_LOCATIONS[student.clubId];
    if (clubLocations.length > 0) {
      return clubLocations[Math.floor(Math.random() * clubLocations.length)];
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