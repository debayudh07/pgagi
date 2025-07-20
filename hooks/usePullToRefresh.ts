'use client';

import { useEffect, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => void;
  threshold?: number;
  disabled?: boolean;
}

export const usePullToRefresh = ({ 
  onRefresh, 
  threshold = 60, 
  disabled = false 
}: UsePullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    if (disabled) return;

    let isTouching = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        isTouching = true;
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching || window.scrollY > 0) return;

      const currentTouchY = e.touches[0].clientY;
      setCurrentY(currentTouchY);
      
      const distance = currentTouchY - startY;
      if (distance > 0) {
        setPullDistance(Math.min(distance, threshold * 2));
        // Prevent default scrolling when pulling down
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isTouching) return;
      
      isTouching = false;
      
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        onRefresh();
        
        // Auto-reset after 2 seconds
        setTimeout(() => {
          setIsRefreshing(false);
        }, 2000);
      }
      
      setPullDistance(0);
      setStartY(0);
      setCurrentY(0);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, onRefresh, threshold, startY, pullDistance, isRefreshing]);

  const resetRefresh = () => {
    setIsRefreshing(false);
    setPullDistance(0);
  };

  return {
    isRefreshing,
    pullDistance,
    resetRefresh,
    isPulling: pullDistance > 0,
  };
};
