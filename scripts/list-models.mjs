import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
  const response = await ai.models.list();
  
  const text = JSON.stringify(response);
  const matches = text.match(/models\/gemini-[a-zA-Z0-9\-\.]+/g);
  if (matches) {
      console.log([...new Set(matches)]);
  }
}

main().catch(console.error);
