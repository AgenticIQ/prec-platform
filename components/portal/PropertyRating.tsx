'use client';

import { useState } from 'react';

export type PropertyCategory = 'love' | 'like' | 'leave' | null;

interface PropertyRatingProps {
  propertyMlsNumber: string;
  initialCategory?: PropertyCategory;
  onRate: (category: PropertyCategory) => Promise<void>;
  size?: 'small' | 'medium' | 'large';
}

export default function PropertyRating({
  propertyMlsNumber,
  initialCategory,
  onRate,
  size = 'medium',
}: PropertyRatingProps) {
  const [category, setCategory] = useState<PropertyCategory>(initialCategory || null);
  const [loading, setLoading] = useState(false);

  const handleRate = async (newCategory: PropertyCategory) => {
    if (loading) return;

    setLoading(true);
    const previousCategory = category;

    try {
      // Optimistic update
      setCategory(newCategory);
      await onRate(newCategory);
    } catch (error) {
      // Revert on error
      setCategory(previousCategory);
      alert('Failed to save rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2',
  };

  const buttonClass = sizeClasses[size];

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleRate('love')}
        disabled={loading}
        className={`${buttonClass} rounded-md font-medium transition-all ${
          category === 'love'
            ? 'bg-red-600 text-white shadow-md'
            : 'bg-red-100 text-red-700 hover:bg-red-200'
        } disabled:opacity-50`}
        title="Love It!"
      >
        ❤️ Love It!
      </button>

      <button
        onClick={() => handleRate('like')}
        disabled={loading}
        className={`${buttonClass} rounded-md font-medium transition-all ${
          category === 'like'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        } disabled:opacity-50`}
        title="Like It!"
      >
        👍 Like It!
      </button>

      <button
        onClick={() => handleRate('leave')}
        disabled={loading}
        className={`${buttonClass} rounded-md font-medium transition-all ${
          category === 'leave'
            ? 'bg-gray-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } disabled:opacity-50`}
        title="Leave It!!!"
      >
        👎 Leave It!!!
      </button>
    </div>
  );
}
