import { Student, FactionSupport, Faction, InterestLevel } from '../types/student';
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
}

export const studentManager = new StudentManager();