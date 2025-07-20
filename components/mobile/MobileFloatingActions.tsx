'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Heart, TrendingUp, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../lib/useTheme';
import Link from 'next/link';

interface MobileFloatingActionsProps {
  className?: string;
}

const actions = [
  {
    icon: Search,
    label: 'Search',
    href: '/search',
    color: 'blue',
  },
  {
    icon: Heart,
    label: 'Favorites',
    href: '/favorites',
    color: 'red',
  },
  {
    icon: TrendingUp,
    label: 'Trending',
    href: '/trending',
    color: 'purple',
  },
];

export const MobileFloatingActions: React.FC<MobileFloatingActionsProps> = ({ 
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <div className={`fixed bottom-4 right-4 z-50 md:hidden ${className}`}>
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, staggerChildren: 0.1 }}
            className="flex flex-col gap-3 mb-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.5 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={action.href}>
                  <Button
                    size="icon"
                    className={`w-12 h-12 rounded-full shadow-lg border-2 font-bold transition-all duration-300 transform active:scale-95 ${
                      action.color === 'blue'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-400'
                        : action.color === 'red'
                        ? 'bg-red-500 hover:bg-red-600 text-white border-red-400'
                        : 'bg-purple-500 hover:bg-purple-600 text-white border-purple-400'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <action.icon className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg border-2 font-bold transition-all duration-300 transform active:scale-95 ${
          theme.isDark
            ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400'
            : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </motion.div>
      </Button>

      {/* Background overlay when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
