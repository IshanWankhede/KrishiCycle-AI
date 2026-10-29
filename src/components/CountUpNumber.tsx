import React, { useEffect, useState } from 'react';

interface CountUpNumberProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  end,
  duration = 1500,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(easedProgress * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrent(end);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}
      {current.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};
