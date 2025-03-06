import { Student, Faction } from '../types/student';
import { TraitId } from '../types/student';
import { ClassData, ClassRepresentative, FACTION_INFLUENCE } from '../types/class';
import { studentManager } from '../data/studentData';

class ClassManager {
  private classes: Map<string, ClassData> = new Map();

  // クラスIDの生成（例: "2A" = 2年A組）
  private getClassId(grade: number, name: string): string {
    return `${grade}${name}`;
  }

  // クラスの初期化
  initialize(students: Student[]): void {
    // 学年とクラスでグループ化
    const classGroups = new Map<string, Student[]>();
    students.forEach(student => {
      const classId = this.getClassId(student.grade, student.class);
      if (!classGroups.has(classId)) {
        classGroups.set(classId, []);
      }
      classGroups.get(classId)?.push(student);
    });

    // 各クラスのデータを作成
    classGroups.forEach((students, classId) => {
      const [grade, name] = [parseInt(classId[0]), classId[1]];
      const classData: ClassData = {
        grade,
        name,
        faction: 'status_quo', // 初期値、後で計算
        representatives: [],
        studentIds: students.map(s => s.id)
      };

      // 代表を選出（LEADERSHIPを持つ生徒を優先）
      const potentialReps = students
        .filter(s => !s.isLeader) // すでにリーダーではない生徒から選出
        .sort((a, b) => {
          const aHasLeadership = a.traitIds.includes(TraitId.LEADERSHIP);
          const bHasLeadership = b.traitIds.includes(TraitId.LEADERSHIP);
          if (aHasLeadership && !bHasLeadership) return -1;
          if (!aHasLeadership && bHasLeadership) return 1;
          return b.charisma - a.charisma; // 次に魅力値で比較
        });

      if (potentialReps.length > 0) {
        classData.representatives.push({
          studentId: potentialReps[0].id,
          role: 'representative'
        });

        // 副代表を選出（最大2名）
        const viceReps = potentialReps.slice(1, 3);
        viceReps.forEach(student => {
          classData.representatives.push({
            studentId: student.id,
            role: 'viceRepresentative'
          });
        });
      }

      // クラスの派閥を決定
      classData.faction = this.determineClassFaction(classData);
      this.classes.set(classId, classData);
    });
  }

  // クラスの派閥を決定
  private determineClassFaction(classData: ClassData): Faction {
    const factionScores: { [key in Faction]: number } = {
      status_quo: 0,
      militar: 0,
      academic: 0
    };

    // 代表の影響力を計算
    const mainRep = this.getRepresentative(classData);
    if (mainRep) {
      const hasLeadership = mainRep.traitIds.includes(TraitId.LEADERSHIP);
      const hasQuiet = mainRep.traitIds.includes(TraitId.QUIET);
      let repWeight = 1.0;

      if (hasLeadership) {
        repWeight *= FACTION_INFLUENCE.leadershipBonus;
      }
      if (hasQuiet) {
        repWeight *= FACTION_INFLUENCE.quietPenalty;
      }

      factionScores[mainRep.faction] += repWeight;
    }

    // 副代表の影響力を計算
    const viceReps = this.getViceRepresentatives(classData);
    viceReps.forEach(viceRep => {
      factionScores[viceRep.faction] += FACTION_INFLUENCE.viceRepWeight;
    });

    // 一般メンバーの影響力を計算
    const members = this.getClassMembers(classData);
    members.forEach(member => {
      if (!classData.representatives.some(rep => rep.studentId === member.id)) {
        factionScores[member.faction] += FACTION_INFLUENCE.memberWeight;
      }
    });

    // 最も影響力の高い派閥を返す
    return Object.entries(factionScores)
      .reduce((max, [faction, score]) => 
        score > max.score ? { faction: faction as Faction, score } : max,
        { faction: 'status_quo' as Faction, score: -1 }
      ).faction;
  }

  // クラスの代表を取得
  getRepresentative(classData: ClassData): Student | undefined {
    const repData = classData.representatives.find(r => r.role === 'representative');
    return repData ? studentManager.getStudent(repData.studentId) : undefined;
  }

  // クラスの副代表を取得
  getViceRepresentatives(classData: ClassData): Student[] {
    const viceRepIds = classData.representatives
      .filter(r => r.role === 'viceRepresentative')
      .map(r => r.studentId);
    return viceRepIds.map(id => studentManager.getStudent(id)).filter((s): s is Student => s !== undefined);
  }

  // クラスのメンバーを取得
  getClassMembers(classData: ClassData): Student[] {
    return classData.studentIds
      .map(id => studentManager.getStudent(id))
      .filter((s): s is Student => s !== undefined);
  }

  // 生徒のクラスデータを取得
  getStudentClass(student: Student): ClassData | undefined {
    const classId = this.getClassId(student.grade, student.class);
    return this.classes.get(classId);
  }

  // クラス一覧を取得
  getAllClasses(): ClassData[] {
    return Array.from(this.classes.values());
  }
}

export const classManager = new ClassManager();