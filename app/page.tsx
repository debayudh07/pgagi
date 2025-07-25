'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Play, LogIn, UserPlus, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { toggleDarkMode } from '../store/slices/userSlice';
import { useTheme } from '../lib/useTheme';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TabNavigation } from '../components/dashboard/TabNavigation';
import { FeedSection } from '../components/dashboard/FeedSection';

const LandingPage = () => {
  const { isAuthenticated, user, preferences } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  // If user is authenticated, redirect to dashboard (this is a fallback)
  if (isAuthenticated) {
    return null; // The useEffect will handle the redirect
  }

  // Public landing page for non-authenticated users
  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "1M+", label: "Content Items" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.9", label: "Rating" }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      theme.isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute top-20 left-10 w-32 h-32 border-2 rounded-full animate-pulse ${
          theme.isDark ? 'border-orange-500' : 'border-orange-600'
        }`}></div>
        <div className={`absolute top-40 right-20 w-24 h-24 border-2 transform rotate-45 animate-bounce ${
          theme.isDark ? 'border-orange-500' : 'border-orange-600'
        }`}></div>
        <div className={`absolute bottom-40 left-20 w-16 h-16 border-2 rounded-lg animate-spin ${
          theme.isDark ? 'border-orange-500' : 'border-orange-600'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-20 h-20 border-2 transform rotate-12 animate-pulse ${
          theme.isDark ? 'border-orange-500' : 'border-orange-600'
        }`}></div>
        <div className={`absolute top-60 left-1/2 w-28 h-28 border-2 transform -translate-x-1/2 rotate-45 animate-bounce ${
          theme.isDark ? 'border-orange-500' : 'border-orange-600'
        }`}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full backdrop-blur-md border-b-2 z-50 transition-colors duration-300 ${
        theme.isDark 
          ? 'bg-black/90 border-orange-500' 
          : 'bg-white/90 border-orange-600'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center border-2 border-white transform hover:rotate-12 transition-transform duration-300">
                <span className="text-black font-bold text-sm">PD</span>
              </div>
              <span className={`font-bold text-xl transition-colors duration-300 ${
                theme.isDark 
                  ? 'text-white hover:text-orange-500' 
                  : 'text-gray-900 hover:text-orange-600'
              }`}>
                PersonalDash
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleThemeToggle}
                className={`hidden sm:flex gap-2 border-2 font-bold transition-all duration-300 transform hover:scale-105 ${
                  theme.isDark
                    ? 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
                    : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                }`}
              >
                {preferences.darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {preferences.darkMode ? 'Light' : 'Dark'}
              </Button>

              <Link href="/auth/signin">
                <Button variant="outline" className={`hidden sm:flex gap-2 border-2 font-bold transition-all duration-300 transform hover:scale-105 ${
                  theme.isDark
                    ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black'
                    : 'border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white'
                }`}>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-black border-2 border-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/50">
                  <UserPlus className="h-4 w-4" />
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Badge className={`mb-6 bg-orange-500 text-black border-2 border-white font-bold transform rotate-1 hover:rotate-0 transition-transform duration-300 text-lg px-4 py-2 shadow-lg`}>
              ✨ BOOM! PersonalDash v2.0 is HERE!
            </Badge>
            
            <h1 className={`text-5xl md:text-7xl font-black mb-6 leading-tight transform hover:scale-105 transition-transform duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`} style={{ 
              textShadow: theme.isDark 
                ? '4px 4px 0px #ff6600, 8px 8px 0px rgba(0,0,0,0.7)' 
                : '4px 4px 0px #ff6600, 8px 8px 0px rgba(255,255,255,0.7)'
            }}>
              Your Personal Content
              <br />
              <span className="text-orange-500" style={{ 
                textShadow: theme.isDark 
                  ? '4px 4px 0px #ffffff, 8px 8px 0px rgba(0,0,0,0.7)' 
                  : '4px 4px 0px #000000, 8px 8px 0px rgba(255,255,255,0.7)'
              }}>
                UNIVERSE
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-8 leading-relaxed font-medium ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>
              🚀 Discover, organize, and enjoy personalized content from news, movies, music, and social media—all in one 
              <span className="text-orange-500 font-bold"> AMAZING </span> 
              dashboard!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-black border-4 border-white text-lg px-8 py-6 font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-orange-500/50">
                  🎯 Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 group border-4 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-white/50">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                💥 Watch Demo
              </Button>
            </div>

            {/* Comic Card Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="relative group"
                >
                  <Card className={`border-4 border-orange-500 hover:border-white transition-all duration-300 transform hover:scale-110 hover:-rotate-2 cursor-pointer shadow-lg hover:shadow-orange-500/50 ${
                    theme.isDark ? 'bg-black' : 'bg-white'
                  }`}>
                    <CardContent className="p-6 text-center relative overflow-hidden">
                      {/* Comic book halftone pattern */}
                      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-orange-500 to-transparent"></div>
                      
                      <div className={`text-3xl md:text-4xl font-black text-orange-500 mb-2 transform group-hover:scale-125 transition-transform duration-300`} style={{ 
                        textShadow: theme.isDark ? '2px 2px 0px #ffffff' : '2px 2px 0px #000000'
                      }}>
                        {stat.number}
                      </div>
                      <div className={`text-sm font-bold uppercase tracking-wider ${
                        theme.isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stat.label}
                      </div>
                      
                      {/* Comic book style speech bubble effect */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                      <div className={`absolute -bottom-1 -left-1 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse ${
                        theme.isDark ? 'bg-white' : 'bg-black'
                      }`}></div>
                    </CardContent>
                  </Card>
                  
                  {/* Comic book style sound effects */}
                  <div className="absolute -top-4 -right-4 text-orange-500 font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform rotate-12 animate-bounce">
                    POW!
                  </div>
                  <div className="absolute -top-6 -left-4 text-white font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -rotate-12 animate-pulse">
                    BAM!
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Comic book style action lines */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-20 transform -skew-y-1"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-20 transform skew-y-1 mt-4"></div>
            <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-y-2"></div>
            <div className="absolute bottom-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform skew-y-2"></div>
          </motion.div>
        </div>

        {/* Additional comic elements */}
        <div className="absolute top-40 left-10 text-orange-500 font-black text-2xl opacity-20 transform rotate-12 animate-pulse">
          KAPOW!
        </div>
        <div className={`absolute bottom-40 right-10 font-black text-xl opacity-20 transform -rotate-12 animate-bounce ${
          theme.isDark ? 'text-white' : 'text-gray-800'
        }`}>
          WHAM!
        </div>
        <div className="absolute top-1/2 right-20 text-orange-500 font-black text-lg opacity-15 transform rotate-45 animate-pulse">
          ZAP!
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
