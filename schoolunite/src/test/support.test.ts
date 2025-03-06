import { describe, it, expect, beforeEach } from 'vitest';
import { studentManager } from '../data/studentData';
import { Student, Gender, Class } from '../types/student';
import { ClubId } from '../types/club';

describe('Support System Tests', () => {
  const mockStudent1: Student = {
    id: 1,
    lastName: 'Test',
    firstName: 'Student1',
    gender: 0 as Gender,
    grade: 2,
    class: 'A' as Class,
    reputation: 1000,
    intelligence: 100,
    strength: 100,
    charisma: 100,
    traitIds: [1],
    traitPreferences: {
      glasses: 1,
      science: 1,
      literature: 1,
      athletic: 1,
      artistic: 1,
      leadership: 1,
      diligent: 1,
      rebellious: 1,
      cheerful: 1,
      quiet: 1,
    },
    interests: {
      study: 1,
      athletic: 1,
      video: 1,
      games: 1,
      fashion: 1,
      sns: 1,
      music: 1,
      love: 1,
    },
    support: {
      status_quo: 60,
      militar: 20,
      academic: 20,
    },
    faction: 'status_quo',
    isLeader: false,
    clubId: ClubId.NONE,
    currentHp: 100,
    maxHp: 100,
    friendship: 0
  };

  const mockStudent2: Student = {
    ...mockStudent1,
    id: 2,
    support: {
      status_quo: 20,
      militar: 60,
      academic: 20,
    },
    faction: 'militar'
  };

  beforeEach(() => {
    // @ts-expect-error -- private field access for testing
    studentManager.students = [{ ...mockStudent1 }, { ...mockStudent2 }];
    // @ts-expect-error -- private field access for testing
    studentManager.initialized = true;
  });

  describe('Support Update Tests', () => {
    it('正しく支持率が更新される', () => {
      studentManager.updateSupport(1, {
        status_quo: 70,
        militar: 10
      });

      const student = studentManager.getStudent(1);
      expect(student?.support).toEqual({
        status_quo: 70,
        militar: 10,
        academic: 20
      });
    });

    it('支持率の合計は100%になる', () => {
      studentManager.updateSupport(1, {
        status_quo: 80,
        militar: 40,
        academic: 30
      });

      const student = studentManager.getStudent(1);
      const total = student!.support.status_quo + 
                   student!.support.militar + 
                   student!.support.academic;
      expect(total).toBe(100);
    });

    it('負の値は0に補正される', () => {
      studentManager.updateSupport(1, {
        status_quo: -10,
        militar: 50
      });

      const student = studentManager.getStudent(1);
      expect(student?.support.status_quo).toBeGreaterThanOrEqual(0);
    });

    it('支持率に応じて派閥が更新される', () => {
      studentManager.updateSupport(1, {
        status_quo: 20,
        militar: 60,
        academic: 20
      });

      const student = studentManager.getStudent(1);
      expect(student?.faction).toBe('militar');
    });

    it('支持率の変更が永続的に保存される', () => {
      // 最初の更新
      studentManager.updateSupport(1, {
        status_quo: 70,
        militar: 20,
        academic: 10
      });

      // 2回目の更新
      studentManager.updateSupport(1, {
        status_quo: 60,
        militar: 30
      });

      const student = studentManager.getStudent(1);
      expect(student?.support).toEqual({
        status_quo: 60,
        militar: 30,
        academic: 10
      });
    });
  });
});