import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Copy, Check } from 'lucide-react';
import Button from '../common/Button';

/**
 * Code View Component
 * Displays generated code with syntax highlighting
 */
const CodeView = ({ code, onCopy, isCopied }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full max-w-4xl bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-slate-800"
    >
      {/* Header */}
      <div className="bg-[#252525] px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
            Component.jsx
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onCopy}
          className="hover:bg-white/5 text-slate-400 hover:text-white"
          title="Copy code"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Code */}
      <div className="p-6 font-mono text-sm overflow-x-auto max-h-[600px] overflow-y-auto">
        <pre className="text-slate-300">
          <code>{code}</code>
        </pre>
      </div>
    </motion.div>
  );
};

export default CodeView;
