import { Student, Gender, Grade, Class, InterestLevel, FactionSupport, Faction, PreferenceLevel, TraitPreferences } from '../types/student';
import { ClubId } from '../types/club';

function determineFaction(support: FactionSupport): Faction {
  const maxSupport = Math.max(
    support.status_quo,
    support.sports,
    support.academic
  );
  
  if (maxSupport === support.status_quo) return 'status_quo';
  if (maxSupport === support.sports) return 'sports';
  return 'academic';
}

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
          study: parseInt(data.interests_study) as InterestLevel,
          sports: parseInt(data.interests_sports) as InterestLevel,
          video: parseInt(data.interests_video) as InterestLevel,
          games: parseInt(data.interests_games) as InterestLevel,
          fashion: parseInt(data.interests_fashion) as InterestLevel,
          sns: parseInt(data.interests_sns) as InterestLevel,
          music: parseInt(data.interests_music) as InterestLevel,
          love: parseInt(data.interests_love) as InterestLevel,
        };

        // 属性に対する好みをオブジェクトに変換
        const traitPreferences: TraitPreferences = {
          glasses: parseInt(data.trait_glasses) as PreferenceLevel,
          science: parseInt(data.trait_science) as PreferenceLevel,
          literature: parseInt(data.trait_literature) as PreferenceLevel,
          athletic: parseInt(data.trait_athletic) as PreferenceLevel,
          artistic: parseInt(data.trait_artistic) as PreferenceLevel,
          leadership: parseInt(data.trait_leadership) as PreferenceLevel,
          diligent: parseInt(data.trait_diligent) as PreferenceLevel,
          rebellious: parseInt(data.trait_rebellious) as PreferenceLevel,
          cheerful: parseInt(data.trait_cheerful) as PreferenceLevel,
          quiet: parseInt(data.trait_quiet) as PreferenceLevel,
        };

        // 支持率をオブジェクトに変換
        const support = {
          status_quo: parseInt(data.support_status_quo),
          sports: parseInt(data.support_sports),
          academic: parseInt(data.support_academic),
        };

        // 属性IDを配列に変換
        const traitIds = data.traitIds
          .replace(/['"]/g, '') // クォートを除去
          .split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id)); // 無効な値を除外

        // HPを数値に変換
        const maxHp = parseInt(data.maxHp);
        const currentHp = parseInt(data.currentHp);

        // 生徒データを作成
        const student: Student = {
          id: parseInt(data.id),
          lastName: data.lastName,
          firstName: data.firstName,
          gender: parseInt(data.gender) as Gender,
          grade: parseInt(data.grade) as Grade,
          class: data.class as Class,
          reputation: parseInt(data.reputation),
          intelligence: parseInt(data.intelligence),
          strength: parseInt(data.strength),
          charisma: parseInt(data.charisma),
          traitIds,
          traitPreferences,
          interests,
          support,
          isLeader: data.isLeader === 'true',
          faction: determineFaction(support),
          clubId: parseInt(data.clubId) as ClubId,
          maxHp,
          currentHp
        };

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
  const values = [
    student.id,
    student.lastName,
    student.firstName,
    student.gender,
    student.grade,
    student.class,
    student.reputation,
    student.intelligence,
    student.strength,
    student.charisma,
    `"${student.traitIds.join(',')}"`,
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
    student.isLeader,
    student.traitPreferences.glasses,
    student.traitPreferences.science,
    student.traitPreferences.literature,
    student.traitPreferences.athletic,
    student.traitPreferences.artistic,
    student.traitPreferences.leadership,
    student.traitPreferences.diligent,
    student.traitPreferences.rebellious,
    student.traitPreferences.cheerful,
    student.traitPreferences.quiet,
    student.clubId,
    student.maxHp,
    student.currentHp,
  ];
  
  return values.join(',');
}