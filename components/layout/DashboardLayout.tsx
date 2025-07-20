'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from '../mobile/MobileBottomNav';
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
      {/* Background effects - Mobile Responsive */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-5 left-5 sm:top-10 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 rounded-full blur-xl animate-pulse ${
          theme.isDark ? 'bg-orange-500/10' : 'bg-orange-400/20'
        }`}></div>
        <div className={`absolute bottom-10 right-10 sm:bottom-20 sm:right-20 w-20 h-20 sm:w-40 sm:h-40 rounded-full blur-xl animate-pulse delay-1000 ${
          theme.isDark ? 'bg-blue-500/10' : 'bg-blue-400/20'
        }`}></div>
        <div className={`absolute top-1/2 left-1/4 w-12 h-12 sm:w-24 sm:h-24 rounded-full blur-xl animate-pulse delay-500 ${
          theme.isDark ? 'bg-purple-500/10' : 'bg-purple-400/20'
        }`}></div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-48 lg:w-64 flex-shrink-0 relative z-10">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleSidebar}
          />
          <div className="fixed inset-y-0 left-0 w-56 sm:w-64 z-50 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main Content - Mobile Responsive */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header onMenuClick={toggleSidebar} />
        
        {/* Page Content */}
        <main className={`flex-1 overflow-auto ${theme.transitionColors} ${
          theme.isDark ? 'bg-black/20' : 'bg-white/50'
        } backdrop-blur-sm pb-20 md:pb-0`}>
          <div className="w-full max-w-none px-0 sm:px-2 md:px-4 lg:px-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Mobile Bottom Safe Area */}
      <div className="fixed bottom-0 left-0 right-0 h-safe-area-inset-bottom bg-transparent pointer-events-none md:hidden"></div>
    </div>
  );
};
