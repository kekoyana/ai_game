import { Student, FactionSupport, Faction, InterestLevel, PreferenceLevel, TraitPreferences, TraitId } from '../types/student';
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

  // HP関連の機能

  // HPを減少させる
  damageStudent(id: number, amount: number): boolean {
    const student = this.getStudent(id);
    if (!student) return false;

    const newHp = Math.max(0, student.currentHp - amount);
    this.updateStudent(id, { currentHp: newHp });
    
    return true;
  }

  // HPを回復する
  healStudent(id: number, amount: number): boolean {
    const student = this.getStudent(id);
    if (!student) return false;

    const newHp = Math.min(student.maxHp, student.currentHp + amount);
    this.updateStudent(id, { currentHp: newHp });
    
    return true;
  }

  // HPを完全回復する
  fullHealStudent(id: number): boolean {
    const student = this.getStudent(id);
    if (!student) return false;

    this.updateStudent(id, { currentHp: student.maxHp });
    return true;
  }

  // HPが0かどうかチェック
  isDefeated(id: number): boolean {
    const student = this.getStudent(id);
    return student ? student.currentHp <= 0 : false;
  }

  // HP割合を取得（0-100）
  getHpPercentage(id: number): number {
    const student = this.getStudent(id);
    if (!student) return 0;
    
    return Math.round((student.currentHp / student.maxHp) * 100);
  }

  // 基本機能

  getLeaders(): Student[] {
    return this.students.filter(student => student.isLeader);
  }

  getFactionMembers(faction: Faction): Student[] {
    return this.students.filter(student => student.faction === faction);
  }

  updateStudent(id: number, updates: Partial<Student>): void {
    const index = this.students.findIndex(student => student.id === id);
    if (index === -1) return;

    const currentStudent = this.students[index];
    const updatedStudent = { ...currentStudent, ...updates };

    if (updates.support) {
      updatedStudent.faction = determineFaction(updatedStudent.support);
    }

    this.students[index] = updatedStudent;
  }

  updateReputation(id: number, amount: number): void {
    const student = this.getStudent(id);
    if (student) {
      const newReputation = Math.max(0, Math.min(60000, student.reputation + amount));
      this.updateStudent(id, { reputation: newReputation });
    }
  }

  updateSupport(id: number, updates: Partial<FactionSupport>): void {
    const student = this.getStudent(id);
    if (!student) return;

    const currentSupport = student.support;
    const newSupport = { ...currentSupport, ...updates };
    
    const total = newSupport.status_quo + newSupport.sports + newSupport.academic;
    
    if (total > 0) {
      newSupport.status_quo = Math.round((newSupport.status_quo / total) * 100);
      newSupport.sports = Math.round((newSupport.sports / total) * 100);
      newSupport.academic = 100 - newSupport.status_quo - newSupport.sports;
    }

    this.updateStudent(id, { 
      support: newSupport,
      faction: determineFaction(newSupport)
    });
  }

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

  updateTraitPreferences(id: number, updates: Partial<TraitPreferences>): void {
    const student = this.getStudent(id);
    if (!student) return;

    const newPreferences = { ...student.traitPreferences, ...updates };
    this.updateStudent(id, { traitPreferences: newPreferences });
  }

  updateTraitPreference(id: number, traitId: TraitId, level: PreferenceLevel): void {
    const student = this.getStudent(id);
    if (!student) return;

    const traitKey = TraitId[traitId].toLowerCase() as keyof TraitPreferences;
    const updates = { [traitKey]: level } as Partial<TraitPreferences>;
    this.updateTraitPreferences(id, updates);
  }

  addTrait(id: number, traitId: number): void {
    const student = this.getStudent(id);
    if (!student) return;

    if (!student.traitIds.includes(traitId)) {
      const newTraits = [...student.traitIds, traitId];
      this.updateStudent(id, { traitIds: newTraits });
    }
  }

  removeTrait(id: number, traitId: number): void {
    const student = this.getStudent(id);
    if (!student) return;

    const newTraits = student.traitIds.filter(t => t !== traitId);
    this.updateStudent(id, { traitIds: newTraits });
  }

  getStudentsWhoLike(traitId: TraitId): Student[] {
    const traitKey = TraitId[traitId].toLowerCase() as keyof TraitPreferences;
    return this.students.filter(student => student.traitPreferences[traitKey] === 2);
  }

  getStudentsWhoDislike(traitId: TraitId): Student[] {
    const traitKey = TraitId[traitId].toLowerCase() as keyof TraitPreferences;
    return this.students.filter(student => student.traitPreferences[traitKey] === 0);
  }
}

export const studentManager = new StudentManager();