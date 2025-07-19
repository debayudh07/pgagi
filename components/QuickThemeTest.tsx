'use client';

import React from 'react';
import { useGlobalTheme } from '../lib/globalTheme';

export const QuickThemeTest: React.FC = () => {
  const theme = useGlobalTheme();

  return (
    <div className="p-4 space-y-4">
      <button 
        onClick={theme.toggle}
        className="theme-card-bg theme-text theme-border theme-transition border-2 rounded-lg p-4 hover:theme-hover"
      >
        Toggle Theme (Current: {theme.isDark ? 'Dark' : 'Light'})
      </button>
      
      <div className="theme-card-bg theme-border theme-transition border rounded-lg p-4">
        <h3 className="theme-text font-bold">Test Card</h3>
        <p className="theme-text-secondary">This should update instantly</p>
      </div>
    </div>
  );
};
