'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  hasNextPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  loadingComponent?: React.ReactNode;
  loadingMoreComponent?: React.ReactNode;
  threshold?: number; // Distance from bottom to trigger load more (in pixels)
  className?: string;
}

export const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> = ({
  children,
  hasNextPage,
  isLoading,
  isLoadingMore,
  onLoadMore,
  loadingComponent,
  loadingMoreComponent,
  threshold = 200,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoadingMore || !hasNextPage) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Check if we're near the bottom
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      onLoadMore();
    }
  }, [hasNextPage, isLoadingMore, onLoadMore, threshold]);

  // Intersection Observer for more efficient scroll detection
  useEffect(() => {
    if (!loadMoreTriggerRef.current || !hasNextPage || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isLoadingMore) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    );

    observer.observe(loadMoreTriggerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isLoadingMore, onLoadMore, threshold]);

  // Scroll event listener as fallback
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ maxHeight: '100vh' }}
    >
      {/* Main content */}
      {children}

      {/* Load more trigger (invisible) */}
      <div ref={loadMoreTriggerRef} className="h-1 w-full" />

      {/* Loading more indicator */}
      {isLoadingMore && hasNextPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex justify-center items-center py-6"
        >
          {loadingMoreComponent || (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-blue-400 font-bold">Loading more content...</span>
            </div>
          )}
        </motion.div>
      )}

      {/* No more content indicator */}
      {!hasNextPage && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-6"
        >
          <div className="text-gray-500 font-medium text-sm">
            🎉 Youve reached the end! No more content to load.
          </div>
        </motion.div>
      )}
    </div>
  );
};
