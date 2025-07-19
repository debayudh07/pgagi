'use client';

import React, { useEffect } from 'react';
import { globalTheme } from '../../lib/globalTheme';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { toggleDarkMode } from '../../store/slices/userSlice';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { preferences } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  // Sync Redux state with global theme manager
  useEffect(() => {
    // Set initial theme from Redux state
    globalTheme.setTheme(preferences.darkMode);
    
    // Subscribe to global theme changes and sync with Redux
    const unsubscribe = globalTheme.subscribe((isDark) => {
      if (isDark !== preferences.darkMode) {
        dispatch(toggleDarkMode());
      }
    });

    return unsubscribe;
  }, [preferences.darkMode, dispatch]);

  return (
    <div className="min-h-screen theme-bg theme-text theme-transition">
      {children}
    </div>
  );
};
