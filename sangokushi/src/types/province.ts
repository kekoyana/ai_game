import { Lord, lords } from './lord';

export interface Province {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
  adjacentProvinces: string[];
  lord: Lord | null;  // 君主情報を追加
}

export const provinces: Province[] = [
  {
    id: "you",
    name: "幽州",
    path: "M320,100 L420,100 L480,110 L480,150 L400,160 L320,150 Z",
    labelX: 380,
    labelY: 125,
    adjacentProvinces: ["bing", "ji", "qing"],
    lord: lords.gongsunzan
  },
  {
    id: "bing",
    name: "幷州",
    path: "M290,150 L320,150 L400,160 L380,190 L330,200 L300,180 Z",
    labelX: 340,
    labelY: 170,
    adjacentProvinces: ["you", "ji", "silei"],
    lord: lords.liubei
  },
  {
    id: "ji",
    name: "冀州",
    path: "M400,160 L480,150 L490,180 L460,200 L380,190 Z",
    labelX: 430,
    labelY: 175,
    adjacentProvinces: ["you", "bing", "silei", "qing", "yan"],
    lord: lords.yuanshao
  },
  {
    id: "qing",
    name: "青州",
    path: "M480,110 L540,100 L560,140 L530,180 L490,180 L480,150 Z",
    labelX: 510,
    labelY: 140,
    adjacentProvinces: ["you", "ji", "yan", "xu"],
    lord: lords.kongrong
  },
  {
    id: "silei",
    name: "司隷",
    path: "M240,200 L300,180 L330,200 L380,190 L460,200 L420,240 L360,260 L320,270 L280,250 L240,220 Z",
    labelX: 340,
    labelY: 220,
    adjacentProvinces: ["bing", "yong", "jing", "yu", "yan", "ji"],
    lord: lords.dongzhuo
  },
  {
    id: "yan",
    name: "兗州",
    path: "M460,200 L490,180 L530,180 L500,220 L420,240 Z",
    labelX: 480,
    labelY: 200,
    adjacentProvinces: ["ji", "silei", "yu", "xu", "qing"],
    lord: lords.caocao
  },
  {
    id: "yu",
    name: "豫州",
    path: "M320,270 L360,260 L420,240 L500,220 L480,260 L440,280 L380,290 L320,280 Z",
    labelX: 400,
    labelY: 260,
    adjacentProvinces: ["yan", "silei", "jing", "yang", "xu"],
    lord: lords.yuanshu
  },
  {
    id: "xu",
    name: "徐州",
    path: "M500,220 L530,180 L560,140 L580,190 L540,250 L480,260 Z",
    labelX: 530,
    labelY: 200,
    adjacentProvinces: ["qing", "yan", "yu", "yang"],
    lord: lords.taoqian
  },
  {
    id: "yang",
    name: "揚州",
    path: "M440,280 L480,260 L540,250 L520,310 L480,340 L440,320 Z",
    labelX: 480,
    labelY: 290,
    adjacentProvinces: ["xu", "yu", "jing", "jiaozhi"],
    lord: lords.sunjian
  },
  {
    id: "yong",
    name: "雍州",
    path: "M180,190 L240,200 L240,220 L280,250 L260,280 L220,290 L180,260 Z",
    labelX: 220,
    labelY: 230,
    adjacentProvinces: ["liang", "silei", "yi", "jing"],
    lord: lords.dongzhuo // 董卓が支配
  },
  {
    id: "liang",
    name: "涼州",
    path: "M100,190 L180,190 L180,260 L140,270 L100,250 Z",
    labelX: 140,
    labelY: 220,
    adjacentProvinces: ["yong"],
    lord: lords.mateng
  },
  {
    id: "yi",
    name: "益州",
    path: "M220,290 L260,280 L320,280 L300,310 L280,350 L240,360 L220,320 Z",
    labelX: 260,
    labelY: 300,
    adjacentProvinces: ["yong", "jing", "jiaozhi"],
    lord: lords.liuyan
  },
  {
    id: "jing",
    name: "荊州",
    path: "M260,280 L280,250 L320,270 L380,290 L440,280 L440,320 L400,340 L320,350 L280,350 L300,310 Z",
    labelX: 350,
    labelY: 300,
    adjacentProvinces: ["silei", "yong", "yi", "jiaozhi", "yang", "yu"],
    lord: lords.liubiao
  },
  {
    id: "jiaozhi",
    name: "交州",
    path: "M240,360 L280,350 L320,350 L400,340 L440,320 L480,340 L450,370 L380,380 L300,370 Z",
    labelX: 370,
    labelY: 350,
    adjacentProvinces: ["yi", "jing", "yang"],
    lord: null  // 空白国
  }
];