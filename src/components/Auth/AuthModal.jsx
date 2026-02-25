/**
 * AuthModal Component
 * Modal wrapper for Login and Register forms
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Login from './Login';
import Register from './Register';

const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState(initialView); // 'login' or 'register'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <div className="relative z-10 p-4 w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition z-20"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <Login
              key="login"
              onSwitchToRegister={() => setView('register')}
              onClose={onClose}
            />
          ) : (
            <Register
              key="register"
              onSwitchToLogin={() => setView('login')}
              onClose={onClose}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthModal;
