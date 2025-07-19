'use client';

import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { AuthProvider } from '../lib/auth';
import './globals.css';
import '../lib/i18n';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
