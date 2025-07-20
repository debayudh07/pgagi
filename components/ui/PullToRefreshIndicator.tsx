'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { useTheme } from '../../lib/useTheme';

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
  pullDistance: number;
  threshold?: number;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  isRefreshing,
  pullDistance,
  threshold = 60,
}) => {
  const theme = useTheme();
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShow = pullDistance > 10 || isRefreshing;

  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: shouldShow ? 1 : 0 }}
      className="fixed top-0 left-0 right-0 z-40 flex justify-center"
      style={{
        transform: `translateY(${Math.min(pullDistance / 3, 40)}px)`,
      }}
    >
      <div
        className={`mt-4 p-3 rounded-full shadow-lg border-2 transition-all duration-300 ${
          theme.isDark
            ? 'bg-black/90 border-purple-500 text-white'
            : 'bg-white/90 border-purple-600 text-gray-900'
        }`}
      >
        {isRefreshing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="h-6 w-6 text-blue-500" />
          </motion.div>
        ) : (
          <motion.div
            animate={{ 
              scale: progress,
              rotate: progress * 180 
            }}
            className="flex items-center gap-2"
          >
            <ArrowDown 
              className={`h-6 w-6 transition-colors duration-300 ${
                progress >= 1 ? 'text-green-500' : 'text-gray-400'
              }`} 
            />
            {progress >= 1 && (
              <span className="text-sm font-bold text-green-500">
                Release to refresh
              </span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
