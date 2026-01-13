'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export default function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showValue = false,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayRating = hoveredRating || rating;

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          onMouseEnter={() => !readonly && setHoveredRating(value)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
          disabled={readonly}
          className={`
            ${readonly ? 'cursor-default' : 'cursor-pointer'}
            transition-transform hover:scale-110
          `}
        >
          <Star
            className={`
              ${sizeClasses[size]}
              ${
                value <= displayRating
                  ? 'text-brand-energy-orange fill-brand-energy-orange'
                  : 'text-gray-300'
              }
              transition-colors
            `}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

