export interface ImageAsset {
  id: string;
  data: string; // Base64 string
  mimeType: string;
  timestamp: number;
}

export interface EditHistoryItem {
  original: ImageAsset;
  result: ImageAsset | null;
  prompt: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  EDITING = 'EDITING',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
}

export const PRESET_PROMPTS = [
  "Remove the background",
  "Add a retro 80s filter",
  "Make it look like a professional product photo with studio lighting",
  "Remove the person in the background",
  "Turn this into a sketch",
  "Isolate the main object on a white background",
  "Add a cinematic cyberpunk neon glow",
  "Make the colors pop and increase contrast"
];