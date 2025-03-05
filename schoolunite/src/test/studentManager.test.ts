import { describe, it, expect, beforeEach } from 'vitest'
import { studentManager } from '../data/studentData'
import { Student, Gender, Class } from '../types/student'
import { ClubId } from '../types/club'

describe('StudentManager: 親密度テスト', () => {
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
    traitIds: [1, 2],
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
      status_quo: 34,
      militar: 33,
      academic: 33,
    },
    faction: 'status_quo',
    isLeader: false,
    clubId: ClubId.NONE,
    currentHp: 100,
    maxHp: 100,
    friendship: 0
  }

  beforeEach(() => {
    const player: Student = {
      ...mockStudent1,
      id: 1,
      lastName: 'Player',
      firstName: 'Test',
      faction: 'status_quo'
    };
    const target: Student = {
      ...mockStudent1,
      id: 2,
      lastName: 'Target',
      firstName: 'Test',
      faction: 'status_quo'
    };
    
    // @ts-expect-error -- private field access for testing
    studentManager.students = [player, target]
    // @ts-expect-error -- private field access for testing
    studentManager.initialized = true
    // @ts-expect-error -- private method override for testing
    studentManager.calculateAdjustedFriendshipIncrease = () => 10
  })

  describe('基本機能', () => {
    it('親密度が正しく増加する', () => {
      const result = studentManager.increaseFriendship(2)
      expect(result.newFriendship).toBe(10)
      expect(result.amount).toBe(10)
    })

    it('親密度は100を超えない', () => {
      // 親密度を90に設定
      studentManager.updateStudent(2, { friendship: 90 })
      const result = studentManager.increaseFriendship(2)
      expect(result.newFriendship).toBeLessThanOrEqual(100)
    })

    it('親密度は0未満にならない', () => {
      studentManager.updateStudent(2, { friendship: -10 })
      const student = studentManager.getStudent(2)
      expect(student?.friendship).toBe(0)
    })
  })

  describe('累積効果', () => {
    it('複数回の交流で親密度が累積する', () => {
      const initial = studentManager.getStudent(2)?.friendship || 0
      studentManager.increaseFriendship(2)
      studentManager.increaseFriendship(2)
      studentManager.increaseFriendship(2)
      
      const student = studentManager.getStudent(2)
      expect(student?.friendship).toBe(30)
    })

    it('上限値100で正しく止まる', () => {
      // 親密度を90に設定
      studentManager.updateStudent(2, { friendship: 90 })
      for (let i = 0; i < 5; i++) {
        studentManager.increaseFriendship(2)
      }
      
      const student = studentManager.getStudent(2)
      expect(student?.friendship).toBe(100)
    })
  })
});