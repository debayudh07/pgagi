'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  TrendingUp,
  Heart,
  Settings,
  Search,
  User,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { toggleDarkMode } from '../../store/slices/userSlice';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'FEED',
    href: '/',
    icon: Home,
    description: '🚀 Your Epic Feed',
    emoji: '🏠',
  },
  {
    name: 'TRENDING',
    href: '/trending',
    icon: TrendingUp,
    description: '🔥 Viral Content',
    emoji: '📈',
  },
  {
    name: 'FAVORITES',
    href: '/favorites',
    icon: Heart,
    description: '💖 Saved Treasures',
    emoji: '⭐',
  },
  {
    name: 'SEARCH',
    href: '/search',
    icon: Search,
    description: '🔍 Find Content',
    emoji: '🕵️',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { preferences, user, isAuthenticated } = useAppSelector(state => state.user);
  const { favorites } = useAppSelector(state => state.content);

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div className={cn('flex flex-col h-full bg-black/90 backdrop-blur-xl border-r-2 border-orange-500', className)}>
      {/* Logo/Brand */}
      <div className="p-6 border-b-2 border-orange-500">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center border-2 border-orange-400 shadow-lg shadow-orange-500/30 transform hover:scale-110 transition-all duration-300">
            <span className="text-white font-black text-lg">💥</span>
          </div>
          <span className="font-black text-xl text-white" style={{ textShadow: '2px 2px 0px #ff6600' }}>
            PERSONAL<span className="text-orange-500">DASH</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className={cn(
                    'w-full justify-start gap-3 h-14 border-2 font-black transition-all duration-300 transform hover:scale-105',
                    isActive 
                      ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/30' 
                      : 'bg-black/60 text-white border-orange-500/50 hover:bg-orange-500 hover:border-orange-400 backdrop-blur-sm'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.emoji}</span>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-black text-sm">{item.name}</span>
                    <span className={cn(
                      'text-xs font-bold',
                      isActive ? 'text-orange-100' : 'text-orange-300'
                    )}>
                      {item.description}
                    </span>
                  </div>
                  {item.name === 'FAVORITES' && favorites.length > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white border-red-400 font-black animate-pulse">
                      {favorites.length}
                    </Badge>
                  )}
                </Button>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Settings */}
      <div className="p-4 border-t-2 border-orange-500 space-y-3 bg-black/60 backdrop-blur-sm">
        {/* Theme Toggle */}
        <Button
          onClick={handleThemeToggle}
          className="w-full justify-start gap-3 bg-black/60 text-white border-2 border-blue-500 hover:bg-blue-500 font-bold transition-all duration-300 transform hover:scale-105"
        >
          {preferences.darkMode ? (
            <>
              <Sun className="h-5 w-5" />
              <span>☀️ LIGHT MODE</span>
            </>
          ) : (
            <>
              <Moon className="h-5 w-5" />
              <span>🌙 DARK MODE</span>
            </>
          )}
        </Button>

        {/* Settings */}
        <Link href="/settings">
          <Button
            className="w-full justify-start gap-3 bg-black/60 text-white border-2 border-purple-500 hover:bg-purple-500 font-bold transition-all duration-300 transform hover:scale-105"
          >
            <Settings className="h-5 w-5" />
            <span>⚙️ SETTINGS</span>
          </Button>
        </Link>

        {/* User Profile */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/20 border-2 border-green-500 backdrop-blur-sm">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-2 border-green-400 shadow-lg shadow-green-500/30">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate text-white">{user.name}</p>
              <p className="text-xs text-green-300 truncate font-bold">{user.email}</p>
            </div>
          </div>
        ) : (
          <Link href="/auth">
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-400 font-black transform hover:scale-105 transition-all duration-300">
              🚀 SIGN IN
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
