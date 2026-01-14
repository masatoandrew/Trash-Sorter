
import { GoogleGenAI, Type } from "@google/genai";
import { ClassificationResult } from "../types";

// Always initialize with the structured object format using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We simulate the Teachable Machine logic using Gemini's superior zero-shot capabilities
// but strictly formatting the output to match our app's needs.

export const identifyTrashItem = async (base64Image: string, language: string = 'English'): Promise<ClassificationResult> => {
  try {
    // Remove header if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

    // Use gemini-3-flash-preview for vision tasks as per latest recommendations
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this image to identify the main waste item. 
            Classify it into one of these bins: "Recycle - Plastic", "Recycle - Paper", "Recycle - Glass", "Recycle - Metal", "Compost", "Landfill", "E-Waste".
            
            IMPORTANT: Provide all text fields (itemType, binCategory, tip, funFact) in the following language: ${language}.
            
            Provide a confidence score between 70 and 99 (integer).
            Provide a short, kid-friendly recycling tip (max 20 words) in ${language}.
            Provide a fun fact about this type of waste (max 20 words) in ${language}.
            Ensure the tone is encouraging and educational for children.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemType: { type: Type.STRING, description: `The name of the detected item (e.g. Plastic Bottle) in ${language}` },
            binCategory: { type: Type.STRING, description: `The recommended bin category in ${language}` },
            confidence: { type: Type.INTEGER, description: "Confidence score percentage (0-100)" },
            tip: { type: Type.STRING, description: `A helpful recycling tip in ${language}` },
            funFact: { type: Type.STRING, description: `A fun fact about the item in ${language}` },
          },
          required: ["itemType", "binCategory", "confidence", "tip", "funFact"],
        },
      },
    });

    // Access .text property directly (not as a method)
    if (response.text) {
      return JSON.parse(response.text) as ClassificationResult;
    } else {
      throw new Error("No response text from Gemini");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback mock data in case of API failure (or dev mode without key)
    const isJapanese = language === '日本語';
    return {
      itemType: isJapanese ? "不明なアイテム" : "Unknown Item",
      binCategory: isJapanese ? "埋め立てゴミ" : "Landfill",
      confidence: 0,
      tip: isJapanese ? "確信が持てない場合は、汚染を防ぐためにゴミ箱に入れるのが安全です。" : "If you aren't sure, it's safer to put it in the trash to avoid contamination.",
      funFact: isJapanese ? "地域のルールを必ず確認しましょう！" : "Always check your local recycling rules!",
    };
  }
};
