export class TimeManager {
  private currentTime: Date;
  private timeListeners: ((time: Date) => void)[] = [];
  private static INITIAL_DATE = new Date(2024, 8, 1, 8, 0); // 9/1 8:00

  constructor() {
    // 初期時刻を9/1午前8時に設定
    this.currentTime = new Date(TimeManager.INITIAL_DATE);
  }

  // 時間を進める
  // 翌日の8:00に進める
  advanceToNextDay() {
    const newTime = new Date(this.currentTime);
    newTime.setDate(newTime.getDate() + 1);
    newTime.setHours(8, 0, 0, 0);
    this.currentTime = newTime;
    this.notifyListeners();
  }

  // 次の平日の8:00に進める
  advanceToNextWeekday() {
    const newTime = new Date(this.currentTime);
    do {
      newTime.setDate(newTime.getDate() + 1);
    } while (newTime.getDay() === 0 || newTime.getDay() === 6);
    newTime.setHours(8, 0, 0, 0);
    this.currentTime = newTime;
    this.notifyListeners();
  }

  advanceTime(minutes: number) {
    const newTime = new Date(this.currentTime.getTime() + minutes * 60000);
    
    // 18:00以降は翌日の8:00に設定
    if (newTime.getHours() >= 18) {
      newTime.setDate(newTime.getDate() + 1);
      newTime.setHours(8, 0, 0, 0);
    }

    this.currentTime = newTime;
    this.notifyListeners();
  }

  // 現在時刻を取得
  getCurrentTime(): Date {
    return new Date(this.currentTime);
  }

  // 時刻をフォーマットして返す（MM/DD HH:mm）
  getFormattedTime(): string {
    const month = (this.currentTime.getMonth() + 1).toString();
    const day = this.currentTime.getDate().toString();
    const hours = this.currentTime.getHours().toString().padStart(2, '0');
    const minutes = this.currentTime.getMinutes().toString().padStart(2, '0');
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][this.currentTime.getDay()];
    return `${month}/${day}(${dayOfWeek}) ${hours}:${minutes}`;
  }

  // 学校が開いているかどうかを確認
  isSchoolOpen(): boolean {
    const day = this.currentTime.getDay();
    const hours = this.currentTime.getHours();
    
    // 土日は休み
    if (day === 0 || day === 6) return false;
    
    // 8:00-18:00の間のみ開校
    return hours >= 8 && hours < 18;
  }

  // 生徒の出現率を取得（0-1）
  getStudentPresenceRate(): number {
    if (!this.isSchoolOpen()) return 0;

    const hours = this.currentTime.getHours();
    const minutes = this.currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // 15:00以降は徐々に減少
    if (hours >= 15) {
      const remainingMinutes = (18 * 60) - totalMinutes; // 18:00までの残り分
      return Math.max(0, remainingMinutes / (3 * 60)); // 3時間で徐々に減少
    }

    return 1;
  }

  // 時間変更リスナーを追加
  addTimeListener(listener: (time: Date) => void) {
    this.timeListeners.push(listener);
  }

  // リスナーを削除
  removeTimeListener(listener: (time: Date) => void) {
    this.timeListeners = this.timeListeners.filter(l => l !== listener);
  }

  // 全てのリスナーに通知
  private notifyListeners() {
    const time = this.getCurrentTime();
    this.timeListeners.forEach(listener => listener(time));
  }

  // 時刻をリセット
  reset() {
    this.currentTime = new Date();
    this.currentTime.setHours(8, 0, 0, 0);
    this.notifyListeners();
  }
}

// シングルトンインスタンスをエクスポート
export const timeManager = new TimeManager();