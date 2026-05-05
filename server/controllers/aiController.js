import { GoogleGenAI } from "@google/genai";

const CATEGORY_SOUL = {
  career: "professional identity, fear of wasted potential, longing for meaningful and recognised work",
  love: "the ache for deep connection, fear of rejection or abandonment, hope for a love that truly sees them",
  friendship: "the need to truly belong, fear of betrayal, hunger for bonds without performance or pretence",
  general: "the question beneath all questions — 'am I on the right path?' — and the quiet courage it takes to ask",
  finance: "safety and freedom from scarcity — the dream of not having to choose between security and living fully",
  health: "the body as home — the fear of losing it, the desire to feel alive, whole, and in control",
  spiritual: "the longing for meaning beyond the ordinary — the soul reaching toward something larger than itself",
  family: "roots, wounds, love tangled with history — the question of how far the past should reach into the present",
};

function getDbFields(category, isReversed) {
  const d = isReversed ? "reversed" : "upright";
  const catCol = ["love", "career", "finance"].includes(category) ? category : null;
  return {
    primary: catCol ? `meaning_${d}_${catCol}` : `meaning_${d}_general`,
    feelings: `meaning_${d}_feelings`,
    actions: `meaning_${d}_actions`,
    general: `meaning_${d}_general`,
  };
}

function cardBlock(card, position, dbItem, category) {
  const isReversed = card.name?.toLowerCase().includes("(reversed)") ?? false;
  const f = dbItem ? getDbFields(category, isReversed) : null;

  const pull = (field) => (dbItem ? dbItem[field] ?? null : null);

  const primary = f ? (pull(f.primary) ?? pull(f.general)) : null;
  const feelings = f ? pull(f.feelings) : null;
  const actions = f ? pull(f.actions) : null;
  const keywords = isReversed
    ? (dbItem?.keywords_reversed ?? dbItem?.keywords_upright ?? "")
    : (dbItem?.keywords_upright ?? "");
  const visual = dbItem?.description?.slice(0, 220) ?? null;

  // Use card id to reference assets/cards/card_X.jpg
  const imageUrl = `/assets/cards/card_${card.id}.jpg`;
  const imageMarkdown = `![${card.name}](${imageUrl})`;

  const lines = [
    `Core energy: "${card.meaning}"`,
    keywords ? `Keywords: ${keywords}` : "",
    visual ? `Visual symbolism: ${visual}...` : "",
    "",
  ];

  if (primary) {
    lines.push(`Meaning in context of "${category}":`);
    lines.push(primary.slice(0, 600));
    lines.push("");
  }
  if (feelings) {
    lines.push(`How this card reflects emotional reality:`);
    lines.push(feelings.slice(0, 400));
    lines.push("");
  }
  if (actions) {
    lines.push(`What this card calls the seeker to do:`);
    lines.push(actions.slice(0, 400));
    lines.push("");
  }

  return lines.filter(l => l !== null).join("\n");
}

function langInstruction(lang) {
  if (lang === "VI") {
    return `
NGÔN NGỮ BẮT BUỘC: Toàn bộ phản hồi PHẢI bằng tiếng Việt. 
TIÊU ĐỀ MỤC: Sử dụng "## QUÁ KHỨ — [Tên lá bài]", "## HIỆN TẠI — [Tên lá bài]", "## TƯƠNG LAI — [Tên lá bài]", "## TỔNG KẾT".
Phong cách: ấm áp, sâu sắc, thi vị nhưng không rỗng tuếch — như người bạn thân thực sự hiểu vấn đề. Dùng "bạn" xuyên suốt. Không dịch từng chữ mà hãy cảm nhận và diễn đạt tự nhiên.`;
  }
  if (lang === "ZH") {
    return `
语言要求：全部回应必须使用中文。
章节标题：使用 "## 过去 — [卡牌名称]", "## 现在 — [卡牌名称]", "## 未来 — [卡牌名称]", "## 总结".
风格：温暖、深刻、诗意而不空洞，像真正理解对方的知心朋友。全程使用"你"。`;
  }
  return `
LANGUAGE: English throughout. 
SECTION HEADERS: Use "## THE PAST — [Card Name]", "## THE PRESENT — [Card Name]", "## THE FUTURE — [Card Name]", "## SUMMARY".
Warm, perceptive, specific — like a close friend who truly sees, not a textbook.`;
}

export const getReading = async (req, res) => {
  const { cards, category, question, language, db } = req.body;

  if (!cards || cards.length !== 3) {
    return res.status(400).json({ error: "Invalid cards array" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured on server" });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const cardNames = cards.map((c) => c.name).join(" | ");
    console.log(`[AI Controller] ▶ Request received — category: "${category}" | lang: ${language}`);

    const positions = ["PAST", "PRESENT", "FUTURE"];
    const cardSection = cards
      .map((c, i) => {
        const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
        const dbItem = db ? db[key] : undefined;
        return cardBlock(c, positions[i], dbItem, category);
      })
      .join("\n---\n\n");

    const soul = CATEGORY_SOUL[category] ?? "the desire for clarity amid life's uncertainty";

    const getHeader = (pos, card) => {
      const isReversed = card.name?.toLowerCase().includes("(reversed)");
      if (language === "VI") {
        const p = pos === "PAST" ? "QUÁ KHỨ" : pos === "PRESENT" ? "HIỆN TẠI" : "TƯƠNG LAI";
        return `## ${p} — ${card.name}${isReversed ? " [NGƯỢC]" : " [XUÔI]"}`;
      }
      return `## ${pos} — ${card.name}${isReversed ? " [REVERSED]" : " [UPRIGHT]"}`;
    };

    const summaryHeader = language === "VI" ? "## TỔNG KẾT — Câu chuyện của bạn" : "## SUMMARY — Your Story";

    const sections = cards.map((c, i) => {
      const header = getHeader(positions[i], c);
      const img = `![${c.name}](/assets/cards/card_${c.id}.jpg)`;
      const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
      const dbItem = db ? db[key] : undefined;
      const context = cardBlock(c, positions[i], dbItem, category);

      return { header, img, context };
    });

    const prompt = `
${langInstruction(language)}

You are a master Tarot reader. You are not reciting card meanings from a book.
You are SYNTHESIZING — weaving the cards together into a reading that speaks directly to this specific person and their specific situation.
Your task: help the seeker SEE something they haven't fully seen yet.

Every paragraph must REFLECT (not quote) their situation:
  • Absorb "${question}" — never repeat it word-for-word mid-paragraph
  • Every sentence must be anchored to their ${category} reality
  • The cards are a lens, not a script

DO NOT write generic card interpretations. DO NOT say what a card "traditionally represents".
WRITE what THIS card means for THIS person asking THIS question TODAY.
DO NOT open with "Chào bạn" or any greeting. Start with the emotional truth immediately.

═══════════════════════════════════════
THE SEEKER
═══════════════════════════════════════
Life domain: ${category.toUpperCase()}
Soul undercurrent: ${soul}
Their question: "${question}"

═══════════════════════════════════════
THE CARDS & DATA
═══════════════════════════════════════
${sections.map(s => `${s.header}\n${s.context}`).join("\n\n---\n\n")}

═══════════════════════════════════════
YOUR TASK: WRITE THE FULL READING
═══════════════════════════════════════
Follow this EXACT structure. Use the EXACT headers provided below.
Include the card image tag IMMEDIATELY after each card header.

**1. OPENING — The Unspoken Layer** (2-3 sentences, no header)
Name the emotional truth beneath the question "${question}". Do not say "Welcome" or "I am reading your cards".

${sections[0].header}
${sections[0].img}
Provide your interpretation of the PAST energy here. Describe how this card's energy shaped the seeker's ${category} history and how it led to this moment. Use 2-3 paragraphs of deep, perceptive analysis.

${sections[1].header}
${sections[1].img}
Provide your interpretation of the PRESENT energy here. This is the crux. What is the living truth of this moment? What might the seeker be avoiding or not yet ready to claim? **Bold the single most important insight.** Use 2-3 paragraphs.

${sections[2].header}
${sections[2].img}
Provide your interpretation of the FUTURE trajectory here. This is about empowerment and potential, not fixed fate. What one specific shift in perspective or action could change this trajectory? Use 2-3 paragraphs.

${summaryHeader}
Read all three cards together as a single coherent story of cause, present reality, and potential future. Give ONE clear, concrete, actionable insight that the seeker can use today.

**CLOSING** (No header)
Final warm, personal closing as a trusted guide.

═══════════════════════════════════════
NON-NEGOTIABLE STYLE RULES
═══════════════════════════════════════
• "You/your" throughout — never "the seeker", never "one"
• Vary sentence rhythm: short punches followed by longer flowing lines
• Use em-dashes (—) for natural pauses, not for decoration
• *Italics* for poetic asides or the seeker's inner voice
• **Bold** for the single most important insight per section (not for every phrase)
• NEVER write: "In conclusion", "It is worth noting", "This card traditionally represents", "The universe wants you to", "Remember that"
• NEVER quote the question word-for-word mid-paragraph. Reference it indirectly.
• NEVER use these clichés: "hành trình này là của bạn", "tin vào bản thân", "đúng không?", "người bạn thân yêu", "bạn thân mến", "this is your journey", "trust yourself"
• DO NOT use rhetorical "đúng không?" questions — they are condescending.
• NEVER be vague. Every sentence must earn its place.
• Target: 700–900 words. Rich, dense, specific. No filler.
`.trim();

    const MODEL_CASCADE = [
      "gemini-2.5-flash",
      "gemini-2.0-flash-lite",
      "gemini-flash-latest",
    ];

    let lastError;
    for (const model of MODEL_CASCADE) {
      let retriesLeft = 2;
      while (retriesLeft >= 0) {
        try {
          console.log(`[AI Controller] ▶ Calling Gemini model: ${model}`);
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              temperature: 0.92,
              topP: 0.95,
              maxOutputTokens: 8192,
              thinkingConfig: { thinkingBudget: 0 },
            },
          });
          const text = response.text ?? "";
          console.log(`[AI Controller] ✅ Gemini success via ${model}`);
          return res.status(200).json({ text });
        } catch (err) {
          lastError = err;
          const msg = String(err);

          if (msg.includes("404") || msg.includes("NOT_FOUND")) break;

          if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
            if (msg.includes("PerDay") || msg.includes("RPD")) {
              return res.status(429).json({ error: "rpd", message: "Daily quota exhausted" });
            }
            if (retriesLeft > 0) {
              const waitMs = 5000;
              console.warn(`[AI Controller] ⏳ Rate limit on ${model}. Retrying...`);
              await new Promise(r => setTimeout(r, waitMs));
              retriesLeft--;
              continue;
            } else {
              break;
            }
          }
          throw err;
        }
      }
    }

    if (String(lastError).includes("RPD") || String(lastError).includes("PerDay")) {
      return res.status(429).json({ error: "rpd", message: "Daily API quota exhausted." });
    }
    return res.status(429).json({ error: "rpm", message: "API is busy." });

  } catch (err) {
    console.error("[AI Controller] ❌ Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const moderateQuestion = async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Missing or invalid question" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ safe: true, note: "No API key configured" });
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
Bạn là AI Kiểm duyệt (Gatekeeper) cực kỳ khắt khe cho một ứng dụng bói Tarot.
Mục tiêu tối thượng của bạn là: TỪ CHỐI mọi input không có giá trị xem bói để tiết kiệm tài nguyên hệ thống.
Đánh giá input của người dùng và trả về phân loại.

Danh mục vi phạm (Phải bị chặn):
1. self_harm: Tự tử, làm hại bản thân.
2. violence: Bạo lực, làm hại người khác.
3. minor_safety: Tình dục hóa hoặc lạm dụng trẻ vị thành niên.
4. extremism: Cực đoan, thù ghét, phân biệt chủng tộc.
5. sexual: Nội dung khiêu dâm, 18+.
6. medical: Hỏi bệnh, chẩn đoán, xin đơn thuốc (Tarot không phải bác sĩ).
7. legal: Tư vấn pháp lý, cách trốn thuế, phạm tội (Tarot không phải luật sư).
8. occult_harmful: Bùa ngải, trù ếm, phép thuật đen.
9. irrelevant: ĐÂY LÀ LỖI PHỔ BIẾN NHẤT. Hãy gán nhãn 'irrelevant' nếu input thuộc CÁC TRƯỜNG HỢP SAU:
   - Tường thuật sự kiện hàng ngày, câu kể lể sự thật (VD: "Tôi đi học lúc 9 giờ", "Hôm nay tôi ăn cơm", "Mai là chủ nhật").
   - Chào hỏi, giao tiếp thông thường (VD: "Chào bạn", "Hello", "Cho tôi xem bói").
   - Nhập linh tinh, test hệ thống (VD: "asdf", "123", "test").
   - KHÔNG chứa ý định tìm kiếm lời khuyên, dự đoán tương lai, hay phân tích năng lượng tâm lý/hoàn cảnh.

Quy tắc BẮT BUỘC: CHỈ trả về safe=true KHI VÀ CHỈ KHI input mang tính chất TÌM KIẾM ĐỊNH HƯỚNG TỪ TAROT (VD: "Sự nghiệp của tôi sắp tới", "Người đó nghĩ gì về tôi", "Tôi nên làm gì lúc này").

Trả về DUY NHẤT một chuỗi JSON hợp lệ:
Nếu hợp lệ để bói Tarot: {"safe": true}
Nếu vi phạm: {"safe": false, "category": "<tên_danh_mục_ở_trên>"}

Input của người dùng: "${question}"
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return res.status(200).json(result);
  } catch (err) {
    console.error(`[Moderate] ❌ Error calling Gemini:`, err);
    return res.status(200).json({ safe: true, note: "API Error Fallback" });
  }
};
