'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Github, Chrome, ArrowLeft, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setSuccess('Account created successfully! You can now sign in with your credentials.');
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      // Redirect to sign in page after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
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
        <div className="absolute top-60 left-1/2 w-28 h-28 border-2 border-orange-500 transform -translate-x-1/2 rotate-45 animate-bounce"></div>
      </div>

      {/* Comic sound effects */}
      <div className="absolute top-20 right-20 text-orange-500 font-black text-xl opacity-20 transform rotate-12 animate-pulse">
        REGISTER!
      </div>
      <div className="absolute bottom-20 left-20 text-white font-black text-lg opacity-20 transform -rotate-12 animate-bounce">
        HERO MODE!
      </div>
      <div className="absolute top-1/2 left-10 text-orange-500 font-black text-md opacity-15 transform rotate-45 animate-pulse">
        ACTIVATE!
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
              <Shield className="h-6 w-6 text-orange-500 animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-black text-white mb-2" style={{ textShadow: '2px 2px 0px #ff6600' }}>
              JOIN THE FORCE!
            </CardTitle>
            <p className="text-orange-500 font-bold">Create your superhero account</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-500 text-red-400 p-3 rounded-lg text-sm font-bold text-center">
                  💥 {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 backdrop-blur-sm border-2 border-green-500 text-green-400 p-3 rounded-lg text-sm font-bold text-center">
                  ⚡ {success}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  🦸‍♂️ Hero Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your superhero name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 bg-black/50 backdrop-blur-sm border-2 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/30 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  ⚡ Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your contact frequency"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-black/50 backdrop-blur-sm border-2 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/30 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  🔒 Secret Power Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create your secret code"
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

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  🛡️ Confirm Power Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Verify your secret code"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 bg-black/50 backdrop-blur-sm border-2 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/30 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-orange-500 hover:text-white transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-black border-2 border-white font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/50" 
                disabled={isLoading}
              >
                {isLoading ? '⚡ ACTIVATING POWERS...' : '🚀 ACTIVATE HERO MODE'}
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
              <span className="text-white">Already a hero? </span>
              <Link href="/auth/signin" className="text-orange-500 hover:text-white font-bold transition-colors duration-300">
                Sign In 🦸‍♀️
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
