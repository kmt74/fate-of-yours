import { GoogleGenerativeAI } from "@google/generative-ai";
import { TarotCard } from "../data/tarot-data";

// Fallback logic if API key is not provided
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function getTarotReading(
  cards: TarotCard[],
  category: string,
  question: string,
  language: string = "EN"
): Promise<string> {
  if (!genAI) {
    return getMockReading(cards, category, question, language);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const cardNames = cards.map((c, i) => `Position ${i+1} (${i===0?'Past':i===1?'Present':'Future'}): ${c.name}`).join("\n");
    
    const prompt = `
      You are an Elite Tarot Master and Spiritual Guide with decades of experience in archetypal psychology and esoteric wisdom. 
      Interpret this 3-card spread (Past, Present, Future) with extreme depth and precision.

      CONTEXT:
      - Category: ${category}
      - User's Question: "${question}"
      - Cards Drawn:
        ${cardNames}
      - Output Language: ${language} (CRITICAL: You MUST answer strictly in this language. If it is EN, use English. If it is VI, use Vietnamese.)

      GUIDELINES FOR ANALYSIS:
      1. **Tone**: Profound, empathetic, mystical yet practical. Use a "Grand Oracle" persona.
      2. **Intro**: Start with a high-level spiritual summary of the user's current situation in ${language}.
      3. **Individual Card Analysis**: For EACH card, write a detailed paragraph (at least 5-7 sentences) in ${language} that specifically connects the card's traditional meaning to the user's specific question and category (${category}).
      4. **The Interaction (The "Story")**: Explain in ${language} how these three cards interact with each other.
      5. **Advice & Actionable Insight**: Provide concrete, mystical advice in ${language} based on the spread.
      6. **Markdown Formatting**:
         - Use ## for main sections.
         - Use ### for card titles.
         - Use **bold** for key archetypes and vital warnings/blessings.
         - Use *italics* for mystic quotes and spiritual insights.
         - Use --- for dividers between sections.
      
      LENGTH: Ensure the total response is long and comprehensive (aim for 500-800 words).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Reading Error:", error);
    return getMockReading(cards, category, question, language);
  }
}

function getMockReading(cards: TarotCard[], category: string, question: string, language: string): string {
  const isVI = language === "VI";
  const langPrefix = isVI ? "Hỡi linh hồn tìm kiếm," : language === "ZH" ? "寻求者，" : "Seeker of truth,";
  
  const content = isVI ? {
    opening: "Các vì sao đã sắp đặt, và những lá bài đã lên tiếng để dẫn lối cho bạn.",
    query: `Về câu hỏi: "${question}" thuộc lĩnh vực **${category.toUpperCase()}**, vũ trụ gửi đến bạn thông điệp sau:`,
    pastTitle: "Quá Khứ",
    pastDesc: `Lá bài **${cards[0].name}** đại diện cho những nền tảng bạn đã xây dựng. Trong quá khứ, bạn đã trải qua những giai đoạn quan trọng liên quan đến ${category}.`,
    presentTitle: "Hiện Tại",
    presentDesc: `Đây là trung tâm của năng lượng lúc này. **${cards[1].name}** cho thấy bạn đang ở trong một trạng thái **biến chuyển mạnh mẽ**.`,
    futureTitle: "Tương Lai",
    futureDesc: `Kết quả cuối cùng dẫn đến **${cards[2].name}**. Đây là lá bài của sự **viên mãn và thành tựu**.`,
    summaryTitle: "Tổng Quan & Lời Khuyên Từ Vũ Trụ",
    summaryDesc: "Sự kết hợp của bộ ba này cho thấy một hành trình từ trải nghiệm qua thử thách đến khai sáng.",
    advice: "Hãy kiên nhẫn, sự thật sẽ sớm hiển lộ dưới ánh sáng của tri thức."
  } : {
    opening: "The stars have aligned, and the cards have spoken to guide your path.",
    query: `Regarding your question: "${question}" in the realm of **${category.toUpperCase()}**, the universe sends you the following message:`,
    pastTitle: "The Past",
    pastDesc: `The **${cards[0].name}** represents the foundations you have built. In the past, you experienced significant milestones related to ${category}.`,
    presentTitle: "The Present",
    presentDesc: `This is the heart of the current energy. **${cards[1].name}** indicates you are in a state of **powerful transformation**.`,
    futureTitle: "The Future",
    futureDesc: `The final outcome leads to **${cards[2].name}**. This is the card of **fulfillment and achievement**.`,
    summaryTitle: "Universal Synthesis & Guidance",
    summaryDesc: "The combination of this triad shows a journey from experience through challenge to enlightenment.",
    advice: "Be patient; the truth will soon reveal itself under the light of wisdom."
  };

  return `
## ${langPrefix}

*${content.opening}*

${content.query}

---

### 1. ${content.pastTitle}: ${cards[0].name}
${content.pastDesc}

### 2. ${content.presentTitle}: ${cards[1].name}
${content.presentDesc}

### 3. ${content.futureTitle}: ${cards[2].name}
${content.futureDesc}

---

### ${content.summaryTitle}
${content.summaryDesc}

**Core Advice**: *${content.advice}*
  `;
}
