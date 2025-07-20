'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Mic, Camera } from 'lucide-react';
import { Button } from './button';
import { useTheme } from '../../lib/useTheme';

interface QuickSearchProps {
  onSearch: (query: string) => void;
  onClose: () => void;
  suggestions?: string[];
  placeholder?: string;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({
  onSearch,
  onClose,
  suggestions = [],
  placeholder = "What are you looking for?",
}) => {
  const [query, setQuery] = useState('');
  const theme = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-4 sm:pt-20"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -20 }}
        className={`w-full max-w-2xl mx-4 backdrop-blur-xl border-2 rounded-lg shadow-2xl ${
          theme.isDark
            ? 'bg-black/90 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-orange-500/30">
          <h3 className={`font-black text-lg transition-colors duration-300 ${
            theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>
            🔍 Quick Search
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 h-5 w-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className={`w-full pl-12 pr-24 py-4 text-lg rounded-lg border-2 focus:outline-none transition-all duration-300 ${
                theme.isDark
                  ? 'bg-black/50 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500'
                  : 'bg-white/50 border-orange-400/50 text-gray-900 placeholder:text-gray-500 focus:border-orange-600'
              }`}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {/* Future: Voice search */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-purple-500/20 hover:text-purple-400"
                disabled
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              {/* Future: Visual search */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-500/20 hover:text-blue-400"
                disabled
              >
                <Camera className="h-4 w-4" />
              </Button>

              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={!query.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
              >
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Quick Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-4 pt-0">
            <p className="text-sm font-bold text-orange-400 mb-3">🔥 Quick Searches:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 8).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    theme.isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-orange-500 hover:text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Categories */}
        <div className="p-4 pt-0">
          <p className="text-sm font-bold text-orange-400 mb-3">📂 Categories:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { icon: '📰', label: 'News', query: 'latest news' },
              { icon: '🎬', label: 'Movies', query: 'popular movies' },
              { icon: '🎵', label: 'Music', query: 'trending music' },
              { icon: '📱', label: 'Social', query: 'viral content' },
            ].map((category) => (
              <button
                key={category.label}
                onClick={() => handleSuggestionClick(category.query)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
                  theme.isDark
                    ? 'bg-gray-800 hover:bg-orange-500/20 hover:border-orange-500'
                    : 'bg-gray-100 hover:bg-orange-500/20 hover:border-orange-500'
                } border-2 border-transparent`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className={`text-sm font-bold transition-colors duration-300 ${
                  theme.isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
