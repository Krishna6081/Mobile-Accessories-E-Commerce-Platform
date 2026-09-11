import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, count = 0 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-300 ml-1">{rating.toFixed(1)}</span>
      {count > 0 && <span className="text-xs text-slate-500">({count})</span>}
    </div>
  );
}
