import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { VIEW_MODES } from '../../config/constants';

/**
 * Design Preview Component
 * Shows the actual rendered design with responsive scaling
 */
const DesignPreview = ({ viewMode, generatedHtml, className = '' }) => {
  const getPreviewStyles = () => {
    switch (viewMode) {
      case VIEW_MODES.TABLET:
        return { width: '768px', maxWidth: '768px' };
      case VIEW_MODES.MOBILE:
        return { width: '375px', maxWidth: '375px' };
      default:
        return { width: '100%', maxWidth: '100%' };
    }
  };

  // Render generated HTML if available, otherwise show default mockup
  if (generatedHtml) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        style={getPreviewStyles()}
        className={cn(
          'bg-white shadow-2xl rounded-2xl overflow-auto transition-all duration-700 origin-top min-h-[600px] border border-slate-100',
          className
        )}
      >
        <div 
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: generatedHtml }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      style={getPreviewStyles()}
      className={cn(
        'bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-700 origin-top min-h-[600px] border border-slate-100',
        className
      )}
    >
      {/* Default Mockup Content */}
      <div className="p-8 lg:p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8">
          <Sparkles className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className={cn(
          "font-black text-slate-900 mb-6 tracking-tight",
          viewMode === VIEW_MODES.MOBILE ? "text-3xl" : "text-4xl lg:text-5xl"
        )}>
          The Agency of the <span className="text-blue-600">Future</span>
        </h1>
        <p className={cn(
          "text-slate-500 max-w-xl mb-10 leading-relaxed",
          viewMode === VIEW_MODES.MOBILE ? "text-sm" : "text-base lg:text-lg"
        )}>
          We combine AI-powered tools with human creativity to build extraordinary digital experiences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors font-semibold">
            Get Started
          </button>
          <button className="px-8 py-3 bg-slate-50 border-2 border-slate-200 text-slate-700 rounded-full hover:bg-slate-100 transition-colors font-semibold">
            Learn More
          </button>
        </div>
        
        <div className={cn(
          "mt-16 w-full grid gap-6",
          viewMode === VIEW_MODES.MOBILE ? "grid-cols-1" : viewMode === VIEW_MODES.TABLET ? "grid-cols-2" : "grid-cols-3"
        )}>
          <div className="p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-all group">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg rounded-lg mb-4 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Lightning Fast</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Generate production-ready React components in seconds with AI-powered code generation.
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-all group">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg rounded-lg mb-4 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
              🎨
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Beautiful Design</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Tailwind CSS styling with responsive layouts that look perfect on any device.
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-all group">
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 shadow-lg rounded-lg mb-4 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
              🚀
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Export Anywhere</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Export your projects directly to GitHub repositories or download as ZIP files.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DesignPreview;
