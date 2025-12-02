import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, RotateCcw, Zap, Command, MessageSquare } from 'lucide-react';
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
    // Optional: auto-submit on preset click?
    // Let's focus input so they can edit if needed
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  return (
    <div className="flex h-screen bg-gray-950 text-white selection:bg-indigo-500/30">
      {/* Sidebar / Header Area */}
      <div className="w-80 border-r border-gray-800 bg-gray-900/50 flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={handleReset}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">PixelPerfect</h1>
            <p className="text-xs text-gray-400">AI Image Editor</p>
          </div>
        </div>

        {appState === AppState.IDLE ? (
           <div className="flex-1 flex flex-col justify-center text-center text-gray-500 space-y-4">
              <Zap className="w-12 h-12 mx-auto opacity-20" />
              <p>Upload an image to unlock AI capabilities</p>
           </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
             <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                  <Command className="w-3 h-3 mr-2" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {PRESET_PROMPTS.slice(0, 4).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(p)}
                      className="w-full text-left p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-transparent hover:border-gray-700 text-sm text-gray-300 transition-all duration-200 hover:shadow-md truncate"
                      disabled={loading || appState === AppState.REVIEW}
                    >
                      {p}
                    </button>
                  ))}
                </div>
             </div>

             <div className="mt-auto">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Project</h3>
               <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800 flex items-center gap-3">
                 <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                   {currentImage && <img src={currentImage.data} className="w-full h-full object-cover" alt="thumbnail" />}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium truncate text-gray-200">current_edit.png</p>
                   <p className="text-xs text-gray-500">{(currentImage?.data.length || 0) > 1024 * 1024 ? 'High Res' : 'Standard'}</p>
                 </div>
                 <button onClick={handleReset} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                   <RotateCcw className="w-4 h-4" />
                 </button>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b border-gray-800 flex items-center px-4 justify-between bg-gray-900">
           <div className="flex items-center gap-2">
             <Sparkles className="w-5 h-5 text-indigo-500" />
             <span className="font-bold">PixelPerfect</span>
           </div>
           {currentImage && (
             <button onClick={handleReset} className="text-sm text-gray-400">New</button>
           )}
        </div>

        {/* Workspace */}
        <div className="flex-1 relative p-4 md:p-8 flex flex-col min-h-0">
          
          {appState === AppState.IDLE && (
            <ImageUploader onImageSelected={handleImageSelected} />
          )}

          {(appState === AppState.EDITING || appState === AppState.PROCESSING) && currentImage && (
             <div className="flex-1 flex items-center justify-center min-h-0 relative">
                {/* Main Image Canvas */}
                <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-gray-900">
                  <img 
                    src={currentImage.data} 
                    alt="Work in progress" 
                    className={`max-w-full max-h-[70vh] object-contain transition-opacity duration-500 ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                  />
                  {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                      </div>
                      <p className="mt-4 text-indigo-300 font-medium animate-pulse">Gemini is dreaming...</p>
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
            <div className="mt-6 w-full max-w-3xl mx-auto z-20">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>
                   {error}
                </div>
              )}
              
              <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-2 shadow-2xl shadow-black/50 transition-all duration-200 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30">
                 <div className="flex items-end gap-2">
                    <div className="p-3 text-gray-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <textarea 
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe how you want to edit this image..."
                      className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 resize-none py-3 max-h-32 text-base leading-normal"
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
                      className="mb-1"
                    >
                      Generate
                    </Button>
                 </div>
                 
                 {/* Suggested Chips (Horizontal Scroll on Mobile) */}
                 <div className="border-t border-gray-700/50 mt-2 pt-2 px-2 pb-1 flex gap-2 overflow-x-auto no-scrollbar mask-gradient-right">
                    {PRESET_PROMPTS.map((p, i) => (
                      <button 
                        key={i}
                        onClick={() => handlePresetClick(p)}
                        className="whitespace-nowrap px-3 py-1 rounded-full bg-gray-700/50 hover:bg-gray-700 text-xs text-gray-300 border border-gray-600/50 transition-colors flex-shrink-0"
                      >
                        {p.length > 30 ? p.substring(0, 30) + '...' : p}
                      </button>
                    ))}
                 </div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-3">
                Powered by Gemini 2.5 Flash Image ("Nano Banana")
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;