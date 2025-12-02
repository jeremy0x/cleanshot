import React, { useCallback } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { ImageAsset } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: ImageAsset) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [onImageSelected]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [onImageSelected]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageSelected({
        id: crypto.randomUUID(),
        data: base64,
        mimeType: file.type,
        timestamp: Date.now(),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="max-w-xl w-full">
        <label 
          htmlFor="file-upload"
          className="relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-gray-700 rounded-3xl cursor-pointer bg-gray-800/50 hover:bg-gray-800 hover:border-indigo-500 transition-all duration-300 group"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className="p-4 bg-gray-900 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-black/20">
              <Upload className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="mb-2 text-xl font-semibold text-white">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-400 max-w-xs">
              Upload your product photo or selfie to get started with AI editing
            </p>
            <div className="mt-8 flex gap-3 text-xs text-gray-500">
               <span className="flex items-center"><ImageIcon className="w-3 h-3 mr-1"/> JPG</span>
               <span className="flex items-center"><ImageIcon className="w-3 h-3 mr-1"/> PNG</span>
               <span className="flex items-center"><ImageIcon className="w-3 h-3 mr-1"/> WEBP</span>
            </div>
          </div>
          <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
};