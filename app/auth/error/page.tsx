/*eslint-disable*/
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Zap, Shield, Sun, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { toggleDarkMode } from '../../../store/slices/userSlice';
import { useTheme } from '../../../lib/useTheme';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification link was invalid or has expired.',
  Default: 'An unexpected error occurred during authentication.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.user.preferences);
  const theme = useTheme();
  const error = searchParams.get('error') || 'Default';
  const message = errorMessages[error] || errorMessages.Default;

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 transition-colors duration-300 ${
      theme.isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleThemeToggle}
          className={`border-2 font-bold transition-all duration-300 transform hover:scale-105 ${
            theme.isDark
              ? 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
              : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
          }`}
        >
          {preferences.darkMode ? (
            <Sun className="h-4 w-4 mr-2" />
          ) : (
            <Moon className="h-4 w-4 mr-2" />
          )}
          {preferences.darkMode ? 'Light' : 'Dark'}
        </Button>
      </div>

      {/* Comic book style background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-red-500 rounded-full animate-pulse"></div>
        <div className={`absolute top-40 right-20 w-24 h-24 border-2 transform rotate-45 animate-bounce ${
          theme.isDark ? 'border-orange-500' : 'border-orange-600'
        }`}></div>
        <div className="absolute bottom-40 left-20 w-16 h-16 border-2 border-red-500 rounded-lg animate-spin"></div>
        <div className={`absolute bottom-20 right-10 w-20 h-20 border-2 transform rotate-12 animate-pulse ${
          theme.isDark ? 'border-orange-500' : 'border-orange-600'
        }`}></div>
      </div>

      {/* Comic sound effects */}
      <div className="absolute top-20 right-20 text-red-500 font-black text-xl opacity-20 transform rotate-12 animate-pulse">
        ERROR!
      </div>
      <div className={`absolute bottom-20 left-20 font-black text-lg opacity-20 transform -rotate-12 animate-bounce ${
        theme.isDark ? 'text-orange-500' : 'text-orange-600'
      }`}>
        OOPS!
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glassmorphic Card */}
        <Card className={`backdrop-blur-xl border-4 border-red-500 shadow-2xl shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 ${
          theme.isDark ? 'bg-black/80' : 'bg-white/90'
        }`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-500/20 backdrop-blur-sm border-2 border-red-500 flex items-center justify-center animate-pulse">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className={`text-3xl font-black mb-2 transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`} style={{ textShadow: '2px 2px 0px #ff0000' }}>
              SYSTEM ERROR!
            </CardTitle>
            <p className="text-red-500 font-bold">Authentication malfunction detected</p>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <div className="bg-red-500/10 backdrop-blur-sm border-2 border-red-500/30 p-4 rounded-lg">
              <p className="text-white font-medium">{message}</p>
            </div>
            
            <div className="space-y-3">
              <Link href="/auth/signin" className="w-full">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-black border-2 border-white font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  🚀 RETRY LOGIN
                </Button>
              </Link>
              
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black font-bold transition-all duration-300">
                  🏠 RETURN TO BASE
                </Button>
              </Link>
            </div>

            <div className="text-sm text-orange-400 font-medium">
              <p>If this malfunction persists, contact tech support! 🛠️</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
