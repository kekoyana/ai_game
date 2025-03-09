export interface Province {
  id: string;
  name: string;
  // 地図上での領域を表すSVGのパスデータ
  path: string;
  // 州名を表示する中心座標
  labelX: number;
  labelY: number;
}

// 13州のデータ
export const provinces: Province[] = [
  { id: "silei", name: "司隷", path: "M300,200 L350,200 L350,250 L300,250 Z", labelX: 325, labelY: 225 },
  { id: "yu", name: "豫州", path: "M320,250 L370,250 L370,300 L320,300 Z", labelX: 345, labelY: 275 },
  { id: "ji", name: "冀州", path: "M350,150 L400,150 L400,200 L350,200 Z", labelX: 375, labelY: 175 },
  { id: "yan", name: "兗州", path: "M400,200 L450,200 L450,250 L400,250 Z", labelX: 425, labelY: 225 },
  { id: "xu", name: "徐州", path: "M450,250 L500,250 L500,300 L450,300 Z", labelX: 475, labelY: 275 },
  { id: "qing", name: "青州", path: "M450,150 L500,150 L500,200 L450,200 Z", labelX: 475, labelY: 175 },
  { id: "jing", name: "荊州", path: "M300,300 L350,300 L350,350 L300,350 Z", labelX: 325, labelY: 325 },
  { id: "yang", name: "揚州", path: "M400,300 L450,300 L450,350 L400,350 Z", labelX: 425, labelY: 325 },
  { id: "yi", name: "益州", path: "M250,300 L300,300 L300,350 L250,350 Z", labelX: 275, labelY: 325 },
  { id: "liang", name: "涼州", path: "M200,200 L250,200 L250,250 L200,250 Z", labelX: 225, labelY: 225 },
  { id: "bing", name: "幷州", path: "M250,150 L300,150 L300,200 L250,200 Z", labelX: 275, labelY: 175 },
  { id: "you", name: "幽州", path: "M350,100 L400,100 L400,150 L350,150 Z", labelX: 375, labelY: 125 },
  { id: "jiaozhi", name: "交阯", path: "M300,400 L350,400 L350,450 L300,450 Z", labelX: 325, labelY: 425 }
];