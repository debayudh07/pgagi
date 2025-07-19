'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/useTheme';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={cn(`h-screen flex ${theme.transitionColors} ${
      theme.isDark 
        ? 'bg-gradient-to-br from-black via-gray-900 to-black' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`, className)}>
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-10 left-10 w-32 h-32 rounded-full blur-xl animate-pulse ${
          theme.isDark ? 'bg-orange-500/10' : 'bg-orange-400/20'
        }`}></div>
        <div className={`absolute bottom-20 right-20 w-40 h-40 rounded-full blur-xl animate-pulse delay-1000 ${
          theme.isDark ? 'bg-blue-500/10' : 'bg-blue-400/20'
        }`}></div>
        <div className={`absolute top-1/2 left-1/4 w-24 h-24 rounded-full blur-xl animate-pulse delay-500 ${
          theme.isDark ? 'bg-purple-500/10' : 'bg-purple-400/20'
        }`}></div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-64 flex-shrink-0 relative z-10">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleSidebar}
          />
          <div className="fixed inset-y-0 left-0 w-64 z-50 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header onMenuClick={toggleSidebar} />
        
        {/* Page Content */}
        <main className={`flex-1 overflow-auto ${theme.transitionColors} ${
          theme.isDark ? 'bg-black/20' : 'bg-white/50'
        } backdrop-blur-sm`}>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
