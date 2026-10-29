import React from 'react';
import { ProvenanceType, EvidenceStatus } from '../types';

interface ProvenanceBadgeProps {
  type: ProvenanceType | EvidenceStatus | 'Demo review';
  className?: string;
  size?: 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  className = '',
  size = 'sm',
}) => {
  // Styles based on honesty classification
  const getBadgeStyle = () => {
    switch (type) {
      case 'Live (Open-Meteo)':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
      case 'Estimated':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'User-provided':
        return 'bg-teal-950/80 text-teal-300 border-teal-500/40';
      case 'Simulated':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      case 'Seller-provided':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
      case 'Not tested':
      case 'Evidence not provided':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/40';
      case 'Demo review':
        return 'bg-neutral-900/90 text-neutral-300 border-neutral-600/50';
      case 'Demo data':
      default:
        return 'bg-neutral-900/80 text-neutral-400 border-neutral-700/60';
    }
  };

  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono tracking-wide rounded-full border shadow-sm backdrop-blur-md ${getBadgeStyle()} ${sizeClasses} ${className}`}
      title={`Data honesty classification: ${type}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      {type}
    </span>
  );
};
