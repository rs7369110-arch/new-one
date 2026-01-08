
// Use Google GenAI SDK to interact with Gemini models.
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the API client using process.env.API_KEY directly as required by guidelines.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSmartNotice = async (topic: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Draft a professional school notice for: ${topic}. Format it with a title and content.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["title", "content"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const getHomeworkHelp = async (subject: string, topic: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Give 3 short homework ideas or practice questions for ${subject} regarding ${topic}.`
  });
  return response.text;
};
