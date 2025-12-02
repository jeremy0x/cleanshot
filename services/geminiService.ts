import { GoogleGenAI } from "@google/genai";
import { ImageAsset } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Helper to clean base64 string
const cleanBase64 = (data: string) => {
  return data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

export const generateEditedImage = async (
  baseImage: ImageAsset,
  prompt: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image';
    
    // Clean the base64 string for the API
    const cleanData = cleanBase64(baseImage.data);

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: baseImage.mimeType,
              data: cleanData,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Check for inlineData (image) in the response parts
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated");
    }

    // Look for image part
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Fallback: check if there's text explanation if image generation failed conceptually
    const textPart = parts.find(p => p.text);
    if (textPart && textPart.text) {
        throw new Error(`The model returned text instead of an image: "${textPart.text.substring(0, 100)}..."`);
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};