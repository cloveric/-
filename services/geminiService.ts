import { GoogleGenAI } from "@google/genai";
import { QuoteData } from "../types";

// Local fallback library strictly from Mahayana Sutras
const LOCAL_QUOTES: Omit<QuoteData, 'fetchedAt'>[] = [
  { text: "应无所住，而生其心。", source: "《金刚经》" },
  { text: "本来无一物，何处惹尘埃。", source: "《六祖坛经》" },
  { text: "心无挂碍，无挂碍故，无有恐怖。", source: "《心经》" },
  { text: "凡所有相，皆是虚妄。", source: "《金刚经》" },
  { text: "制心一处，无事不办。", source: "《佛遗教经》" },
  { text: "一切有为法，如梦幻泡影。", source: "《金刚经》" },
  { text: "色不异空，空不异色。", source: "《心经》" },
  { text: "不忘初心，方得始终。", source: "《华严经》" },
  { text: "一花一世界，一叶一如来。", source: "《华严经》" },
  { text: "知幻即离，不作方便；离幻即觉，亦无渐次。", source: "《圆觉经》" },
  { text: "若人欲了知，三世一切佛，应观法界性，一切唯心造。", source: "《华严经》" },
  { text: "狂心顿歇，歇即菩提。", source: "《楞严经》" }
];

export const fetchZenQuote = async (): Promise<QuoteData> => {
  const apiKey = process.env.API_KEY;

  // 1. Check if API Key exists. If not, use local library immediately.
  // This prevents crashes or errors for users who haven't configured the key.
  if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
    console.log("No API Key found. Using local Zen library.");
    return getRandomLocalQuote();
  }

  // 2. If Key exists, try to use AI
  try {
    // Lazy initialize to avoid errors during app startup if key is invalid
    const ai = new GoogleGenAI({ apiKey });
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
    console.error("Error fetching AI quote, falling back to local:", error);
    // If AI fails (network, quota, key error), fall back to local
    return getRandomLocalQuote();
  }
};

const getRandomLocalQuote = (): QuoteData => {
  const randomIndex = Math.floor(Math.random() * LOCAL_QUOTES.length);
  return {
    ...LOCAL_QUOTES[randomIndex],
    fetchedAt: Date.now(),
  };
};