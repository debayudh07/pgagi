// Global Theme Manager - Direct DOM manipulation for instant updates
class GlobalThemeManager {
  private isDark: boolean = false;
  private listeners: Set<(isDark: boolean) => void> = new Set();

  constructor() {
    // Initialize theme from localStorage or system preference
    this.initializeTheme();
  }

  private initializeTheme() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-mode');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      this.isDark = saved ? saved === 'dark' : systemDark;
      this.applyTheme(this.isDark);
    }
  }

  private applyTheme(isDark: boolean) {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const body = document.body;
      
      // Use requestAnimationFrame for immediate DOM updates
      requestAnimationFrame(() => {
        if (isDark) {
          html.setAttribute('data-theme', 'dark');
          html.classList.add('dark');
          html.classList.remove('light');
          body.style.colorScheme = 'dark';
        } else {
          html.setAttribute('data-theme', 'light');
          html.classList.add('light');
          html.classList.remove('dark');
          body.style.colorScheme = 'light';
        }
      });
    }
  }

  public toggle(): boolean {
    this.isDark = !this.isDark;
    
    // Apply theme immediately to DOM
    this.applyTheme(this.isDark);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', this.isDark ? 'dark' : 'light');
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.isDark));
    
    return this.isDark;
  }

  public setTheme(isDark: boolean): void {
    if (this.isDark !== isDark) {
      this.isDark = isDark;
      this.applyTheme(isDark);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
      }
      
      this.listeners.forEach(listener => listener(isDark));
    }
  }

  public getCurrentTheme(): boolean {
    return this.isDark;
  }

  public subscribe(listener: (isDark: boolean) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current state
    listener(this.isDark);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Get CSS classes for components that need conditional styling
  public getThemeClasses() {
    return {
      isDark: this.isDark,
      bg: this.isDark ? 'bg-gray-900' : 'bg-gray-50',
      cardBg: 'theme-card-bg',
      sidebarBg: 'theme-sidebar-bg',
      text: 'theme-text',
      textSecondary: 'theme-text-secondary',
      textMuted: 'theme-text-muted',
      border: 'theme-border',
      borderAccent: 'theme-border-accent',
      hover: 'theme-hover',
      active: 'theme-active',
      accent: 'theme-accent',
      accentBg: 'theme-accent-bg',
      accentBorder: 'theme-accent-border',
      transition: 'theme-transition',
    };
  }
}

// Create singleton instance
export const globalTheme = new GlobalThemeManager();

// Hook for React components
export const useGlobalTheme = () => {
  const [isDark, setIsDark] = useState(globalTheme.getCurrentTheme());
  
  useEffect(() => {
    const unsubscribe = globalTheme.subscribe(setIsDark);
    return unsubscribe;
  }, []);

  return {
    isDark,
    toggle: globalTheme.toggle.bind(globalTheme),
    setTheme: globalTheme.setTheme.bind(globalTheme),
    classes: globalTheme.getThemeClasses(),
  };
};

// React hook for the optimized theme classes
import { useState, useEffect } from 'react';

export default globalTheme;
