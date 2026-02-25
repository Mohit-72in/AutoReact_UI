import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PreviewToolbar from './PreviewToolbar';
import CodeView from './CodeView';
import DesignPreview from './DesignPreview';
import { VIEW_MODES, DEFAULT_PREVIEW_CODE } from '../../config/constants';
import { generatePreviewHTML } from '../../utils/codePreview';

/**
 * Preview Panel Component
 * Main preview area with code/design toggle
 */
const PreviewPanel = ({ code = DEFAULT_PREVIEW_CODE, previewHTML = '', onPublish }) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.DESKTOP);
  const [showCode, setShowCode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish();
    } else {
      console.log('Publishing project...');
      // Default publish action
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      {/* Toolbar */}
      <PreviewToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showCode={showCode}
        onToggleCode={() => setShowCode(!showCode)}
        onPublish={handlePublish}
      />

      {/* Preview Area */}
      <div className="flex-1 flex justify-center items-start overflow-auto p-4 md:p-12 relative">
        <AnimatePresence mode="wait">
          {showCode ? (
            <CodeView 
              key="code"
              code={code} 
              onCopy={handleCopyCode}
              isCopied={isCopied}
            />
          ) : (
            <DesignPreview 
              key="design"
              viewMode={viewMode}
              generatedHtml={previewHTML}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PreviewPanel;
