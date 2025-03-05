import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadStudentsFromCSV } from '../utils/csvLoader';

describe('CSVLoader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockCSVData = `id,lastName,firstName,gender,grade,class,reputation,intelligence,strength,charisma,traitIds,interests_study,interests_athletic,interests_video,interests_games,interests_fashion,interests_sns,interests_music,interests_love,support_status_quo,support_militar,support_academic,isLeader,trait_glasses,trait_science,trait_literature,trait_athletic,trait_artistic,trait_leadership,trait_diligent,trait_rebellious,trait_cheerful,trait_quiet,clubId,maxHp,currentHp,friendship
1,山田,翔太,0,2,A,45000,120,100,180,"6,9",1,1,2,2,2,2,1,1,80,10,10,true,1,1,1,2,1,2,1,1,2,0,0,150,150,0
6,木村,琴音,1,2,A,38000,180,90,140,"1,2,7",2,0,1,2,1,1,2,1,5,10,85,false,2,2,1,0,1,1,2,0,1,2,4,100,100,0`;

  // モックされたResponseを作成
  const mockResponse = {
    ok: true,
    status: 200,
    text: async () => mockCSVData,
  };

  it('should parse traitIds correctly', async () => {
    // globalのfetchをモック化
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve(mockResponse));

    const students = await loadStudentsFromCSV();
    
    // モックが呼ばれたことを確認
    expect(global.fetch).toHaveBeenCalledWith('/src/data/students.csv');
    
    // 返された生徒の数を確認
    expect(students).toHaveLength(2);
    
    // ID:1の生徒のtraitIds確認
    expect(students[0].traitIds).toEqual([6, 9]);
    
    // ID:6の生徒のtraitIds確認
    expect(students[1].traitIds).toEqual([1, 2, 7]);

    // デバッグ出力
    students.forEach(student => {
      console.log(`${student.lastName} ${student.firstName} traitIds:`, student.traitIds);
    });
  });

  it('should parse support rates correctly', async () => {
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve(mockResponse));

    const students = await loadStudentsFromCSV();
    
    // ID:1の生徒の支持率確認
    expect(students[0].support).toEqual({
      status_quo: 80,
      militar: 10,
      academic: 10
    });
    
    // ID:6の生徒の支持率確認
    expect(students[1].support).toEqual({
      status_quo: 5,
      militar: 10,
      academic: 85
    });
  });

  it('should parse numeric values correctly', async () => {
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve(mockResponse));

    const students = await loadStudentsFromCSV();
    
    // HP値の確認
    expect(students[0]).toMatchObject({
      currentHp: 150,
      maxHp: 150
    });

    // 能力値の確認
    expect(students[0]).toMatchObject({
      intelligence: 120,
      strength: 100,
      charisma: 180
    });
  });

  it('should parse boolean values correctly', async () => {
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve(mockResponse));

    const students = await loadStudentsFromCSV();
    
    // isLeaderの確認
    expect(students[0].isLeader).toBe(true);
    expect(students[1].isLeader).toBe(false);
  });

  it('should handle empty or malformed traitIds', async () => {
    const malformedCSV = `id,lastName,firstName,gender,grade,class,reputation,intelligence,strength,charisma,traitIds,interests_study,interests_athletic,interests_video,interests_games,interests_fashion,interests_sns,interests_music,interests_love,support_status_quo,support_militar,support_academic,isLeader,trait_glasses,trait_science,trait_literature,trait_athletic,trait_artistic,trait_leadership,trait_diligent,trait_rebellious,trait_cheerful,trait_quiet,clubId,maxHp,currentHp,friendship
1,Test,Student,0,2,A,1000,100,100,100,,1,1,1,1,1,1,1,1,34,33,33,false,1,1,1,1,1,1,1,1,1,1,0,100,100,0
2,Test,Student2,0,2,A,1000,100,100,100,"",1,1,1,1,1,1,1,1,34,33,33,false,1,1,1,1,1,1,1,1,1,1,0,100,100,0
3,Test,Student3,0,2,A,1000,100,100,100,"invalid",1,1,1,1,1,1,1,1,34,33,33,false,1,1,1,1,1,1,1,1,1,1,0,100,100,0`;

    const malformedResponse = {
      ok: true,
      status: 200,
      text: async () => malformedCSV,
    };

    global.fetch = vi.fn().mockImplementation(() => Promise.resolve(malformedResponse));

    const students = await loadStudentsFromCSV();
    
    // 空の場合は空配列を返す
    expect(students[0].traitIds).toEqual([]);
    expect(students[1].traitIds).toEqual([]);
    
    // 不正な値の場合も空配列を返す
    expect(students[2].traitIds).toEqual([]);
  });
});