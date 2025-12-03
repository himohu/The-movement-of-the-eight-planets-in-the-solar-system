import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.API_KEY || '';

export const generatePlanetFact = async (planetName: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return "API Key 缺失。无法获取 AI 知识。";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    // Updated prompt for Chinese output suitable for children
    const prompt = `
      你是一位亲切的天文学老师，正在给小学生科普天文知识。
      请关于"${planetName}"写一个有趣、独特且科学准确的冷知识。
      要求：
      1. 必须用中文回答。
      2. 长度控制在2句话以内。
      3. 语气生动活泼，激发孩子的好奇心。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    return text || `暂时无法获取关于 ${planetName} 的知识。`;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "星星今天躲在云后面了。（AI 服务暂时不可用）";
  }
};