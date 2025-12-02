import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, RotateCcw, Zap, Command, MessageSquare, Plus, ArrowRight } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonView } from './components/ComparisonView';
import { Button } from './components/Button';
import { ImageAsset, AppState, PRESET_PROMPTS } from './types';
import { generateEditedImage } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentImage, setCurrentImage] = useState<ImageAsset | null>(null);
  const [originalImageForComparison, setOriginalImageForComparison] = useState<ImageAsset | null>(null);
  const [processedImage, setProcessedImage] = useState<ImageAsset | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelected = (image: ImageAsset) => {
    setCurrentImage(image);
    setAppState(AppState.EDITING);
  };

  const handlePromptSubmit = async () => {
    if (!currentImage || !prompt.trim()) return;

    setLoading(true);
    setError(null);
    setAppState(AppState.PROCESSING);

    try {
      const resultBase64 = await generateEditedImage(currentImage, prompt);
      
      const newProcessedImage: ImageAsset = {
        id: crypto.randomUUID(),
        data: resultBase64,
        mimeType: 'image/png', // Gemini returns png usually
        timestamp: Date.now(),
      };

      setOriginalImageForComparison(currentImage);
      setProcessedImage(newProcessedImage);
      setAppState(AppState.REVIEW);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
      setAppState(AppState.EDITING);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (processedImage) {
      setCurrentImage(processedImage);
      setProcessedImage(null);
      setOriginalImageForComparison(null);
      setPrompt('');
      setAppState(AppState.EDITING);
    }
  };

  const handleDiscard = () => {
    setProcessedImage(null);
    setOriginalImageForComparison(null);
    setAppState(AppState.EDITING);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setCurrentImage(null);
    setProcessedImage(null);
    setOriginalImageForComparison(null);
    setPrompt('');
    setError(null);
  };

  const handlePresetClick = (preset: string) => {
    setPrompt(preset);
    setTimeout(() => {
        textareaRef.current?.focus();
    }, 10);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans">
      {/* Sidebar / Header Area */}
      <div className="w-80 border-r border-gray-100 bg-white flex flex-col p-8 hidden md:flex">
        <div className="flex items-center gap-2 mb-12 cursor-pointer group" onClick={handleReset}>
          <h1 className="font-display font-bold text-3xl tracking-tight group-hover:opacity-80 transition-opacity">cleanshot.</h1>
        </div>

        {appState === AppState.IDLE ? (
           <div className="flex-1 flex flex-col justify-center text-center text-gray-400 space-y-8">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto border border-gray-100 shadow-sm rotate-3 transition-transform hover:rotate-6 duration-500">
                <Zap className="w-8 h-8 text-gray-900" />
              </div>
              <div className="space-y-4">
                  <p className="text-lg font-semibold text-gray-900">Upload to start editing</p>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[240px] mx-auto">
                    CleanShot is an intelligent editor. Remove backgrounds, clean up objects, and enhance photos using simple text prompts.
                  </p>
              </div>
           </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
             <div className="mb-8">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {PRESET_PROMPTS.slice(0, 5).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(p)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 border border-transparent hover:border-gray-200 group flex items-center justify-between"
                      disabled={loading || appState === AppState.REVIEW}
                    >
                      <span className="truncate pr-2">{p}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-400" />
                    </button>
                  ))}
                </div>
             </div>

             <div className="mt-auto pt-6 border-t border-gray-100">
               <button 
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-black transition-all shadow-sm hover:shadow-md"
               >
                 <RotateCcw className="w-4 h-4" />
                 Start New Edit
               </button>
               <p className="text-[11px] text-center text-red-500 mt-4 font-medium opacity-80">
                 Save your work! Progress is not stored.
               </p>
             </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b border-gray-100 flex items-center px-4 justify-between bg-white z-10">
           <div className="flex items-center gap-2" onClick={handleReset}>
             <span className="font-display font-bold text-xl tracking-tight">cleanshot.</span>
           </div>
           {currentImage && (
             <button onClick={handleReset} className="p-2 text-gray-500 hover:text-gray-900">
               <RotateCcw className="w-5 h-5" />
             </button>
           )}
        </div>

        {/* Workspace */}
        <div className="flex-1 relative p-4 md:p-10 flex flex-col min-h-0 bg-white">
          
          {appState === AppState.IDLE && (
            <ImageUploader onImageSelected={handleImageSelected} />
          )}

          {(appState === AppState.EDITING || appState === AppState.PROCESSING) && currentImage && (
             <div className="flex-1 flex items-center justify-center min-h-0 relative mb-8">
                {/* Main Image Canvas */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={currentImage.data} 
                    alt="Work in progress" 
                    className={`max-w-full max-h-full object-contain rounded-lg shadow-sm transition-all duration-500 ${loading ? 'opacity-30 grayscale blur-sm scale-[0.98]' : 'opacity-100 scale-100'}`}
                  />
                  
                  {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                      <div className="w-16 h-16 border-2 border-gray-100 border-t-black rounded-full animate-spin mb-6"></div>
                      <p className="text-sm font-medium text-gray-900 animate-pulse tracking-wide uppercase text-[10px]">Processing changes...</p>
                    </div>
                  )}
                </div>
             </div>
          )}

          {appState === AppState.REVIEW && originalImageForComparison && processedImage && (
            <ComparisonView 
              original={originalImageForComparison}
              processed={processedImage}
              onAccept={handleAccept}
              onDiscard={handleDiscard}
            />
          )}

          {/* Prompt Bar - Only show when editing/processing */}
          {(appState === AppState.EDITING || appState === AppState.PROCESSING) && (
            <div className="w-full max-w-2xl mx-auto z-20">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center justify-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>
                   {error}
                </div>
              )}
              
              <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl opacity-50 blur transition duration-500 group-hover:opacity-75"></div>
                 <div className="relative bg-white rounded-xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-200 flex flex-col overflow-hidden">
                    <div className="flex items-end p-2 gap-2">
                        <textarea 
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your edit (e.g., 'Remove the background')"
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3.5 px-4 text-lg text-gray-900 placeholder-gray-300 font-medium leading-normal outline-none"
                        rows={1}
                        disabled={loading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handlePromptSubmit();
                            }
                        }}
                        />
                        <Button 
                        onClick={handlePromptSubmit} 
                        disabled={!prompt.trim() || loading}
                        className="mb-1.5 mr-1.5 rounded-lg h-10 px-5"
                        size="md"
                        variant="primary"
                        >
                        Generate
                        </Button>
                    </div>
                 </div>
              </div>
              <p className="text-center text-[10px] uppercase tracking-widest text-gray-300 mt-6 font-medium lowercase">
                powered by gemini 2.5 flash image nano banana
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;