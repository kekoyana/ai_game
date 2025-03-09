import { useState } from 'react';
import { Province, provinces } from '../types/province';

interface MapProps {
  onProvinceClick?: (province: Province) => void;
}

export function Map({ onProvinceClick }: MapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const getProvinceColor = (provinceId: string) => {
    if (selectedProvince === provinceId) {
      return '#4a90e2'; // 選択中の州
    }
    if (selectedProvince && provinces.find(p => p.id === selectedProvince)?.adjacentProvinces.includes(provinceId)) {
      return '#3a5a8c'; // 選択中の州に隣接する州
    }
    if (hoveredProvince === provinceId) {
      return '#4a4a4a'; // ホバー中の州
    }
    return '#2c2c2c'; // デフォルト
  };

  const handleProvinceClick = (province: Province) => {
    setSelectedProvince(province.id);
    onProvinceClick?.(province);
  };

  return (
    <div className="map-container">
      <svg
        viewBox="80 80 500 340"
        width="100%"
        height="100%"
        style={{ backgroundColor: '#000' }}
      >
        {/* 各州の描画 */}
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
                filter: selectedProvince === province.id ? 'drop-shadow(0 0 4px #4a90e2)' : 'none'
              }}
            />
            <text
              x={province.labelX}
              y={province.labelY}
              textAnchor="middle"
              fill="#fff"
              fontSize="16"
              fontWeight="bold"
              pointerEvents="none"
              style={{
                filter: 'drop-shadow(1px 1px 2px #000)'
              }}
            >
              {province.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}