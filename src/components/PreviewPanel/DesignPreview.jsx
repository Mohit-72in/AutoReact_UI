import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { VIEW_MODES } from '../../config/constants';

/**
 * Design Preview Component
 * Shows the actual rendered design
 */
const DesignPreview = ({ viewMode, className = '' }) => {
  const getPreviewWidth = () => {
    switch (viewMode) {
      case VIEW_MODES.TABLET:
        return 'w-[768px]';
      case VIEW_MODES.MOBILE:
        return 'w-[375px]';
      default:
        return 'w-full';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        'bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-700 origin-top min-h-[600px] border border-slate-100',
        getPreviewWidth(),
        className
      )}
    >
      {/* Mockup Content */}
      <div className="p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8">
          <Sparkles className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
          The Agency of the <span className="text-blue-600">Future</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mb-10 leading-relaxed">
          We combine AI-powered tools with human creativity to build extraordinary digital experiences.
        </p>
        <div className="flex gap-4">
          <div className="h-12 w-32 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></div>
          <div className="h-12 w-32 bg-slate-50 border border-slate-200 rounded-full"></div>
        </div>
        
        <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="h-10 w-10 bg-white shadow-sm rounded-lg mb-4"></div>
              <div className="h-2 w-2/3 bg-slate-200 rounded mb-2"></div>
              <div className="h-2 w-full bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DesignPreview;
