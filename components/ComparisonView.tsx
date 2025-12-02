import React, { useState } from 'react';
import { Download, Check, X, ArrowLeftRight } from 'lucide-react';
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
    link.download = `cleanshot-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="flex-1 min-h-0 relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
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
          {/* Background (Processed) - Full View */}
          <img
            src={processed.data}
            alt="Processed"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Foreground (Original) - Clipped Overlay */}
          <img
            src={original.data}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ 
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
            }}
          />

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-10 drop-shadow-md"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 transform transition-transform group-hover:scale-110">
                <ArrowLeftRight className="w-4 h-4 text-gray-900" />
            </div>
          </div>
          
          {/* Labels */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-900 border border-gray-200 pointer-events-none shadow-sm z-20">
            Original
          </div>
          <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-white pointer-events-none shadow-sm z-20">
            Edited
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onDiscard}>
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
              Keep Editing
            </Button>
        </div>
      </div>
    </div>
  );
};