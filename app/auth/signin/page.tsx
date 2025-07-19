/*eslint-disable*/
'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Github, Chrome, ArrowLeft, Zap, Sun, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { toggleDarkMode } from '../../../store/slices/userSlice';
import { useTheme } from '../../../lib/useTheme';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.user.preferences);
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        // Get the session and store it
        const session = await getSession();
        if (session) {
          localStorage.setItem('nextauth.session', JSON.stringify(session));
        }
        router.push('/dashboard');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      </div>

      {/* Comic sound effects */}
      <div className="absolute top-20 right-20 text-orange-500 font-black text-xl opacity-20 transform rotate-12 animate-pulse">
        SECURE!
      </div>
      <div className={`absolute bottom-20 left-20 font-black text-lg opacity-20 transform -rotate-12 animate-bounce ${
        theme.isDark ? 'text-white' : 'text-gray-800'
      }`}>
        ACCESS!
      </div>

      {/* Back to home button */}
      <Link href="/" className="absolute top-6 left-6 z-50">
        <Button variant="outline" className={`border-2 font-bold transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black'
            : 'border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white'
        }`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glassmorphic Card */}
        <Card className={`backdrop-blur-xl border-4 shadow-2xl transition-all duration-300 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500 shadow-orange-500/20 hover:shadow-orange-500/40'
            : 'bg-white/90 border-orange-600 shadow-orange-600/20 hover:shadow-orange-600/40'
        }`}>
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center border-2 transform hover:rotate-12 transition-transform duration-300 ${
                theme.isDark ? 'border-white' : 'border-gray-800'
              }`}>
                <span className={`font-bold ${theme.isDark ? 'text-black' : 'text-white'}`}>PD</span>
              </div>
              <Zap className="h-6 w-6 text-orange-500 animate-pulse" />
            </div>
            <CardTitle className={`text-3xl font-black mb-2 transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`} style={{ textShadow: '2px 2px 0px #ff6600' }}>
              WELCOME BACK!
            </CardTitle>
            <p className="text-orange-500 font-bold">Power up your dashboard access</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Demo Credentials with comic styling */}
            <div className={`backdrop-blur-sm border-2 p-4 rounded-lg text-sm transition-colors duration-300 ${
              theme.isDark
                ? 'bg-orange-500/10 border-orange-500/30'
                : 'bg-orange-100/80 border-orange-400/50'
            }`}>
              <p className="font-black text-orange-500 mb-2 text-center">⚡ DEMO ACCESS ⚡</p>
              <div className={`space-y-1 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <p><span className="text-orange-500 font-bold">Email:</span> demo@example.com</p>
                <p><span className="text-orange-500 font-bold">Password:</span> demo123</p>
              </div>
              <p className={`text-xs mt-2 text-center font-medium transition-colors duration-300 ${
                theme.isDark ? 'text-orange-400' : 'text-orange-600'
              }`}>
                Or create your own superhero account! 🦸‍♂️
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-500 text-red-400 p-3 rounded-lg text-sm font-bold text-center">
                  💥 {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  ⚡ Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your superhero email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`pl-10 backdrop-blur-sm border-2 transition-all duration-300 ${
                      theme.isDark
                        ? 'bg-black/50 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/30'
                        : 'bg-white/70 border-orange-400/50 text-gray-900 placeholder:text-gray-500 focus:border-orange-600 focus:shadow-lg focus:shadow-orange-600/30'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  🔒 Secret Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your secret code"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`pl-10 pr-10 backdrop-blur-sm border-2 transition-all duration-300 ${
                      theme.isDark
                        ? 'bg-black/50 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/30'
                        : 'bg-white/70 border-orange-400/50 text-gray-900 placeholder:text-gray-500 focus:border-orange-600 focus:shadow-lg focus:shadow-orange-600/30'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-3 h-4 w-4 transition-colors duration-300 ${
                      theme.isDark
                        ? 'text-orange-500 hover:text-white'
                        : 'text-orange-600 hover:text-gray-800'
                    }`}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full bg-orange-500 hover:bg-orange-600 border-2 font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/50 ${
                  theme.isDark
                    ? 'text-black border-white'
                    : 'text-white border-gray-800'
                }`}
                disabled={isLoading}
              >
                {isLoading ? '⚡ POWERING UP...' : '🚀 LAUNCH ACCESS'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className={`w-full border-t transition-colors duration-300 ${
                  theme.isDark ? 'border-orange-500/30' : 'border-orange-400/50'
                }`} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-2 text-orange-500 font-bold transition-colors duration-300 ${
                  theme.isDark ? 'bg-black' : 'bg-gray-50'
                }`}>OR POWER UP WITH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleProviderSignIn('google')}
                disabled={isLoading}
                className={`border-2 font-bold transition-all duration-300 ${
                  theme.isDark
                    ? 'border-orange-500/50 text-white hover:bg-orange-500/20 hover:border-orange-500'
                    : 'border-orange-400/50 text-gray-900 hover:bg-orange-100 hover:border-orange-600'
                }`}
              >
                <Chrome className="h-4 w-4 mr-2 text-orange-500" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleProviderSignIn('github')}
                disabled={isLoading}
                className={`border-2 font-bold transition-all duration-300 ${
                  theme.isDark
                    ? 'border-orange-500/50 text-white hover:bg-orange-500/20 hover:border-orange-500'
                    : 'border-orange-400/50 text-gray-900 hover:bg-orange-100 hover:border-orange-600'
                }`}
              >
                <Github className="h-4 w-4 mr-2 text-orange-500" />
                GitHub
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className={`transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-700'
              }`}>New to the universe? </span>
              <Link href="/auth/signup" className={`font-bold transition-colors duration-300 ${
                theme.isDark
                  ? 'text-orange-500 hover:text-white'
                  : 'text-orange-600 hover:text-gray-900'
              }`}>
                Create Account 🦸‍♂️
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
