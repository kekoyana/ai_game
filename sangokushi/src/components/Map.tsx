import { useState } from 'react';
import '../styles/Map.css';
import { Province, provinces } from '../types/province';
import { Lord } from '../types/lord';

interface MapProps {
  onProvinceClick?: (province: Province) => void;
  currentDate: { year: number; month: number };
}

export function Map({ onProvinceClick, currentDate }: MapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  // 君主ごとに色を割り当てる
  const getLordColor = (lord: Lord | null) => {
    if (!lord) return '#4a4a4a'; // 空白国
    
    // 君主ごとの基本色
    const lordColors: { [key: string]: string } = {
      gongsunzan: '#7c4dff', // 公孫瓚
      liubei: '#4caf50',     // 劉備
      yuanshao: '#f44336',   // 袁紹
      kongrong: '#2196f3',   // 孔融
      dongzhuo: '#9c27b0',   // 董卓
      caocao: '#3f51b5',     // 曹操
      yuanshu: '#e91e63',    // 袁術
      taoqian: '#009688',    // 陶謙
      sunjian: '#ff9800',    // 孫堅
      mateng: '#795548',     // 馬騰
      liuyan: '#607d8b',     // 劉焉
      liubiao: '#8bc34a'     // 劉表
    };

    return lordColors[lord.id] || '#2c2c2c';
  };

  const getProvinceColor = (provinceId: string) => {
    const province = provinces.find(p => p.id === provinceId);
    if (!province) return '#2c2c2c';

    if (hoveredProvince === provinceId) {
      // 薄く明るくする
      const baseColor = getLordColor(province.lord);
      return province.lord ? baseColor.replace(')', ', 0.7)').replace('rgb', 'rgba') : '#4a4a4a';
    }

    return getLordColor(province.lord);
  };

  const handleProvinceClick = (province: Province) => {
    onProvinceClick?.(province);
  };

  return (
    <div className="map-container">
      <div className="date-display">
        {currentDate.year}年{currentDate.month}月
      </div>
      <svg
        viewBox="80 80 500 340"
        width="100%"
        height="100%"
        style={{ backgroundColor: '#000' }}
      >
        {provinces.map((province) => (
          <g key={province.id}>
            <path
              d={province.path}
              fill={getProvinceColor(province.id)}
              stroke="#888"
              strokeWidth="2"
              onMouseEnter={() => setHoveredProvince(province.id)}
              onMouseLeave={() => setHoveredProvince(null)}
              onClick={() => handleProvinceClick(province)}
              style={{
                cursor: 'pointer',
                transition: 'fill 0.3s ease',
                filter: 'none'
              }}
            />
            <text
              x={province.labelX}
              y={province.labelY - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize="14"
              fontWeight="bold"
              pointerEvents="none"
              style={{
                filter: 'drop-shadow(1px 1px 2px #000)'
              }}
            >
              {province.name}
            </text>
            <text
              x={province.labelX}
              y={province.labelY + 12}
              textAnchor="middle"
              fill="#fff"
              fontSize="12"
              pointerEvents="none"
              style={{
                filter: 'drop-shadow(1px 1px 2px #000)'
              }}
            >
              {province.lord?.name || '空白国'}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}