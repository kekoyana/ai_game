import { describe, it, expect, beforeEach } from 'vitest';
import { classManager } from '../managers/classManager';
import { studentManager } from '../data/studentData';
import { Student, TraitId } from '../types/student';

describe('ClassManager', () => {
  const mockStudents: Student[] = [
    // 2-A代表候補（LEADERSHIP持ち）
    {
      id: 1,
      lastName: 'Leader',
      firstName: 'Student',
      gender: 0,
      grade: 2,
      class: 'A',
      reputation: 1000,
      intelligence: 100,
      strength: 100,
      charisma: 150,
      traitIds: [TraitId.LEADERSHIP],
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
      support: {
        status_quo: 80,
        militar: 10,
        academic: 10,
      },
      faction: 'status_quo',
      isLeader: false,
      clubId: 0,
      currentHp: 100,
      maxHp: 100,
      friendship: 0,
    },
    // 2-A副代表候補（高カリスマ）
    {
      id: 2,
      lastName: 'Vice',
      firstName: 'Rep1',
      gender: 0,
      grade: 2,
      class: 'A',
      reputation: 1000,
      intelligence: 100,
      strength: 100,
      charisma: 120,
      traitIds: [TraitId.CHEERFUL],
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
      support: {
        status_quo: 10,
        militar: 80,
        academic: 10,
      },
      faction: 'militar',
      isLeader: false,
      clubId: 0,
      currentHp: 100,
      maxHp: 100,
      friendship: 0,
    },
    // 2-B代表候補（QUIET持ち）
    {
      id: 3,
      lastName: 'Quiet',
      firstName: 'Leader',
      gender: 0,
      grade: 2,
      class: 'B',
      reputation: 1000,
      intelligence: 100,
      strength: 100,
      charisma: 130,
      traitIds: [TraitId.QUIET],
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
      support: {
        status_quo: 10,
        militar: 10,
        academic: 80,
      },
      faction: 'academic',
      isLeader: false,
      clubId: 0,
      currentHp: 100,
      maxHp: 100,
      friendship: 0,
    }
  ];

  beforeEach(() => {
    // @ts-expect-error -- private field access for testing
    studentManager.students = mockStudents;
    // @ts-expect-error -- private field access for testing
    studentManager.initialized = true;
    classManager.initialize(mockStudents);
  });

  it('correctly assigns class representatives', () => {
    const classA = classManager.getAllClasses().find(c => c.grade === 2 && c.name === 'A');
    expect(classA).toBeDefined();
    expect(classA?.representatives).toHaveLength(2);
    expect(classA?.representatives[0].studentId).toBe(1); // LEADERSHIPを持つ生徒が代表
    expect(classA?.representatives[0].role).toBe('representative');
    expect(classA?.representatives[1].studentId).toBe(2); // カリスマ値が高い生徒が副代表
    expect(classA?.representatives[1].role).toBe('viceRepresentative');
  });

  it('determines faction based on representative traits', () => {
    // LEADERSHIPを持つ代表のクラス
    const classA = classManager.getAllClasses().find(c => c.grade === 2 && c.name === 'A');
    expect(classA?.faction).toBe('status_quo'); // 代表の派閥が強く影響

    // QUIETを持つ代表のクラス
    const classB = classManager.getAllClasses().find(c => c.grade === 2 && c.name === 'B');
    expect(classB?.faction).toBe('academic'); // 代表の影響力が弱まる
  });

  it('correctly retrieves class members', () => {
    const classA = classManager.getAllClasses().find(c => c.grade === 2 && c.name === 'A');
    if (!classA) throw new Error('Class 2-A not found');

    const members = classManager.getClassMembers(classA);
    expect(members).toHaveLength(2);
    expect(members.map(m => m.id)).toContain(1);
    expect(members.map(m => m.id)).toContain(2);
  });

  it('retrieves representative and vice representatives', () => {
    const classA = classManager.getAllClasses().find(c => c.grade === 2 && c.name === 'A');
    if (!classA) throw new Error('Class 2-A not found');

    const rep = classManager.getRepresentative(classA);
    expect(rep?.id).toBe(1);
    expect(rep?.traitIds).toContain(TraitId.LEADERSHIP);

    const viceReps = classManager.getViceRepresentatives(classA);
    expect(viceReps).toHaveLength(1);
    expect(viceReps[0].id).toBe(2);
  });
});