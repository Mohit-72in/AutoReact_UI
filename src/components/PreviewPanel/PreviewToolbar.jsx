import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import Button from '../common/Button';
import { VIEW_MODES } from '../../config/constants';
import { cn } from '../../utils/cn';

/**
 * Preview Toolbar Component
 * Controls for preview (viewport size, code view, export)
 */
const PreviewToolbar = ({ 
  viewMode, 
  onViewModeChange, 
  showCode, 
  onToggleCode,
  onPublish 
}) => {
  return (
    <div className="p-3 bg-white border-b flex items-center justify-between shadow-sm">
      {/* Left: Window Controls & View Mode */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1.5 ml-1">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="h-4 w-[1px] bg-slate-200"></div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onViewModeChange(VIEW_MODES.DESKTOP)}
            className={cn(
              'transition-all',
              viewMode === VIEW_MODES.DESKTOP 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-slate-400 hover:text-slate-600 bg-transparent'
            )}
            title="Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onViewModeChange(VIEW_MODES.TABLET)}
            className={cn(
              'transition-all',
              viewMode === VIEW_MODES.TABLET 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-slate-400 hover:text-slate-600 bg-transparent'
            )}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onViewModeChange(VIEW_MODES.MOBILE)}
            className={cn(
              'transition-all',
              viewMode === VIEW_MODES.MOBILE 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-slate-400 hover:text-slate-600 bg-transparent'
            )}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onToggleCode}
          className={cn(
            showCode && 'bg-blue-50 border-blue-200 text-blue-600'
          )}
        >
          {showCode ? 'Preview' : 'View Code'}
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={onPublish}
        >
          Publish
        </Button>
      </div>
    </div>
  );
};

export default PreviewToolbar;
