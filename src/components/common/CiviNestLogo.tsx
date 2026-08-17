import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
  markOnly?: boolean;
}

export const CiviNestLogoMark: React.FC<{ size?: number; className?: string; color?: string }> = ({
  size = 36,
  className = '',
  color = '#0F1E36',
}) => {
  // Intricate geometric civic nest mandala with interlocking radial arcs and nodes
  const rings = [
    { r: 42, count: 12, strokeWidth: 1.2, opacity: 0.85 },
    { r: 32, count: 8, strokeWidth: 1.4, opacity: 0.95 },
    { r: 22, count: 6, strokeWidth: 1.6, opacity: 1 },
    { r: 12, count: 4, strokeWidth: 1.8, opacity: 1 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      aria-label="CiviNest Logo Mark"
    >
      {/* Outer subtle circular aura */}
      <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="3 3" />
      
      {/* Interlocking geometric harmonic curves */}
      {rings.map((ring, rIdx) => (
        <g key={rIdx} opacity={ring.opacity}>
          {Array.from({ length: ring.count }).map((_, i) => {
            const angle = (i * 360) / ring.count;
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + Math.cos(rad) * (50 - ring.r);
            const cy = 50 + Math.sin(rad) * (50 - ring.r);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={ring.r}
                stroke={color}
                strokeWidth={ring.strokeWidth}
                strokeOpacity="0.45"
              />
            );
          })}
        </g>
      ))}

      {/* Central civic core node */}
      <circle cx="50" cy="50" r="4" fill={color} />
      <circle cx="50" cy="50" r="8" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" />
      <circle cx="50" cy="50" r="16" stroke={color} strokeWidth="1.2" strokeDasharray="2 2" strokeOpacity="0.6" />
      
      {/* 4 cardinal alignment points */}
      <circle cx="50" cy="8" r="1.5" fill={color} />
      <circle cx="50" cy="92" r="1.5" fill={color} />
      <circle cx="8" cy="50" r="1.5" fill={color} />
      <circle cx="92" cy="50" r="1.5" fill={color} />
    </svg>
  );
};

export const CiviNestLogo: React.FC<LogoProps> = ({
  size = 28,
  showText = true,
  className = '',
  textColor = 'text-[#0F1E36]',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <CiviNestLogoMark size={size} />
      {showText && (
        <span className={`font-semibold tracking-tight text-lg ${textColor} flex items-center font-sans`}>
          CiviNest
        </span>
      )}
    </div>
  );
};

export default CiviNestLogo;
