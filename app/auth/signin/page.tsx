'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Github, Chrome, ArrowLeft, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Comic book style background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-orange-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-orange-500 transform rotate-45 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-16 h-16 border-2 border-orange-500 rounded-lg animate-spin"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 border-2 border-orange-500 transform rotate-12 animate-pulse"></div>
      </div>

      {/* Comic sound effects */}
      <div className="absolute top-20 right-20 text-orange-500 font-black text-xl opacity-20 transform rotate-12 animate-pulse">
        SECURE!
      </div>
      <div className="absolute bottom-20 left-20 text-white font-black text-lg opacity-20 transform -rotate-12 animate-bounce">
        ACCESS!
      </div>

      {/* Back to home button */}
      <Link href="/" className="absolute top-6 left-6 z-50">
        <Button variant="outline" className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 transform hover:scale-105 font-bold">
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
        <Card className="bg-black/80 backdrop-blur-xl border-4 border-orange-500 shadow-2xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center border-2 border-white transform hover:rotate-12 transition-transform duration-300">
                <span className="text-black font-bold">PD</span>
              </div>
              <Zap className="h-6 w-6 text-orange-500 animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-black text-white mb-2" style={{ textShadow: '2px 2px 0px #ff6600' }}>
              WELCOME BACK!
            </CardTitle>
            <p className="text-orange-500 font-bold">Power up your dashboard access</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Demo Credentials with comic styling */}
            <div className="bg-orange-500/10 backdrop-blur-sm border-2 border-orange-500/30 p-4 rounded-lg text-sm">
              <p className="font-black text-orange-500 mb-2 text-center">⚡ DEMO ACCESS ⚡</p>
              <div className="text-white space-y-1">
                <p><span className="text-orange-500 font-bold">Email:</span> demo@example.com</p>
                <p><span className="text-orange-500 font-bold">Password:</span> demo123</p>
              </div>
              <p className="text-xs text-orange-400 mt-2 text-center font-medium">
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
                    className="pl-10 bg-black/50 backdrop-blur-sm border-2 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/30 transition-all duration-300"
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
                    className="pl-10 pr-10 bg-black/50 backdrop-blur-sm border-2 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/30 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-orange-500 hover:text-white transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-black border-2 border-white font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/50" 
                disabled={isLoading}
              >
                {isLoading ? '⚡ POWERING UP...' : '🚀 LAUNCH ACCESS'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-orange-500/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-orange-500 font-bold">OR POWER UP WITH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleProviderSignIn('google')}
                disabled={isLoading}
                className="border-2 border-orange-500/50 text-white hover:bg-orange-500/20 hover:border-orange-500 font-bold transition-all duration-300"
              >
                <Chrome className="h-4 w-4 mr-2 text-orange-500" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleProviderSignIn('github')}
                disabled={isLoading}
                className="border-2 border-orange-500/50 text-white hover:bg-orange-500/20 hover:border-orange-500 font-bold transition-all duration-300"
              >
                <Github className="h-4 w-4 mr-2 text-orange-500" />
                GitHub
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-white">New to the universe? </span>
              <Link href="/auth/signup" className="text-orange-500 hover:text-white font-bold transition-colors duration-300">
                Create Account 🦸‍♂️
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
