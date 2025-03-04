import { Student } from '../types/student';
import { determineLocation, StudentLocation, groupStudentsByRoom } from '../types/location';
import { schoolRooms } from '../data/schoolData';
import { timeManager } from './timeManager';

class LocationManager {
  private locations: StudentLocation[] = [];
  private students: Student[] = [];

  // 生徒の場所を更新
  updateLocations(students: Student[]) {
    // 学校が閉まっている場合は生徒を配置しない
    if (!timeManager.isSchoolOpen()) {
      this.locations = [];
      return;
    }

    // 出現率に基づいて生徒をフィルタリング
    const presenceRate = timeManager.getStudentPresenceRate();
    const presentStudents = students.filter(student => {
      // 主人公は除外
      if (student.id === 1) return false;
      // ランダムに生徒を選択（出現率に基づく）
      return Math.random() < presenceRate;
    });

    // 位置情報を更新
    this.locations = presentStudents.map(student => ({
      student,
      roomId: determineLocation(student, schoolRooms),
    }));
  }

  // 特定の部屋にいる生徒を取得
  getStudentsInRoom(roomId: string): Student[] {
    return this.locations
      .filter(location => location.roomId === roomId)
      .map(location => location.student);
  }

  // 全ての部屋の生徒リストを取得
  getAllLocations(): { [roomId: string]: Student[] } {
    return groupStudentsByRoom(this.locations);
  }

  // 生徒の移動更新を開始
  startPeriodicUpdate(students: Student[]) {
    this.students = students;
    
    // 初回更新
    this.updateLocations(students);

    // ゲーム内時間の変更を監視
    timeManager.addTimeListener(() => {
      this.updateLocations(this.students);
    });
  }

  // 更新を停止
  stopPeriodicUpdate() {
    this.students = [];
  }

  // 生徒の現在位置を取得
  getStudentLocation(studentId: number): string | null {
    const location = this.locations.find(loc => loc.student.id === studentId);
    return location ? location.roomId : null;
  }

  // 特定の生徒の位置を強制的に設定
  setStudentLocation(studentId: number, roomId: string) {
    const index = this.locations.findIndex(loc => loc.student.id === studentId);
    if (index !== -1) {
      this.locations[index].roomId = roomId;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const locationManager = new LocationManager();