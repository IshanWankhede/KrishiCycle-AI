import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiBurstProps {
  active: boolean;
}

const PARTICLES = Array.from({ length: 42 }).map((_, i) => {
  const angle = (i / 42) * 360;
  const distance = 80 + Math.random() * 140;
  const rad = (angle * Math.PI) / 180;
  const targetX = Math.cos(rad) * distance;
  const targetY = Math.sin(rad) * distance + (Math.random() * 40); // gravity
  const colors = ['#C8F23B', '#7CCFC4', '#C9B6F2', '#F4B740', '#34D399', '#FBBF24'];
  const color = colors[i % colors.length];
  const size = 6 + (i % 6);
  const rotation = Math.random() * 360;

  return {
    id: i,
    targetX,
    targetY,
    color,
    size,
    rotation,
  };
});

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: p.targetX,
                y: p.targetY,
                scale: [0, 1.2, 0.9],
                opacity: [1, 1, 0],
                rotate: p.rotation + 360,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                width: p.size,
                height: p.size * (p.id % 2 === 0 ? 1 : 1.6),
                backgroundColor: p.color,
                borderRadius: p.id % 3 === 0 ? '50%' : '2px',
                position: 'absolute',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
