/*eslint-disable*/
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SearchBar } from '../../components/forms/SearchBar';
import { ContentGrid } from '../../components/content/ContentGrid';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAppSelector } from '../../hooks/redux';
import { ContentItem } from '../../types';

export default function SearchPage() {
  const { searchResults, searchQuery, activeFilters, loading } = useAppSelector(state => state.content);

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`Search action: ${action} on item:`, item);
  };

  const getResultsByType = () => {
    const grouped = {
      news: searchResults.filter(item => item.type === 'news'),
      movies: searchResults.filter(item => item.type === 'movie'),
      music: searchResults.filter(item => item.type === 'music'),
      social: searchResults.filter(item => item.type === 'social'),
    };
    return grouped;
  };

  const groupedResults = getResultsByType();

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-green-500/20 backdrop-blur-sm border-2 border-green-500 rounded-lg">
            <Search className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white" style={{ textShadow: '2px 2px 0px #ff6600' }}>
              🔍 SEARCH COMMAND CENTER
            </h1>
            <p className="text-orange-500 font-bold mt-1">
              🌌 Scan the multiverse for epic content across all dimensions! ⚡
            </p>
          </div>
        {/* Search Bar */}
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔍</span>
              <h3 className="text-lg font-black text-white">SCAN PARAMETERS</h3>
            </div>
            <SearchBar />
          </CardContent>
        </Card> 
        <Card>
        <CardContent className="p-6 bg-black/60 backdrop-blur-md border border-orange-500/30 rounded-lg text-white">
            Search
          </CardContent>
        </Card>
        </div>

        {/* Search Tips */}
        {!searchQuery && (
          <Card className="bg-black/80 backdrop-blur-xl border-2 border-blue-500 shadow-lg shadow-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white font-black">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                ⚡ SEARCH INTEL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/40 backdrop-blur-sm border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-black mb-3 text-blue-400">📡 SCAN TARGETS:</h4>
                  <ul className="space-y-2 text-sm text-orange-200 font-bold">
                    <li>• 📰 Breaking news by topic or keyword</li>
                    <li>• 🎬 Epic movies by title, genre, or hero</li>
                    <li>• 🎵 Power tracks by artist or song name</li>
                    <li>• 📱 Viral posts by hashtag or content</li>
                  </ul>
                </div>
                <div className="bg-black/40 backdrop-blur-sm border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-black mb-3 text-purple-400">🚀 PRO TACTICS:</h4>
                  <ul className="space-y-2 text-sm text-orange-200 font-bold">
                    <li>• ⚙️ Use filters to focus your scan</li>
                    <li>• 🎯 Try specific keywords for precision</li>
                    <li>• 💥 Search is case-insensitive</li>
                    <li>• ⚡ Live results as you type</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading.isLoading && (
          <Card className="bg-black/80 backdrop-blur-xl border-2 border-green-500 shadow-lg shadow-green-500/20">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-6"></div>
                <h3 className="text-xl font-black text-white mb-2">🔍 SCANNING MULTIVERSE</h3>
                <p className="text-green-400 font-bold">Searching across all dimensions...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results Summary */}
        {searchQuery && !loading.isLoading && (
          <Card className="bg-black/60 backdrop-blur-md border border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-orange-400 font-bold">🎯 SCAN RESULTS FOR:</span>
                  <Badge className="bg-blue-500/80 text-white border-blue-400 font-bold">{searchQuery}</Badge>
                  {activeFilters.type && (
                    <Badge className="bg-purple-500/80 text-white border-purple-400 font-bold">
                      {activeFilters.type}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-green-400 font-bold">
                  ⚡ {searchResults.length} {searchResults.length !== 1 ? 'TARGETS' : 'TARGET'} DETECTED
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {searchQuery && !loading.isLoading && searchResults.length === 0 && (
          <Card className="bg-black/80 backdrop-blur-xl border-2 border-red-500 shadow-lg shadow-red-500/20">
            <CardContent className="p-8 md:p-12 text-center">
              <span className="text-6xl mb-6 block animate-bounce">🔍</span>
              <h3 className="text-xl font-black mb-4 text-red-400">💥 NO TARGETS DETECTED!</h3>
              <p className="text-white font-bold mb-6">
                Scan failed for "{searchQuery}". Recalibrate your search parameters! ⚡
              </p>
              <div className="bg-black/40 backdrop-blur-sm border border-orange-500/30 rounded-lg p-4 space-y-3 text-left max-w-md mx-auto">
                <p className="text-orange-400 font-bold text-sm">🛠️ TROUBLESHOOTING:</p>
                <ul className="space-y-2 text-sm text-orange-200 font-bold">
                  <li>🔧 Check for typos in scan query</li>
                  <li>🎯 Try different target keywords</li>
                  <li>⚙️ Remove filters to expand scan range</li>
                  <li>🌐 Use broader search terms</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Results */}
        {searchResults.length > 0 && !loading.isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black/40 backdrop-blur-md border border-orange-500/30 rounded-lg p-4 md:p-6"
          >
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <span className="text-2xl md:text-3xl">🎯</span>
              <h3 className="text-lg md:text-xl font-black text-white">ALL DETECTED TARGETS</h3>
              <Badge className="bg-green-500/80 text-white border-green-400 font-bold">{searchResults.length}</Badge>
            </div>
            <ContentGrid
              items={searchResults}
              onAction={handleContentAction}
              enableDragDrop={false}
            />
          </motion.div>
        )}

        {/* Grouped Results by Type */}
        {searchResults.length > 0 && !loading.isLoading && !activeFilters.type && (
          <div className="space-y-8">
            {Object.entries(groupedResults).map(([type, items]) => {
              if (items.length === 0) return null;

              const typeConfig = {
                news: { label: 'BREAKING NEWS', icon: '📰', color: 'text-blue-400', bgColor: 'shadow-blue-500/20 hover:shadow-blue-500/40' },
                movies: { label: 'CINEMA VAULT', icon: '🎬', color: 'text-purple-400', bgColor: 'shadow-purple-500/20 hover:shadow-purple-500/40' },
                music: { label: 'SOUND WAVES', icon: '🎵', color: 'text-green-400', bgColor: 'shadow-green-500/20 hover:shadow-green-500/40' },
                social: { label: 'SOCIAL NETWORK', icon: '📱', color: 'text-orange-400', bgColor: 'shadow-orange-500/20 hover:shadow-orange-500/40' },
              }[type] || { label: type.toUpperCase(), icon: '📄', color: 'text-gray-400', bgColor: 'shadow-gray-500/20 hover:shadow-gray-500/40' };

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-black/40 backdrop-blur-md border border-orange-500/30 rounded-lg p-4 md:p-6"
                >
                  <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                    <span className="text-2xl md:text-3xl">{typeConfig.icon}</span>
                    <h2 className={`text-lg md:text-xl font-black text-white ${typeConfig.color}`}>
                      {typeConfig.label}
                    </h2>
                    <Badge className={`bg-${typeConfig.color.split('-')[1]}-500/80 text-white border-${typeConfig.color.split('-')[1]}-400 font-bold`}>
                      {items.length}
                    </Badge>
                  </div>
                  <ContentGrid
                    items={items.slice(0, 8)} // Limit to 8 per category
                    onAction={handleContentAction}
                    enableDragDrop={false}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Popular Searches */}
        {!searchQuery && (
          <Card className="bg-black/80 backdrop-blur-xl border-2 border-purple-500 shadow-lg shadow-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white font-black">
                <Filter className="h-5 w-5 text-blue-500" />
                🔥 TRENDING SEARCHES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  'artificial intelligence',
                  'climate change',
                  'cryptocurrency',
                  'space exploration',
                  'renewable energy',
                  'machine learning',
                  'sustainable technology',
                  'virtual reality'
                ].map((term) => (
                  <Badge
                    key={term}
                    className="cursor-pointer bg-gradient-to-r from-purple-500 to-blue-500 text-white border-2 border-purple-400 hover:from-blue-500 hover:to-purple-500 font-bold transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                      // This would trigger a search for the term
                      console.log(`Search for: ${term}`);
                    }}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
