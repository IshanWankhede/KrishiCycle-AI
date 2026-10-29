import React from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 72,
  strokeWidth = 6,
  label,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getColor = () => {
    if (clampedScore >= 75) return '#C8F23B'; // lime
    if (clampedScore >= 50) return '#F4B740'; // amber
    return '#D9534F'; // red
  };

  return (
    <div className={`relative inline-flex items-center justify-center flex-col ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1F372B"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {/* Central Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-base font-bold font-mono text-white tracking-tight leading-none">
          {clampedScore}%
        </span>
        {label && (
          <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
