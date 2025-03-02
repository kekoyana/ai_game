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
    friendship: 0,
    affinity: 0,
  }

  beforeEach(async () => {
    await studentManager.initialize()
    // @ts-expect-error -- private field access for testing
    studentManager.students = [{ ...mockStudent1 }]
  })

  describe('基本機能', () => {
    it('親密度が正しく増加する', () => {
      studentManager.increaseFriendship(1, 10)
      const student = studentManager.getStudent(1)
      expect(student?.friendship).toBe(10)
    })

    it('親密度は100を超えない', () => {
      studentManager.increaseFriendship(1, 150)
      const student = studentManager.getStudent(1)
      expect(student?.friendship).toBe(100)
    })

    it('親密度は0未満にならない', () => {
      studentManager.updateStudent(1, { friendship: -10 })
      const student = studentManager.getStudent(1)
      expect(student?.friendship).toBe(0)
    })
  })

  describe('相性ボーナス', () => {
    it('相性プラスの場合、親密度の上昇が増加する', () => {
      studentManager.updateStudent(1, { affinity: 50 })
      studentManager.increaseFriendship(1, 10)
      const student = studentManager.getStudent(1)
      expect(student?.friendship).toBe(15) // 10 + 50% = 15
    })

    it('相性マイナスの場合、親密度の上昇が減少する', () => {
      studentManager.updateStudent(1, { affinity: -50 })
      studentManager.increaseFriendship(1, 10)
      const student = studentManager.getStudent(1)
      expect(student?.friendship).toBe(5) // 10 - 50% = 5
    })

    it('相性0の場合、通常通りの上昇量', () => {
      studentManager.updateStudent(1, { affinity: 0 })
      studentManager.increaseFriendship(1, 10)
      const student = studentManager.getStudent(1)
      expect(student?.friendship).toBe(10)
    })
  })

  describe('累積効果', () => {
    it('複数回の交流で親密度が累積する', () => {
      studentManager.increaseFriendship(1, 5)
      studentManager.increaseFriendship(1, 5)
      studentManager.increaseFriendship(1, 5)
      
      const student = studentManager.getStudent(1)
      expect(student?.friendship).toBe(15)
    })

    it('上限値100で正しく止まる', () => {
      for (let i = 0; i < 12; i++) {
        studentManager.increaseFriendship(1, 10)
      }
      
      const student = studentManager.getStudent(1)
      expect(student?.friendship).toBe(100)
    })
  })
})