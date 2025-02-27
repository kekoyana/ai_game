import { Formation } from './types';

// 方陣（Square Formation）
export const squareFormation: Formation = {
  name: '方陣',
  positions: Array.from({ length: 100 }, (_, i) => ({
    x: (i % 10) * 4 + 150,
    y: Math.floor(i / 10) * 4 + 100,
  })),
};

// 楔形陣（Wedge Formation）
export const wedgeFormation: Formation = {
  name: '楔形陣',
  positions: Array.from({ length: 100 }, (_, i) => {
    const row = Math.floor(i / 10);
    const col = i % 10;
    return {
      x: (col * 4 + row * 2) + 150,
      y: row * 4 + 100,
    };
  }),
};

// 半月陣（Crescent Formation）
export const crescentFormation: Formation = {
  name: '半月陣',
  positions: Array.from({ length: 100 }, (_, i) => {
    const radius = 40;
    const angle = (Math.PI / 100) * i;
    return {
      x: Math.cos(angle) * radius + 200,
      y: Math.sin(angle) * radius + 150,
    };
  }),
};

// 鶴翼の陣（Crane Wing Formation）
export const craneWingFormation: Formation = {
  name: '鶴翼の陣',
  positions: Array.from({ length: 100 }, (_, i) => {
    if (i < 20) {
      // 中央部隊
      return {
        x: 200 + (i % 4) * 4,
        y: 130 + Math.floor(i / 4) * 4,
      };
    } else if (i < 60) {
      // 左翼
      const wingI = i - 20;
      return {
        x: 180 - Math.floor(wingI / 4) * 4,
        y: 130 + (wingI % 4) * 4,
      };
    } else {
      // 右翼
      const wingI = i - 60;
      return {
        x: 220 + Math.floor(wingI / 4) * 4,
        y: 130 + (wingI % 4) * 4,
      };
    }
  }),
};

// V字陣（V Formation）
export const vFormation: Formation = {
  name: 'V字陣',
  positions: Array.from({ length: 100 }, (_, i) => {
    const isLeftWing = i < 50;
    const wingIndex = isLeftWing ? i : i - 50;
    const col = wingIndex % 5;
    const row = Math.floor(wingIndex / 5);
    
    if (isLeftWing) {
      // 左翼
      return {
        x: 200 - (5 - col) * 8 - row * 6,
        y: 200 - row * 6,
      };
    } else {
      // 右翼
      return {
        x: 200 + col * 8 + row * 6,
        y: 200 - row * 6,
      };
    }
  }),
};

// 鋒矢の陣（Arrow Formation）
export const arrowFormation: Formation = {
  name: '鋒矢の陣',
  positions: Array.from({ length: 100 }, (_, i) => {
    if (i < 10) {
      // 先端部隊（矢じり）
      return {
        x: 200 + (i % 3) * 4,
        y: 150 + Math.floor(i / 3) * 4,
      };
    } else if (i < 40) {
      // 中央突撃部隊（矢の軸）
      const axisI = i - 10;
      return {
        x: 200 + (axisI % 4) * 4,
        y: 170 + Math.floor(axisI / 4) * 4,
      };
    } else {
      // 後方部隊（広がる矢羽）
      const backI = i - 40;
      const col = backI % 12;
      const row = Math.floor(backI / 12);
      return {
        x: 180 + col * 4,
        y: 200 + row * 4,
      };
    }
  }),
};

// 散開陣（Scattered Formation）- 最も弱い陣形
export const scatteredFormation: Formation = {
  name: '散開陣',
  positions: Array.from({ length: 100 }, (_, i) => {
    // ランダムな配置だが、ある程度の範囲内に収める
    const angle = (Math.PI * 2 * i) / 25; // らせん状のベース配置
    const radius = 20 + (i % 4) * 15; // ランダムな半径
    const wobble = Math.sin(i * 0.5) * 8; // うねり効果

    return {
      x: Math.cos(angle) * radius + wobble + 200,
      y: Math.sin(angle) * radius + wobble + 150,
    };
  }),
};

// 二重陣（Double Line Formation）
export const doubleLineFormation: Formation = {
  name: '二重陣',
  positions: Array.from({ length: 100 }, (_, i) => ({
    x: (i % 20) * 4 + 150,
    y: Math.floor(i / 20) * 8 + 100,
  })),
};

export const allFormations = [
  squareFormation,
  wedgeFormation,
  crescentFormation,
  craneWingFormation,
  vFormation,
  arrowFormation,
  scatteredFormation,
  doubleLineFormation,
];