import { Student, Gender, Grade, Class, Interest, Trait, Faction } from '../types/student';

export async function loadStudentsFromCSV(): Promise<Student[]> {
  try {
    const response = await fetch('/src/data/students.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // ヘッダー行を取得
    const headers = lines[0].split(',');
    
    // データ行を処理
    const students: Student[] = lines.slice(1)
      .filter(line => line.trim() !== '') // 空行を除外
      .map(line => {
        const values = line.split(',');
        const data: { [key: string]: string } = {};
        
        // ヘッダーと値を組み合わせてオブジェクトを作成
        headers.forEach((header, index) => {
          data[header] = values[index];
        });

        // 興味関心をオブジェクトに変換
        const interests = {
          study: data.interests_study as Interest,
          sports: data.interests_sports as Interest,
          video: data.interests_video as Interest,
          games: data.interests_games as Interest,
          fashion: data.interests_fashion as Interest,
          sns: data.interests_sns as Interest,
          music: data.interests_music as Interest,
          love: data.interests_love as Interest,
        };

        // 支持率をオブジェクトに変換
        const support = {
          status_quo: parseInt(data.support_status_quo),
          sports: parseInt(data.support_sports),
          academic: parseInt(data.support_academic),
        };

        // 生徒データを作成
        const student: Student = {
          id: data.id,
          name: data.name,
          gender: data.gender as Gender,
          grade: parseInt(data.grade) as Grade,
          class: data.class as Class,
          reputation: parseInt(data.reputation),
          intelligence: parseInt(data.intelligence),
          strength: parseInt(data.strength),
          charisma: parseInt(data.charisma),
          traits: data.traits ? data.traits.split('|') as Trait[] : [],
          interests,
          support,
          isLeader: data.is_leader === 'true',
        };

        // ボスの場合は所属派閥を設定
        if (data.faction) {
          student.faction = data.faction as Faction;
        }

        return student;
      });

    return students;
  } catch (error) {
    console.error('Failed to load students data:', error);
    throw error;
  }
}

// CSV文字列への変換関数（デバッグ用）
export function convertStudentToCSV(student: Student): string {
  const traits = student.traits.join('|');
  const values = [
    student.id,
    student.name,
    student.gender,
    student.grade,
    student.class,
    student.reputation,
    student.intelligence,
    student.strength,
    student.charisma,
    traits,
    student.interests.study,
    student.interests.sports,
    student.interests.video,
    student.interests.games,
    student.interests.fashion,
    student.interests.sns,
    student.interests.music,
    student.interests.love,
    student.support.status_quo,
    student.support.sports,
    student.support.academic,
    student.isLeader || false,
    student.faction || '',
  ];
  
  return values.join(',');
}