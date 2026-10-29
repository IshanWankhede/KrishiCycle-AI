import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  categoryFallback?: string;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'KrishiCycle Agricultural Scene',
  fallbackTitle,
  categoryFallback,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [triedCategoryFallback, setTriedCategoryFallback] = useState(false);

  // Reset state when input src changes
  useEffect(() => {
    setHasError(false);
    setCurrentSrc(src);
    setTriedCategoryFallback(false);
  }, [src]);

  const handleError = () => {
    // If primary src fails and we have a category fallback we haven't tried yet:
    if (categoryFallback && !triedCategoryFallback && categoryFallback !== currentSrc) {
      setTriedCategoryFallback(true);
      setCurrentSrc(categoryFallback);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !currentSrc) {
    return (
      <div
        role="img"
        aria-label={fallbackTitle || alt}
        className={`flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#0B1711] via-[#10231A] to-[#08130E] border border-white/10 text-center overflow-hidden relative group ${className}`}
      >
        <div className="w-10 h-10 rounded-2xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime mb-2 shadow-glow-lime">
          <svg
            className="w-5 h-5 text-lime"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-white px-2 line-clamp-1">
          {fallbackTitle || alt}
        </span>
        <span className="text-[10px] text-lime/80 font-mono mt-0.5">
          KrishiCycle Visual Asset
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={className}
      {...props}
    />
  );
};
