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
  User,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { useTheme } from '../../lib/useTheme';
import { useAppSelector } from '../../hooks/redux';

interface MobileBottomNavProps {
  className?: string;
}

const navigation = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home,
    emoji: '🏠',
  },
  {
    name: 'Trending',
    href: '/trending',
    icon: TrendingUp,
    emoji: '📈',
  },
  {
    name: 'Search',
    href: '/search',
    icon: Search,
    emoji: '🔍',
  },
  {
    name: 'Favorites',
    href: '/favorites',
    icon: Heart,
    emoji: '❤️',
  },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ className }) => {
  const pathname = usePathname();
  const theme = useTheme();
  const { favorites } = useAppSelector(state => state.content);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 md:hidden ${className}`}>
      {/* Main Navigation Bar */}
      <div className={`backdrop-blur-xl border-t-2 shadow-lg ${theme.transitionColors} ${
        theme.isDark
          ? 'bg-black/90 border-orange-500/50 shadow-orange-500/20'
          : 'bg-white/90 border-orange-600/50 shadow-orange-600/20'
      }`}>
        <div className="grid grid-cols-4 px-2 py-2 safe-area-inset-bottom">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? theme.isDark
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-orange-100/80 text-orange-600'
                      : theme.isDark
                        ? 'text-gray-400 hover:text-orange-300'
                        : 'text-gray-600 hover:text-orange-500'
                  }`}
                >
                  {/* Icon Container */}
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-orange-500/30 border-2 border-orange-400/50'
                        : 'border-2 border-transparent'
                    }`}>
                      <span className="text-sm">{item.emoji}</span>
                      <Icon className="absolute h-3 w-3 opacity-60" />
                    </div>
                    
                    {/* Favorites badge */}
                    {item.name === 'Favorites' && favorites.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs bg-red-500 text-white border-red-400 font-black">
                        {favorites.length > 9 ? '9+' : favorites.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`text-xs font-bold mt-1 transition-colors duration-300 ${
                    isActive ? 'text-orange-500' : 'inherit'
                  }`}>
                    {item.name}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavActiveIndicator"
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-orange-500 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Safe area padding for devices with home indicators */}
      <div className={`h-safe-area-inset-bottom ${theme.transitionColors} ${
        theme.isDark ? 'bg-black/90' : 'bg-white/90'
      }`}></div>
    </div>
  );
};
