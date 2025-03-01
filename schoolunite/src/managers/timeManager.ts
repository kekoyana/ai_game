export class TimeManager {
  private currentTime: Date;
  private timeListeners: ((time: Date) => void)[] = [];

  constructor() {
    // 初期時刻を午前8時に設定
    this.currentTime = new Date();
    this.currentTime.setHours(8, 0, 0, 0);
  }

  // 時間を進める
  advanceTime(minutes: number) {
    this.currentTime = new Date(this.currentTime.getTime() + minutes * 60000);
    this.notifyListeners();
  }

  // 現在時刻を取得
  getCurrentTime(): Date {
    return new Date(this.currentTime);
  }

  // 時刻をフォーマットして返す（HH:mm）
  getFormattedTime(): string {
    const hours = this.currentTime.getHours().toString().padStart(2, '0');
    const minutes = this.currentTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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