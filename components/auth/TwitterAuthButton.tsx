/*eslint-disable*/
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { TwitterService } from '../../services/api/twitterService';
import { useTheme } from '../../lib/useTheme';
import { motion } from 'framer-motion';

interface TwitterAuthButtonProps {
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}

export const TwitterAuthButton: React.FC<TwitterAuthButtonProps> = ({
  onAuthSuccess,
  onAuthError,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const theme = useTheme();

  useEffect(() => {
    // Initialize Twitter service and check if already authenticated
    TwitterService.initializeAuth();
    setIsAuthenticated(TwitterService.isAuthenticated());

    // Handle OAuth callback if present in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('twitter_code');
    const state = urlParams.get('twitter_state');
    const error = urlParams.get('twitter_error');

    if (error) {
      console.error('Twitter auth error:', error);
      onAuthError?.(error);
    } else if (code && state) {
      handleOAuthCallback(code, state);
    }

    // Get user info if authenticated
    if (TwitterService.isAuthenticated()) {
      getUserInfo();
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string) => {
    setIsLoading(true);
    try {
      const success = await TwitterService.handleCallback(code, state);
      if (success) {
        setIsAuthenticated(true);
        await getUserInfo();
        onAuthSuccess?.();
        
        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete('twitter_code');
        url.searchParams.delete('twitter_state');
        window.history.replaceState({}, document.title, url.toString());
      } else {
        onAuthError?.('Failed to authenticate with Twitter');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      onAuthError?.('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = async () => {
    try {
      const user = await TwitterService.getUserInfo();
      setUserInfo(user);
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const authUrl = await TwitterService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to initiate Twitter login:', error);
      setIsLoading(false);
      onAuthError?.('Failed to start authentication');
    }
  };

  const handleLogout = () => {
    TwitterService.logout();
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  if (isAuthenticated && userInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`backdrop-blur-xl border-2 shadow-lg transition-all duration-300 ${
          theme.isDark
            ? 'bg-black/80 border-blue-500 shadow-blue-500/20'
            : 'bg-white/90 border-blue-600 shadow-blue-600/20'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                🐦
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-bold transition-colors duration-300 ${
                    theme.isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    @{userInfo.username}
                  </h4>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-400 text-xs">
                    ✓ Connected
                  </Badge>
                </div>
                <p className="text-sm text-blue-400 font-medium">{userInfo.name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 font-bold"
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`backdrop-blur-xl border-2 shadow-lg transition-all duration-300 ${
        theme.isDark
          ? 'bg-black/80 border-blue-500/50 shadow-blue-500/20'
          : 'bg-white/90 border-blue-600/50 shadow-blue-600/20'
      }`}>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
              🐦
            </div>
            <h3 className={`font-black text-lg mb-2 transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Connect Your Twitter
            </h3>
            <p className="text-blue-400 font-medium text-sm mb-4">
              See your tweets and timeline in your personalized feed
            </p>
          </div>
          
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-400 font-bold transition-all duration-300 transform hover:scale-105 gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                🐦 Connect Twitter Account
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 mt-3">
            We'll only access your public tweets and timeline
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
