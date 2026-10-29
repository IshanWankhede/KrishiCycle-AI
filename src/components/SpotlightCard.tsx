import React from 'react';
import { SpecularCard, SpecularCardProps } from './SpecularCard';

export interface SpotlightCardProps extends SpecularCardProps {
  spotlightColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = '#C8F23B',
  radius = 24,
  ...props
}) => {
  return (
    <SpecularCard
      radius={radius}
      lineColor={spotlightColor}
      className={`bg-surface-card border border-surface-darkborder/80 shadow-card-soft ${className}`}
      {...props}
    >
      {children}
    </SpecularCard>
  );
};

export default SpotlightCard;
