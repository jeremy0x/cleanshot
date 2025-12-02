import React, { useState } from 'react';
import { Download, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { ImageAsset } from '../types';
import { Button } from './Button';

interface ComparisonViewProps {
  original: ImageAsset;
  processed: ImageAsset;
  onAccept: () => void;
  onDiscard: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  original,
  processed,
  onAccept,
  onDiscard,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processed.data;
    link.download = `pixelperfect-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 relative bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
        <div 
          className="relative w-full h-full select-none cursor-ew-resize group"
          onMouseMove={(e) => isDragging && handleDrag(e)}
          onTouchMove={(e) => isDragging && handleDrag(e)}
          onClick={handleDrag}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
        >
          {/* Background (Processed) */}
          <img
            src={processed.data}
            alt="Processed"
            className="absolute inset-0 w-full h-full object-contain bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-gray-800"
            draggable={false}
          />

          {/* Foreground (Original) - clipped */}
          <div
            className="absolute inset-0 overflow-hidden border-r-2 border-indigo-500 bg-gray-900"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={original.data}
              alt="Original"
              className="absolute top-0 left-0 h-full w-auto max-w-none object-contain"
              style={{ width: '100vw', maxWidth: '100%' }} // Adjust based on parent container width logic if needed, usually simplified by using same aspect ratio container.
              // Note: To make "Before/After" slider perfect with `object-contain`, we need consistent sizing. 
              // A simpler approach for general images is `object-cover` but users might want to see whole image.
              // For `object-contain`, we need both images to be same dimensions and centered.
            />
            {/* Fix for object-contain slider alignment: */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <img src={original.data} className="w-full h-full object-contain opacity-0" alt="spacer" />
             </div>
             {/* Actual Visible Original Image placed exactly like the background one */}
             <img 
               src={original.data} 
               alt="Original"
               className="absolute inset-0 w-full h-full object-contain"
               style={{ 
                   width: '100%', // The parent div is clipped, so this image just needs to fill the parent's full logical space
                   height: '100%',
                   // We need to counteract the clipping parent's width relative to the grand-parent
                   // Actually, a simpler CSS approach for before/after sliders:
               }} 
            />
             {/* 
                Refined CSS Strategy for Slider:
                The `img` inside the clipped div must be the full width of the CONTAINER, not the clipped div.
             */}
             <div className="absolute inset-0 w-full h-full">
                <img 
                    src={original.data} 
                    className="w-full h-full object-contain"
                    alt="Original"
                />
             </div>
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-indigo-500 cursor-ew-resize shadow-[0_0_20px_rgba(99,102,241,0.5)] z-10"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <div className="flex gap-0.5">
                    <ArrowLeft className="w-3 h-3 text-white" />
                    <ArrowRight className="w-3 h-3 text-white" />
                </div>
            </div>
          </div>
          
          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/10 pointer-events-none">
            Original
          </div>
          <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-lg pointer-events-none">
            Edited
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onDiscard} className="text-gray-400 hover:text-white">
          <X className="w-4 h-4 mr-2" />
          Discard
        </Button>
        
        <div className="flex gap-3">
            <Button variant="secondary" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="primary" onClick={onAccept}>
              <Check className="w-4 h-4 mr-2" />
              Keep & Continue Editing
            </Button>
        </div>
      </div>
    </div>
  );
};