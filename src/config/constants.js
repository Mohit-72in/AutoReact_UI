// Application Constants

export const APP_CONFIG = {
  name: 'AI Builder',
  version: '1.0.0',
  description: 'AI-Powered UI Builder Platform',
};

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retryAttempts: 3,
};

export const VIEW_MODES = {
  DESKTOP: 'desktop',
  TABLET: 'tablet',
  MOBILE: 'mobile',
};

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
};

export const RESPONSE_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const DEFAULT_PREVIEW_CODE = `import React from 'react';
import { Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <Sparkles className="w-12 h-12 text-blue-600 mb-6" />
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            The Agency of the <span className="text-blue-600">Future</span>
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl">
            We combine AI-powered tools with human creativity to build 
            extraordinary digital experiences.
          </p>
          <div className="mt-10 flex gap-4">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-full">
              Get Started
            </button>
            <button className="px-8 py-3 bg-white border border-slate-200 rounded-full">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;`;
