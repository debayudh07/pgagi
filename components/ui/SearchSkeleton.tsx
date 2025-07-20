'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../lib/useTheme';

interface SearchSkeletonProps {
  count?: number;
}

export const SearchSkeleton: React.FC<SearchSkeletonProps> = ({ count = 6 }) => {
  const theme = useTheme();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-4 sm:p-6 rounded-xl border-2 shadow-lg transition-all duration-300 ${
            theme.isDark
              ? 'bg-black/60 border-gray-700'
              : 'bg-white/80 border-gray-200'
          }`}
        >
          {/* Image placeholder */}
          <div
            className={`w-full h-32 sm:h-40 rounded-lg mb-4 animate-pulse ${
              theme.isDark ? 'bg-gray-700' : 'bg-gray-300'
            }`}
          />

          {/* Title placeholder */}
          <div className="space-y-2 mb-3">
            <div
              className={`h-4 sm:h-5 rounded animate-pulse ${
                theme.isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`}
              style={{ width: '80%' }}
            />
            <div
              className={`h-3 sm:h-4 rounded animate-pulse ${
                theme.isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
              style={{ width: '60%' }}
            />
          </div>

          {/* Description placeholder */}
          <div className="space-y-2 mb-4">
            {[1, 2, 3].map((line) => (
              <div
                key={line}
                className={`h-3 rounded animate-pulse ${
                  theme.isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}
                style={{ 
                  width: line === 3 ? '40%' : '100%',
                  animationDelay: `${line * 0.1}s` 
                }}
              />
            ))}
          </div>

          {/* Badges placeholder */}
          <div className="flex gap-2 mb-4">
            {[1, 2].map((badge) => (
              <div
                key={badge}
                className={`h-6 w-16 rounded-full animate-pulse ${
                  theme.isDark ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                style={{ animationDelay: `${badge * 0.2}s` }}
              />
            ))}
          </div>

          {/* Button placeholder */}
          <div
            className={`h-8 sm:h-10 w-full rounded-lg animate-pulse ${
              theme.isDark ? 'bg-gray-600' : 'bg-gray-300'
            }`}
            style={{ animationDelay: '0.6s' }}
          />
        </motion.div>
      ))}
    </div>
  );
};
