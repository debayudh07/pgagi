/*eslint-disable*/
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';

interface AuthContextType {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: typeof signIn;
  signOut: () => Promise<void>;
  user: Session['user'] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [localSession, setLocalSession] = useState<Session | null>(null);

  // Persist session to localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem('nextauth.session', JSON.stringify(session));
      setLocalSession(session);
    } else {
      localStorage.removeItem('nextauth.session');
      setLocalSession(null);
    }
  }, [session]);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('nextauth.session');
      if (storedSession && !session) {
        const parsedSession = JSON.parse(storedSession);
        setLocalSession(parsedSession);
      }
    } catch (error) {
      console.error('Error loading session from localStorage:', error);
      localStorage.removeItem('nextauth.session');
    }
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('nextauth.session');
    setLocalSession(null);
    await signOut();
  };

  const contextValue: AuthContextType = {
    session: session || localSession,
    status,
    signIn,
    signOut: handleSignOut,
    user: session?.user || localSession?.user || null,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
