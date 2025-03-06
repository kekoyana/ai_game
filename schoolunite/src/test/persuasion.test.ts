import { describe, it, expect, beforeEach } from 'vitest';
import { studentManager } from '../data/studentData';
import { Student, Gender, Class } from '../types/student';
import { ClubId } from '../types/club';

describe('Persuasion System Tests', () => {
  const mockPlayer: Student = {
    id: 1,
    lastName: 'Player',
    firstName: 'Test',
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

  const mockTarget: Student = {
    ...mockPlayer,
    id: 2,
    lastName: 'Target',
    support: {
      status_quo: 20,
      militar: 60,
      academic: 20,
    },
    faction: 'militar'
  };

  beforeEach(() => {
    // @ts-expect-error -- private field access for testing
    studentManager.students = [{ ...mockPlayer }, { ...mockTarget }];
    // @ts-expect-error -- private field access for testing
    studentManager.initialized = true;
  });

  describe('Persuasion Support Change Tests', () => {
    it('説得成功時に対象の支持率が正しく変更される', () => {
      const initialSupport = { ...mockTarget.support };
      const situationStrength = 50; // 情勢値50
      const playerWon = true;
      
      const changeAmount = Math.floor(situationStrength / 10); // 変化量5

      // 説得成功時の支持率変更を実行
      studentManager.updateSupport(mockTarget.id, {
        status_quo: mockTarget.support.status_quo + changeAmount,
        militar: mockTarget.support.militar - changeAmount
      });

      const updatedTarget = studentManager.getStudent(mockTarget.id);
      expect(updatedTarget?.support.status_quo).toBeGreaterThan(initialSupport.status_quo);
      expect(updatedTarget?.support.militar).toBeLessThan(initialSupport.militar);
    });

    it('説得失敗時にプレイヤーの支持率が正しく変更される', () => {
      const initialSupport = { ...mockPlayer.support };
      const situationStrength = 50; // 情勢値50
      const playerWon = false;
      
      const changeAmount = Math.floor(situationStrength / 10); // 変化量5

      // 説得失敗時の支持率変更を実行
      studentManager.updateSupport(mockPlayer.id, {
        militar: mockPlayer.support.militar + changeAmount,
        status_quo: mockPlayer.support.status_quo - changeAmount
      });

      const updatedPlayer = studentManager.getStudent(mockPlayer.id);
      expect(updatedPlayer?.support.militar).toBeGreaterThan(initialSupport.militar);
      expect(updatedPlayer?.support.status_quo).toBeLessThan(initialSupport.status_quo);
    });

    it('支持率の変更が累積的に機能する', () => {
      const initialSupport = { ...mockTarget.support };

      // 1回目の更新
      studentManager.updateSupport(mockTarget.id, {
        status_quo: mockTarget.support.status_quo + 5,
        militar: mockTarget.support.militar - 5
      });

      // 2回目の更新
      const afterFirstUpdate = studentManager.getStudent(mockTarget.id)!.support;
      studentManager.updateSupport(mockTarget.id, {
        status_quo: afterFirstUpdate.status_quo + 5,
        militar: afterFirstUpdate.militar - 5
      });

      const finalTarget = studentManager.getStudent(mockTarget.id);
      expect(finalTarget?.support.status_quo).toBe(30); // 20 + 5 + 5
      expect(finalTarget?.support.militar).toBe(50);    // 60 - 5 - 5
    });
  });
});