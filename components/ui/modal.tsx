'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-2xl';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      case 'full':
        return 'max-w-[95vw] max-h-[95vh]';
      default:
        return 'max-w-2xl';
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1] // Custom easing for smoother feel
            }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.85, 
              y: 50,
              rotateX: -15 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotateX: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.85, 
              y: 50,
              rotateX: -15 
            }}
            transition={{ 
              duration: 0.4, 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            style={{
              transformPerspective: 1000,
            }}
            className={cn(
              'relative w-full bg-gradient-to-br from-black/95 to-gray-900/95 backdrop-blur-xl border-2 border-orange-500/50 rounded-2xl shadow-2xl shadow-orange-500/20 overflow-hidden',
              getSizeClasses(),
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-orange-500/30 bg-black/40">
                <h2 className="text-2xl font-black text-white" style={{ textShadow: '2px 2px 0px #ff6600' }}>
                  {title}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-orange-400 hover:text-white hover:bg-orange-500/20 border-2 border-orange-500/50 hover:border-orange-500 transition-all duration-300 transform hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            {/* Close button for non-titled modals */}
            {!title && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-orange-400 hover:text-white hover:bg-orange-500/20 border-2 border-orange-500/50 hover:border-orange-500 transition-all duration-300 transform hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render modal using portal
  return typeof document !== 'undefined' && typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};
