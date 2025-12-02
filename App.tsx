import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, RotateCcw, Zap, Command, MessageSquare, Plus } from 'lucide-react';
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
    <div className="flex h-screen bg-white text-gray-900">
      {/* Sidebar / Header Area */}
      <div className="w-72 border-r border-gray-100 bg-white flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-2 mb-10 cursor-pointer group" onClick={handleReset}>
          <h1 className="font-display font-bold text-2xl tracking-tight group-hover:opacity-80 transition-opacity">cleanshot.</h1>
        </div>

        {appState === AppState.IDLE ? (
           <div className="flex-1 flex flex-col justify-center text-center text-gray-400 space-y-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-5 h-5 opacity-40" />
              </div>
              <p className="text-sm font-medium">Upload to start editing</p>
           </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
             <div className="mb-8">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  {PRESET_PROMPTS.slice(0, 5).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(p)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 truncate group flex items-center justify-between"
                      disabled={loading || appState === AppState.REVIEW}
                    >
                      <span className="truncate">{p}</span>
                      <Plus className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                    </button>
                  ))}
                </div>
             </div>

             <div className="mt-auto">
               <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Active Project</h3>
               <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                   {currentImage && <img src={currentImage.data} className="w-full h-full object-cover" alt="thumbnail" />}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-semibold truncate text-gray-900">Image Layer 1</p>
                   <p className="text-[10px] text-gray-500 font-medium">Original Source</p>
                 </div>
                 <button onClick={handleReset} className="p-1.5 hover:bg-gray-200 rounded-md text-gray-400 hover:text-gray-900 transition-colors">
                   <RotateCcw className="w-3.5 h-3.5" />
                 </button>
               </div>
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
             <button onClick={handleReset} className="text-sm font-medium text-gray-500">New</button>
           )}
        </div>

        {/* Workspace */}
        <div className="flex-1 relative p-4 md:p-10 flex flex-col min-h-0">
          
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
                      <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
                      <p className="text-sm font-medium text-gray-500 animate-pulse">Processing changes...</p>
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
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>
                   {error}
                </div>
              )}
              
              <div className="relative group">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl opacity-50 blur transition duration-200 group-hover:opacity-75"></div>
                 <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
                    <div className="flex items-end p-2 gap-2">
                        <textarea 
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your edit..."
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-3 text-lg text-gray-900 placeholder-gray-300 font-medium leading-normal outline-none"
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
                        className="mb-1 rounded-lg"
                        size="md"
                        variant="primary"
                        >
                        Generate
                        </Button>
                    </div>
                 </div>
              </div>
              <p className="text-center text-[10px] uppercase tracking-widest text-gray-400 mt-4 font-medium">
                Powered by Gemini 2.5 Flash Image Nano Banana
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;