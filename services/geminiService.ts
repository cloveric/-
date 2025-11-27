import { GoogleGenAI } from "@google/genai";
import { QuoteData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchZenQuote = async (): Promise<QuoteData> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      请从**汉传大乘佛教经典**（如《金刚经》、《心经》、《法华经》、《华严经》、《楞严经》、《维摩诘经》、《六祖坛经》等）中，摘录一句关于修行、般若、定力或清净心的经文。
      
      要求：
      1. **严格**仅限汉语大乘佛经原文，不要现代人的白话解释，不要网络鸡汤。
      2. 语言：文言文（经文原句）。
      3. 长度：短小精悍，不超过30个字。
      4. 格式：返回一个JSON对象，包含 'text' (经文内容) 和 'source' (出处，如《金刚经》).
      
      Example Output:
      {
        "text": "应无所住，而生其心。",
        "source": "《金刚经》"
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini");
    }

    const data = JSON.parse(responseText);

    return {
      text: data.text,
      source: data.source || "《佛经》",
      fetchedAt: Date.now(),
    };

  } catch (error) {
    console.error("Error fetching quote:", error);
    // Fallback quote from Diamond Sutra
    return {
      text: "一切有为法，如梦幻泡影，如露亦如电，应作如是观。",
      source: "《金刚经》",
      fetchedAt: Date.now(),
    };
  }
};