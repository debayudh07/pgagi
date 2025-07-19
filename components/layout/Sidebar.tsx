'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  TrendingUp,
  Heart,
  Search,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/useTheme';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setActiveTab } from '../../store/slices/contentSlice';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'DASHBOARD',
    href: '/dashboard',
    icon: Home,
    description: '🚀 Personal Feed & Dashboard',
    emoji: '🏠',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    name: 'TRENDING',
    href: '/trending',
    icon: TrendingUp,
    description: '🔥 Viral Content',
    emoji: '📈',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    name: 'FAVORITES',
    href: '/favorites',
    icon: Heart,
    description: '💖 Saved Treasures',
    emoji: '⭐',
    gradient: 'from-pink-500 to-purple-500',
  },
  {
    name: 'SEARCH',
    href: '/search',
    icon: Search,
    description: '🔍 Find Content',
    emoji: '🕵️',
    gradient: 'from-purple-500 to-blue-500',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { favorites } = useAppSelector(state => state.content);
  const theme = useTheme();

  return (
    <div className={cn(`flex flex-col h-full backdrop-blur-xl border-r-2 shadow-2xl ${theme.transitionColors} ${
      theme.isDark
        ? 'bg-black/95 border-orange-500/50 shadow-orange-500/10'
        : 'bg-white/95 border-orange-600/50 shadow-orange-600/10'
    }`, className)}>
      {/* Logo/Brand */}
      <div className={`p-4 border-b-2 ${theme.transitionColors} ${
        theme.isDark ? 'border-orange-500/30' : 'border-orange-600/30'
      }`}>
        <Link href="/" className="flex items-center gap-2">
          <div className={`w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center border-2 border-orange-400 shadow-lg shadow-orange-500/40 transform hover:scale-110 ${theme.transitionFast}`}>
            <span className="text-white font-black text-lg">💥</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-lg ${theme.transitionColors} ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`} style={{ textShadow: '2px 2px 0px #ff6600' }}>
              PERSONAL<span className="text-orange-500">DASH</span>
            </span>
            <span className="text-xs text-orange-300 font-bold">✨ Your Digital Hub</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
              >
                <div
                  className={cn(
                    'relative group flex items-center gap-3 p-3 rounded-lg border-2 font-black transition-all duration-300 transform hover:scale-105 overflow-hidden',
                    isActive 
                      ? `bg-gradient-to-r ${item.gradient} text-white border-white/30 shadow-lg shadow-orange-500/30` 
                      : theme.isDark
                        ? 'bg-black/60 text-white border-orange-500/30 hover:border-orange-400 backdrop-blur-sm hover:bg-black/80'
                        : 'bg-white/60 text-gray-900 border-orange-400/30 hover:border-orange-600 backdrop-blur-sm hover:bg-white/80'
                  )}
                >
                  {/* Background gradient overlay for hover */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300',
                    item.gradient
                  )} />
                  
                  {/* Icon container */}
                  <div className={cn(
                    'relative w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-300',
                    isActive 
                      ? 'bg-white/20 border-white/30 shadow-lg' 
                      : theme.isDark
                        ? 'bg-orange-500/20 border-orange-500/50 group-hover:bg-orange-500/30 group-hover:border-orange-400'
                        : 'bg-orange-100/80 border-orange-400/50 group-hover:bg-orange-200/80 group-hover:border-orange-600'
                  )}>
                    <span className="text-xl">{item.emoji}</span>
                    <Icon className="absolute h-4 w-4 opacity-60" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative flex flex-col items-start flex-1 min-w-0">
                    <span className="font-black text-sm tracking-wide">{item.name}</span>
                    <span className={cn(
                      'text-xs font-bold truncate w-full',
                      isActive 
                        ? 'text-white/80' 
                        : theme.isDark
                          ? 'text-orange-300 group-hover:text-orange-200'
                          : 'text-orange-600 group-hover:text-orange-700'
                    )}>
                      {item.description}
                    </span>
                  </div>
                  
                  {/* Favorites badge */}
                  {item.name === 'FAVORITES' && favorites.length > 0 && (
                    <div className="relative">
                      <Badge className="bg-red-500 text-white border-red-400 font-black animate-pulse shadow-lg">
                        {favorites.length}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className={`w-1 h-6 rounded-full shadow-lg ${theme.transitionColors} ${
                        theme.isDark ? 'bg-white' : 'bg-orange-800'
                      }`}></div>
                    </div>
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
