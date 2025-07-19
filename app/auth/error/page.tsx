/*eslint-disable*/
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification link was invalid or has expired.',
  Default: 'An unexpected error occurred during authentication.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Comic book style background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-red-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-orange-500 transform rotate-45 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-16 h-16 border-2 border-red-500 rounded-lg animate-spin"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 border-2 border-orange-500 transform rotate-12 animate-pulse"></div>
      </div>

      {/* Comic sound effects */}
      <div className="absolute top-20 right-20 text-red-500 font-black text-xl opacity-20 transform rotate-12 animate-pulse">
        ERROR!
      </div>
      <div className="absolute bottom-20 left-20 text-orange-500 font-black text-lg opacity-20 transform -rotate-12 animate-bounce">
        OOPS!
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glassmorphic Card */}
        <Card className="bg-black/80 backdrop-blur-xl border-4 border-red-500 shadow-2xl shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-500/20 backdrop-blur-sm border-2 border-red-500 flex items-center justify-center animate-pulse">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-3xl font-black text-white mb-2" style={{ textShadow: '2px 2px 0px #ff0000' }}>
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
