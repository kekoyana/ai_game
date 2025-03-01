import { Student } from '../types/student';
import { loadStudentsFromCSV } from '../utils/csvLoader';

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

  getStudent(id: string): Student | undefined {
    return this.students.find(student => student.id === id);
  }

  getLeaders(): Student[] {
    return this.students.filter(student => student.isLeader);
  }

  getFactionMembers(faction: string): Student[] {
    return this.students.filter(student => {
      const support = student.support;
      const maxSupport = Math.max(
        support.status_quo,
        support.sports,
        support.academic
      );
      
      switch (faction) {
        case 'status_quo':
          return support.status_quo === maxSupport;
        case 'sports':
          return support.sports === maxSupport;
        case 'academic':
          return support.academic === maxSupport;
        default:
          return false;
      }
    });
  }

  updateStudent(id: string, updates: Partial<Student>): void {
    const index = this.students.findIndex(student => student.id === id);
    if (index !== -1) {
      this.students[index] = { ...this.students[index], ...updates };
    }
  }

  // 評判の更新
  updateReputation(id: string, amount: number): void {
    const student = this.getStudent(id);
    if (student) {
      const newReputation = Math.max(0, Math.min(60000, student.reputation + amount));
      this.updateStudent(id, { reputation: newReputation });
    }
  }

  // 支持率の更新（合計が100になるように調整）
  updateSupport(id: string, updates: Partial<{ status_quo: number; sports: number; academic: number }>): void {
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

    this.updateStudent(id, { support: newSupport });
  }
}

export const studentManager = new StudentManager();