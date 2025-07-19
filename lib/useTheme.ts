import { useMemo } from 'react';
import { useAppSelector } from '../hooks/redux';

export const useTheme = () => {
  const isDarkMode = useAppSelector(state => state.user.preferences.darkMode);

  // Memoize theme object to prevent unnecessary re-renders
  const theme = useMemo(() => ({
    isDark: isDarkMode,
    // Background colors
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBackground: isDarkMode ? 'bg-black/80' : 'bg-white',
    sidebarBackground: isDarkMode ? 'bg-black/95' : 'bg-white/95',
    
    // Text colors
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    
    // Border colors
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    borderAccent: isDarkMode ? 'border-orange-500/50' : 'border-orange-600/70',
    
    // Interactive states
    hover: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100',
    active: isDarkMode ? 'bg-gray-800' : 'bg-gray-100',
    
    // Accent colors (maintaining orange theme)
    accent: isDarkMode ? 'text-orange-400' : 'text-orange-600',
    accentBg: isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100',
    accentBorder: isDarkMode ? 'border-orange-500/50' : 'border-orange-300',
    
    // Shadow colors
    shadow: isDarkMode ? 'shadow-gray-900/50' : 'shadow-gray-300/50',
    shadowAccent: isDarkMode ? 'shadow-orange-500/20' : 'shadow-orange-600/30',
    
    // Optimized transition utilities
    transition: 'transition-all duration-150 ease-out',
    transitionColors: 'transition-colors duration-150 ease-out',
    transitionFast: 'transition-all duration-100 ease-out',
  }), [isDarkMode]);

  return theme;
};

export default useTheme;
