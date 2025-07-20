/*eslint-disable*/
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Star, 
  ExternalLink, 
  Heart, 
  User, 
  Film, 
  Music, 
  Newspaper,
  Share2,
  Download,
  Bookmark,
  Play
} from 'lucide-react';
import { ContentItem, Movie, NewsArticle, MusicTrack, SocialPost } from '../../types';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { formatDate } from '../../lib/utils';
import { useTheme } from '../../lib/useTheme';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addToFavorites, removeFromFavorites } from '../../store/slices/contentSlice';

interface ContentDetailModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.content.favorites);
  const theme = useTheme();
  
  console.log('🎭 ContentDetailModal: Rendering with:', { 
    hasItem: !!item, 
    isOpen, 
    itemId: item?.id, 
    itemTitle: item?.title,
    itemType: item?.type,
    itemKeys: item ? Object.keys(item) : [],
    fullItem: item
  });
  
  if (!item) {
    console.log('🎭 ContentDetailModal: No item provided, returning null');
    return null;
  }

  // Validate item structure
  if (typeof item !== 'object' || !item.id || !item.type || !item.title) {
    console.error('🚨 ContentDetailModal: Invalid item structure:', item);
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">⚠️ Invalid Content</h2>
          <p className="text-gray-400">The content item has an invalid structure and cannot be displayed.</p>
          <pre className="mt-4 text-xs text-gray-500 bg-black/40 p-3 rounded overflow-auto">
            {JSON.stringify(item, null, 2)}
          </pre>
        </div>
      </Modal>
    );
  }
  
  // Type guards for better type safety
  const isMovie = (item: ContentItem): item is Movie => item.type === 'movie';
  const isNews = (item: ContentItem): item is NewsArticle => item.type === 'news';
  const isMusic = (item: ContentItem): item is MusicTrack => item.type === 'music';
  const isSocial = (item: ContentItem): item is SocialPost => item.type === 'social';
  
  const isFavorite = favorites.some(fav => fav.id === item.id);

  const handleFavoriteToggle = () => {
    console.log('🔥 Modal: Toggling favorite for item:', item.id);
    if (isFavorite) {
      dispatch(removeFromFavorites(item.id));
    } else {
      dispatch(addToFavorites(item.id));
    }
  };

  const handleExternalLink = () => {
    console.log('🔗 Modal: Opening external link:', item.url);
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('⚠️ Modal: No URL available for item:', item.id);
    }
  };

  const handleSave = () => {
    console.log('💾 Modal: Saving item:', item.id);
    // Add save functionality here
    alert('💾 Save functionality will be implemented soon!');
  };

  const handlePreviewPlay = () => {
    console.log('🎵 Modal: Playing preview for music:', item.id);
    if (isMusic(item) && item.previewUrl) {
      // You can implement custom audio player logic here
      window.open(item.previewUrl, '_blank');
    } else {
      console.warn('⚠️ Modal: No preview URL available for item:', item.id);
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'news':
        return 'from-blue-600/80 to-blue-800/80';
      case 'movie':
        return 'from-purple-600/80 to-purple-800/80';
      case 'music':
        return 'from-green-600/80 to-green-800/80';
      case 'social':
        return 'from-orange-600/80 to-orange-800/80';
      default:
        return 'from-gray-600/80 to-gray-800/80';
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'news':
        return <Newspaper className="h-6 w-6" />;
      case 'movie':
        return <Film className="h-6 w-6" />;
      case 'music':
        return <Music className="h-6 w-6" />;
      case 'social':
        return <Share2 className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const renderMovieDetails = (movie: Movie) => (
    <div className="space-y-6">
      {/* Rating and Release Info */}
      <div className="flex flex-wrap gap-4">
        {movie.rating && (
          <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-400 rounded-lg px-3 py-2">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="font-bold text-white">{movie.rating.toFixed(1)}/10</span>
          </div>
        )}
        {movie.releaseDate && (
          <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-400 rounded-lg px-3 py-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <span className="font-bold text-white">{formatDate(movie.releaseDate)}</span>
          </div>
        )}
        {movie.duration && (
          <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-400 rounded-lg px-3 py-2">
            <Clock className="h-5 w-5 text-purple-400" />
            <span className="font-bold text-white">{movie.duration} min</span>
          </div>
        )}
      </div>

      {/* Genres */}
      {movie.genre && movie.genre.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-white mb-3">🎭 Genres</h4>
          <div className="flex flex-wrap gap-2">
            {movie.genre.map((genre, index) => (
              <Badge 
                key={index} 
                className="bg-purple-500/80 text-white border-purple-400 font-bold"
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderNewsDetails = (news: NewsArticle) => {
    try {
      console.log('📰 Rendering news details for:', news.id, news);
      return (
        <div className="space-y-6">
          {/* Source and Author */}
          <div className="flex flex-wrap gap-4">
            {news.source && (
              <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400 rounded-lg px-3 py-2">
                <Newspaper className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-white">{news.source}</span>
              </div>
            )}
            {news.author && (
              <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400 rounded-lg px-3 py-2">
                <User className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-white">{news.author}</span>
              </div>
            )}
            {news.category && (
              <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400 rounded-lg px-3 py-2">
                <Badge className="bg-blue-600 text-white font-bold">{news.category}</Badge>
              </div>
            )}
          </div>

          {/* Full Content */}
          {news.content && (
            <div>
              <h4 className="text-lg font-bold text-white mb-3">📖 Full Article</h4>
              <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4">
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {news.content}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('🚨 Error rendering news details:', error, news);
      return (
        <div className="text-center text-red-400 py-8">
          <p>⚠️ Error displaying news details</p>
          <pre className="mt-2 text-xs text-gray-500 bg-black/40 p-3 rounded overflow-auto">
            {JSON.stringify(news, null, 2)}
          </pre>
        </div>
      );
    }
  };

  const renderMusicDetails = (music: MusicTrack) => (
    <div className="space-y-6">
      {/* Artist and Album Info */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-green-500/20 border border-green-400 rounded-lg px-3 py-2">
          <User className="h-5 w-5 text-green-400" />
          <span className="font-bold text-white">{music.artist}</span>
        </div>
        {music.album && (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-400 rounded-lg px-3 py-2">
            <Music className="h-5 w-5 text-green-400" />
            <span className="font-bold text-white">{music.album}</span>
          </div>
        )}
        {music.duration && (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-400 rounded-lg px-3 py-2">
            <Clock className="h-5 w-5 text-green-400" />
            <span className="font-bold text-white">{Math.floor(music.duration / 60)}:{String(music.duration % 60).padStart(2, '0')}</span>
          </div>
        )}
      </div>

      {/* Music Stats */}
      <div className="flex flex-wrap gap-4">
        {music.popularity && (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-400 rounded-lg px-3 py-2">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="font-bold text-white">Popularity: {music.popularity}%</span>
          </div>
        )}
        {music.explicit !== undefined && (
          <Badge className={`font-bold ${music.explicit ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            {music.explicit ? '🔞 EXPLICIT' : '✅ CLEAN'}
          </Badge>
        )}
      </div>

      {/* Preview Player */}
      {music.previewUrl && (
        <div>
          <h4 className="text-lg font-bold text-white mb-3">🎵 Preview</h4>
          <div className="bg-black/40 border border-green-500/30 rounded-lg p-4">
            <audio controls className="w-full">
              <source src={music.previewUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )}
    </div>
  );

  const renderSocialDetails = (social: SocialPost) => (
    <div className="space-y-6">
      {/* Platform and User Info */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-400 rounded-lg px-3 py-2">
          <Share2 className="h-5 w-5 text-orange-400" />
          <span className="font-bold text-white">@{social.username}</span>
        </div>
        <Badge className="bg-orange-600 text-white font-bold uppercase">
          {social.platform}
        </Badge>
      </div>

      {/* Engagement Stats */}
      <div className="flex flex-wrap gap-4">
        {social.likes && (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-400 rounded-lg px-3 py-2">
            <Heart className="h-5 w-5 text-red-400 fill-current" />
            <span className="font-bold text-white">{social.likes.toLocaleString()} likes</span>
          </div>
        )}
        {social.comments && (
          <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400 rounded-lg px-3 py-2">
            <span className="text-blue-400">💬</span>
            <span className="font-bold text-white">{social.comments.toLocaleString()} comments</span>
          </div>
        )}
      </div>

      {/* Hashtags */}
      {social.hashtags && social.hashtags.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-white mb-3"># Hashtags</h4>
          <div className="flex flex-wrap gap-2">
            {social.hashtags.map((tag, index) => (
              <Badge 
                key={index} 
                className="bg-blue-500/80 text-white border-blue-400 font-bold cursor-pointer hover:bg-blue-600 transition-colors"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      className="max-h-[90vh] overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ 
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
          staggerChildren: 0.1
        }}
        className="space-y-6"
      >
        {/* Header with Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5,
            delay: 0.1,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="relative"
        >
          {item.image && (
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${getTypeColor()}`} />
              
              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm border-2 border-orange-500 rounded-lg px-3 py-2">
                  {getTypeIcon()}
                  <span className="text-white font-bold uppercase">{item.type}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteToggle}
                  className={`bg-black/80 backdrop-blur-sm border-2 hover:scale-110 transition-all duration-300 ${
                    isFavorite 
                      ? 'text-red-500 border-red-500 bg-red-500/20 hover:bg-red-500' 
                      : 'text-white border-orange-500 hover:border-red-500 hover:bg-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/80 backdrop-blur-sm border-2 border-orange-500 text-white hover:bg-orange-500 hover:scale-110 transition-all duration-300"
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Title and Description */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.4,
            delay: 0.2,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-black text-white leading-tight" style={{ textShadow: '2px 2px 0px #ff6600' }}>
            {item.title}
          </h1>
          
          {item.description && (
            <p className="text-gray-300 leading-relaxed text-lg">
              {item.description}
            </p>
          )}

          {/* Published Date */}
          {item.publishedAt && (
            <div className="flex items-center gap-2 text-orange-400">
              <Calendar className="h-4 w-4" />
              <span className="font-bold">Published: {formatDate(item.publishedAt)}</span>
            </div>
          )}
        </motion.div>

        {/* Type-specific Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: 0.3,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          <Card className="bg-black/60 border-orange-500/30">
            <CardContent className="p-6">
              {(() => {
                try {
                  console.log('🎯 Rendering type-specific content for:', item.type, item.id);
                  
                  if (isMovie(item)) {
                    return renderMovieDetails(item);
                  }
                  if (isNews(item)) {
                    return renderNewsDetails(item);
                  }
                  if (isMusic(item)) {
                    return renderMusicDetails(item);
                  }
                  if (isSocial(item)) {
                    return renderSocialDetails(item);
                  }
                  
                  return (
                    <div className="text-center text-gray-400 py-8">
                      <p>Content type "{item.type}" not supported yet.</p>
                    </div>
                  );
                } catch (error) {
                  console.error('🚨 Error rendering type-specific content:', error, item);
                  return (
                    <div className="text-center text-red-400 py-8">
                      <p>⚠️ Error displaying content details</p>
                      <p className="text-sm text-gray-500 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
                      <pre className="mt-4 text-xs text-gray-500 bg-black/40 p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </div>
                  );
                }
              })()}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: 0.4,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="flex flex-wrap gap-3"
        >
          {item.url && (
            <Button
              onClick={handleExternalLink}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-400 font-bold transition-all duration-300 transform hover:scale-105"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              🚀 Open Original
            </Button>
          )}
          
          {isMusic(item) && item.previewUrl && (
            <Button
              onClick={handlePreviewPlay}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white border-2 border-green-400 font-bold transition-all duration-300 transform hover:scale-105"
            >
              <Play className="h-5 w-5 mr-2" />
              🎵 Play Preview
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex-1 border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105"
          >
            <Download className="h-5 w-5 mr-2" />
            💾 Save
          </Button>
        </motion.div>
      </motion.div>
    </Modal>
  );
};
