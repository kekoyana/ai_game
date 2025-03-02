import { Student, FactionSupport, Faction, InterestLevel, PreferenceLevel, TraitPreferences, TraitId } from '../types/student';
import { loadStudentsFromCSV } from '../utils/csvLoader';

// 主人公のID
export const PLAYER_ID = 1;

function determineFaction(support: FactionSupport): Faction {
  const maxSupport = Math.max(
    support.status_quo,
    support.militar,
    support.academic
  );
  
  if (maxSupport === support.status_quo) return 'status_quo';
  if (maxSupport === support.militar) return 'militar';
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

  getPlayer(): Student | undefined {
    return this.getStudent(PLAYER_ID);
  }

  // 親密度に関する機能

  // 親密度を増加させる（最大100）
  increaseFriendship(targetId: number, amount: number): void {
    const student = this.getStudent(targetId);
    if (!student) return;

    // 自分自身との親密度は変更しない
    if (targetId === PLAYER_ID) return;

    // 相性に基づいて増加量を調整
    const adjustedAmount = this.calculateAdjustedFriendshipIncrease(student, amount);
    const newFriendship = Math.min(100, student.friendship + adjustedAmount);
    
    this.updateStudent(targetId, { friendship: newFriendship });
  }

  // 相性に基づいて親密度の増加量を調整
  private calculateAdjustedFriendshipIncrease(student: Student, baseAmount: number): number {
    const affinityMultiplier = 1 + (student.affinity / 100); // -50%～+50%の範囲で調整
    return Math.round(baseAmount * affinityMultiplier);
  }

  // HP関連の機能

  damageStudent(id: number, amount: number): boolean {
    const student = this.getStudent(id);
    if (!student) return false;

    const newHp = Math.max(0, student.currentHp - amount);
    this.updateStudent(id, { currentHp: newHp });
    
    return true;
  }

  healStudent(id: number, amount: number): boolean {
    const student = this.getStudent(id);
    if (!student) return false;

    const newHp = Math.min(student.maxHp, student.currentHp + amount);
    this.updateStudent(id, { currentHp: newHp });
    
    return true;
  }

  fullHealStudent(id: number): boolean {
    const student = this.getStudent(id);
    if (!student) return false;

    this.updateStudent(id, { currentHp: student.maxHp });
    return true;
  }

  isDefeated(id: number): boolean {
    const student = this.getStudent(id);
    return student ? student.currentHp <= 0 : false;
  }

  getHpPercentage(id: number): number {
    const student = this.getStudent(id);
    if (!student) return 0;
    
    return Math.round((student.currentHp / student.maxHp) * 100);
  }

  // その他の機能

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

    // friendship値の範囲を0-100に制限
    if (updates.friendship !== undefined) {
      updatedStudent.friendship = Math.max(0, Math.min(100, updates.friendship));
    }

    this.students[index] = updatedStudent;
  }

  updateSupport(id: number, updates: Partial<FactionSupport>): void {
    const student = this.getStudent(id);
    if (!student) return;

    const currentSupport = student.support;
    const newSupport = { ...currentSupport, ...updates };
    
    const total = newSupport.status_quo + newSupport.militar + newSupport.academic;
    
    if (total > 0) {
      newSupport.status_quo = Math.round((newSupport.status_quo / total) * 100);
      newSupport.militar = Math.round((newSupport.militar / total) * 100);
      newSupport.academic = 100 - newSupport.status_quo - newSupport.militar;
    }

    this.updateStudent(id, { 
      support: newSupport,
      faction: determineFaction(newSupport)
    });
  }

  updateInterests(id: number, 
    updates: Partial<{
      study: InterestLevel;
      athletic: InterestLevel;
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
}

export const studentManager = new StudentManager();