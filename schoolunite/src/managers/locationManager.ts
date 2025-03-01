import { Student } from '../types/student';
import { determineLocation, StudentLocation, groupStudentsByRoom } from '../types/location';
import { schoolRooms } from '../data/schoolData';

class LocationManager {
  private locations: StudentLocation[] = [];
  private updateInterval: number | null = null;

  // 生徒の場所を更新
  updateLocations(students: Student[]) {
    this.locations = students.map(student => ({
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

  // 定期的な位置更新を開始
  startPeriodicUpdate(students: Student[], intervalSeconds: number = 300) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // 初回更新
    this.updateLocations(students);

    // 定期更新を設定
    this.updateInterval = window.setInterval(() => {
      this.updateLocations(students);
    }, intervalSeconds * 1000);
  }

  // 定期更新を停止
  stopPeriodicUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
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