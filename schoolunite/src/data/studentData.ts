import { Student, FactionSupport, Faction, InterestLevel, PreferenceLevel, TraitPreferences, TraitId } from '../types/student';
import { loadStudentsFromCSV } from '../utils/csvLoader';
import { classManager } from '../managers/classManager';

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
      classManager.initialize(this.students);
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
  increaseFriendship(targetId: number): { amount: number, newFriendship: number } {
    const student = this.getStudent(targetId);
    if (!student) return { amount: 0, newFriendship: 0 };

    // 自分自身との親密度は変更しない
    if (targetId === PLAYER_ID) return { amount: 0, newFriendship: student.friendship };

    // 相性に基づいて増加量を計算
    const adjustedAmount = this.calculateAdjustedFriendshipIncrease(student);
    const newFriendship = Math.min(100, student.friendship + adjustedAmount);
    
    this.updateStudent(targetId, { friendship: newFriendship });
    
    return {
      amount: adjustedAmount,
      newFriendship: newFriendship
    };
  }

  // 相性を計算（興味の一致度、派閥一致、属性の好き嫌いを考慮）
  private calculateCompatibility(target: Student): number {
    const player = this.getPlayer();
    if (!player) return 1.0;

    let compatibility = 1.0;

    // 1. 派閥一致のボーナス
    if (player.faction === target.faction) {
      compatibility += 0.2; // 派閥一致で20%ボーナス
    }

    // 2. 興味の一致度を計算
    let matchingInterests = 0;
    let totalInterests = 0;
    Object.entries(player.interests).forEach(([key, value]) => {
      const targetValue = target.interests[key as keyof typeof target.interests];
      if (value === targetValue && value > 0) {
        matchingInterests++;
      }
      if (value > 0 || targetValue > 0) {
        totalInterests++;
      }
    });
    if (totalInterests > 0) {
      const interestMatch = matchingInterests / totalInterests;
      compatibility += interestMatch * 0.3; // 興味完全一致で30%ボーナス
    }

    // 3. 属性による好き嫌いの影響
    let traitEffect = 0;
    player.traitIds.forEach(traitId => {
      const traitKey = TraitId[traitId].toLowerCase() as keyof TraitPreferences;
      const preference = target.traitPreferences[traitKey];
      if (preference === 2) { // 好き
        traitEffect += 0.1;
      } else if (preference === 0) { // 嫌い
        traitEffect -= 0.1;
      }
    });
    compatibility += traitEffect;

    // 最低0.5倍、最大2.0倍に制限
    return Math.max(0.5, Math.min(2.0, compatibility));
  }

  // 親密度の増加量を計算
  private calculateFriendshipIncrease(): number {
    // 基本値3-15の範囲でランダム
    return Math.floor(Math.random() * 13) + 3;
  }

  // 相性に基づいて親密度の増加量を調整
  private calculateAdjustedFriendshipIncrease(student: Student): number {
    const baseIncrease = this.calculateFriendshipIncrease();
    const compatibility = this.calculateCompatibility(student);
    return Math.round(baseIncrease * compatibility);
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