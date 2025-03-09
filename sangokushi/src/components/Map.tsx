import { useState } from 'react';
import { Province, provinces } from '../types/province';

interface MapProps {
  onProvinceClick?: (province: Province) => void;
}

export function Map({ onProvinceClick }: MapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  return (
    <div className="map-container">
      <svg
        viewBox="150 50 400 450"
        width="100%"
        height="100%"
        style={{ backgroundColor: '#000' }}
      >
        {provinces.map((province) => (
          <g key={province.id}>
            <path
              d={province.path}
              fill={hoveredProvince === province.id ? '#4a4a4a' : '#2c2c2c'}
              stroke="#666"
              strokeWidth="2"
              onMouseEnter={() => setHoveredProvince(province.id)}
              onMouseLeave={() => setHoveredProvince(null)}
              onClick={() => onProvinceClick?.(province)}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={province.labelX}
              y={province.labelY}
              textAnchor="middle"
              fill="#fff"
              fontSize="14"
              pointerEvents="none"
            >
              {province.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}