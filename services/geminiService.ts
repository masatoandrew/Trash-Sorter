import { GoogleGenAI, Type } from "@google/genai";
import { ClassificationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We simulate the Teachable Machine logic using Gemini's superior zero-shot capabilities
// but strictly formatting the output to match our app's needs.

export const identifyTrashItem = async (base64Image: string): Promise<ClassificationResult> => {
  try {
    // Remove header if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
            Provide a confidence score between 70 and 99 (integer).
            Provide a short, kid-friendly recycling tip (max 20 words).
            Provide a fun fact about this type of waste (max 20 words).
            Ensure the tone is encouraging and educational for children.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemType: { type: Type.STRING, description: "The name of the detected item (e.g. Plastic Bottle)" },
            binCategory: { type: Type.STRING, description: "The recommended bin category" },
            confidence: { type: Type.INTEGER, description: "Confidence score percentage (0-100)" },
            tip: { type: Type.STRING, description: "A helpful recycling tip" },
            funFact: { type: Type.STRING, description: "A fun fact about the item" },
          },
          required: ["itemType", "binCategory", "confidence", "tip", "funFact"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ClassificationResult;
    } else {
      throw new Error("No response text from Gemini");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback mock data in case of API failure (or dev mode without key)
    return {
      itemType: "Unknown Item",
      binCategory: "Landfill",
      confidence: 0,
      tip: "If you aren't sure, it's safer to put it in the trash to avoid contamination.",
      funFact: "Always check your local recycling rules!",
    };
  }
};
