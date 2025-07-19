/*eslint-disable*/
'use client';

import React, { useEffect } from 'react';
import { Bell, Menu, Settings, User, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { SearchBar } from '../forms/SearchBar';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useAuth } from '../../lib/auth';
import { globalTheme, useGlobalTheme } from '../../lib/globalTheme';
import { syncUserFromSession } from '../../store/slices/userSlice';
import { cn } from '../../lib/utils';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  showSearch = true,
  className,
}) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.user);
  const { session, signOut } = useAuth();
  const theme = useGlobalTheme();

  // Sync user from NextAuth session
  useEffect(() => {
    dispatch(syncUserFromSession(session));
  }, [session, dispatch]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className={cn(`backdrop-blur-xl border-b-2 shadow-lg ${theme.classes.transition} ${
      theme.isDark
        ? 'bg-black/90 border-orange-500 shadow-orange-500/20'
        : 'bg-white/90 border-orange-600 shadow-orange-600/20'
    }`, className)}>
      <div className="flex items-center justify-between p-4">
        {/* Left Side - Menu and Search */}
        <div className="flex items-center flex-1 gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className={`md:hidden border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white ${theme.classes.transition} transform hover:scale-105`}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-2xl">
              <SearchBar />
            </div>
          )}
        </div>

        {/* Right Side - Actions and User */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => theme.toggle()}
            className={cn(
              "border-2 transform hover:scale-105",
              theme.classes.transition,
              theme.isDark
                ? "border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                : "border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
            )}
            title={theme.isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme.isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={`relative border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white ${theme.classes.transition} transform hover:scale-105`}
          >
            <Bell className="h-5 w-5" />
            <Badge
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white border-red-400 font-black animate-pulse"
            >
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon"
            className={`border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white ${theme.classes.transition} transform hover:scale-105`}
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Avatar/Menu */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className={`hidden md:block text-right backdrop-blur-sm border rounded-lg p-2 ${theme.classes.transition} ${
                theme.isDark
                  ? 'bg-black/60 border-orange-500/30'
                  : 'bg-white/60 border-orange-400/50'
              }`}>
                <p className={`text-sm font-black ${theme.classes.transition} ${
                  theme.isDark ? 'text-white' : 'text-gray-900'
                }`}>{user.name}</p>
                <p className="text-xs text-orange-400 font-bold">{user.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full border-2 border-green-500 hover:bg-green-500 ${theme.classes.transition} transform hover:scale-110`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-green-400"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-green-400">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSignOut}
                  title="🚀 LOGOUT"
                  className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Link href="/auth/signin">
              <Button 
                variant="default" 
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-400 font-black transform hover:scale-105 transition-all duration-300"
              >
                🚀 SIGN IN
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
