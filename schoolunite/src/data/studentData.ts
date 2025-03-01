import { Student, FactionSupport, Faction, InterestLevel, PreferenceLevel, TraitPreferences, TraitId } from '../types/student';
import { ClubId, CLUB_DATA } from '../types/club';
import { loadStudentsFromCSV } from '../utils/csvLoader';

function determineFaction(support: FactionSupport): Faction {
  const maxSupport = Math.max(
    support.status_quo,
    support.sports,
    support.academic
  );
  
  if (maxSupport === support.status_quo) return 'status_quo';
  if (maxSupport === support.sports) return 'sports';
  return 'academic';
}

class StudentManager {
  private students: Student[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.students = await loadStudentsFromCSV();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize student data:', error);
      throw error;
    }
  }

  getAllStudents(): Student[] {
    if (!this.initialized) {
      throw new Error('StudentManager is not initialized');
    }
    return [...this.students];
  }

  getStudent(id: number): Student | undefined {
    return this.students.find(student => student.id === id);
  }

  getLeaders(): Student[] {
    return this.students.filter(student => student.isLeader);
  }

  getFactionMembers(faction: Faction): Student[] {
    return this.students.filter(student => student.faction === faction);
  }

  // 部活動関連の機能

  // 部活動のメンバー取得
  getClubMembers(clubId: ClubId): Student[] {
    return this.students.filter(student => student.clubId === clubId);
  }

  // 部活動の定員チェック
  isClubFull(clubId: ClubId): boolean {
    if (clubId === ClubId.NONE) return false;
    const club = CLUB_DATA[clubId];
    const currentMembers = this.getClubMembers(clubId).length;
    return currentMembers >= club.memberLimit;
  }

  // 部活動変更
  changeClub(studentId: number, newClubId: ClubId): boolean {
    const student = this.getStudent(studentId);
    if (!student) return false;

    // 無所属以外の場合、定員チェック
    if (newClubId !== ClubId.NONE && this.isClubFull(newClubId)) {
      return false;
    }

    this.updateStudent(studentId, { clubId: newClubId });
    return true;
  }

  // 部活動退部
  leaveClub(studentId: number): boolean {
    return this.changeClub(studentId, ClubId.NONE);
  }

  // 学生データの更新（派閥の自動更新含む）
  updateStudent(id: number, updates: Partial<Student>): void {
    const index = this.students.findIndex(student => student.id === id);
    if (index === -1) return;

    const currentStudent = this.students[index];
    const updatedStudent = { ...currentStudent, ...updates };

    // 支持率が更新された場合、派閥も自動更新
    if (updates.support) {
      updatedStudent.faction = determineFaction(updatedStudent.support);
    }

    this.students[index] = updatedStudent;
  }

  // 評判の更新
  updateReputation(id: number, amount: number): void {
    const student = this.getStudent(id);
    if (student) {
      const newReputation = Math.max(0, Math.min(60000, student.reputation + amount));
      this.updateStudent(id, { reputation: newReputation });
    }
  }

  // 支持率の更新（合計が100になるように調整）
  updateSupport(id: number, updates: Partial<FactionSupport>): void {
    const student = this.getStudent(id);
    if (!student) return;

    const currentSupport = student.support;
    const newSupport = { ...currentSupport, ...updates };
    
    // 合計を計算
    const total = newSupport.status_quo + newSupport.sports + newSupport.academic;
    
    // 100%に正規化
    if (total > 0) {
      newSupport.status_quo = Math.round((newSupport.status_quo / total) * 100);
      newSupport.sports = Math.round((newSupport.sports / total) * 100);
      newSupport.academic = 100 - newSupport.status_quo - newSupport.sports;
    }

    this.updateStudent(id, { 
      support: newSupport,
      // 支持率の変更に応じて派閥も自動更新
      faction: determineFaction(newSupport)
    });
  }

  // 属性に対する好みの更新
  updateTraitPreferences(id: number, updates: Partial<TraitPreferences>): void {
    const student = this.getStudent(id);
    if (!student) return;

    const newPreferences = { ...student.traitPreferences, ...updates };
    this.updateStudent(id, { traitPreferences: newPreferences });
  }

  // 特定の属性に対する好みの更新
  updateTraitPreference(id: number, traitId: TraitId, level: PreferenceLevel): void {
    const student = this.getStudent(id);
    if (!student) return;

    const traitKey = TraitId[traitId].toLowerCase() as keyof TraitPreferences;
    const updates = { [traitKey]: level } as Partial<TraitPreferences>;
    this.updateTraitPreferences(id, updates);
  }

  // 興味関心レベルの更新
  updateInterests(id: number, 
    updates: Partial<{
      study: InterestLevel;
      sports: InterestLevel;
      video: InterestLevel;
      games: InterestLevel;
      fashion: InterestLevel;
      sns: InterestLevel;
      music: InterestLevel;
      love: InterestLevel;
    }>
  ): void {
    const student = this.getStudent(id);
    if (!student) return;

    const newInterests = { ...student.interests, ...updates };
    this.updateStudent(id, { interests: newInterests });
  }

  // 属性の追加
  addTrait(id: number, traitId: number): void {
    const student = this.getStudent(id);
    if (!student) return;

    if (!student.traitIds.includes(traitId)) {
      const newTraits = [...student.traitIds, traitId];
      this.updateStudent(id, { traitIds: newTraits });
    }
  }

  // 属性の削除
  removeTrait(id: number, traitId: number): void {
    const student = this.getStudent(id);
    if (!student) return;

    const newTraits = student.traitIds.filter(t => t !== traitId);
    this.updateStudent(id, { traitIds: newTraits });
  }

  // 特定の属性を持つ生徒を好む生徒を取得
  getStudentsWhoLike(traitId: TraitId): Student[] {
    const traitKey = TraitId[traitId].toLowerCase() as keyof TraitPreferences;
    return this.students.filter(student => student.traitPreferences[traitKey] === 2);
  }

  // 特定の属性を持つ生徒を嫌う生徒を取得
  getStudentsWhoDislike(traitId: TraitId): Student[] {
    const traitKey = TraitId[traitId].toLowerCase() as keyof TraitPreferences;
    return this.students.filter(student => student.traitPreferences[traitKey] === 0);
  }

  // 部活動の推奨度を計算（生徒の特性と部活動の親和性）
  calculateClubCompatibility(studentId: number, clubId: ClubId): number {
    const student = this.getStudent(studentId);
    if (!student || clubId === ClubId.NONE) return 0;

    const club = CLUB_DATA[clubId];
    let score = 0;

    // スポーツ系部活の場合
    if (club.type === 'sports') {
      score += student.interests.sports * 20; // 運動への興味
      score += student.strength; // 体力
      if (student.traitIds.includes(TraitId.ATHLETIC)) score += 30; // 運動系の特性
    }
    // 文化系部活の場合
    else if (club.type === 'culture') {
      score += student.interests.music * 10; // 音楽への興味
      score += student.interests.study * 10; // 学習への興味
      if (student.traitIds.includes(TraitId.ARTISTIC)) score += 30; // 芸術系の特性
    }
    // 委員会の場合
    else if (club.type === 'committee') {
      score += student.intelligence; // 知力
      if (student.traitIds.includes(TraitId.DILIGENT)) score += 30; // 真面目な特性
    }

    return Math.min(100, score);
  }
}

export const studentManager = new StudentManager();