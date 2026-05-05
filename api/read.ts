import { GoogleGenAI } from "@google/genai";

// ─── Types (Duplicated from frontend for simplicity) ──────────────────────────
type TarotCard = { id: string; name: string; meaning: string; [key: string]: any };
type TarotCardDB = Record<string, any>;

const CATEGORY_SOUL: Record<string, string> = {
  career: "professional identity, fear of wasted potential, longing for meaningful and recognised work",
  love: "the ache for deep connection, fear of rejection or abandonment, hope for a love that truly sees them",
  friendship: "the need to truly belong, fear of betrayal, hunger for bonds without performance or pretence",
  general: "the question beneath all questions — 'am I on the right path?' — and the quiet courage it takes to ask",
  finance: "safety and freedom from scarcity — the dream of not having to choose between security and living fully",
  health: "the body as home — the fear of losing it, the desire to feel alive, whole, and in control",
  spiritual: "the longing for meaning beyond the ordinary — the soul reaching toward something larger than itself",
  family: "roots, wounds, love tangled with history — the question of how far the past should reach into the present",
};

function getDbFields(category: string, isReversed: boolean) {
  const d = isReversed ? "reversed" : "upright";
  const catCol = ["love", "career", "finance"].includes(category) ? category : null;
  return {
    primary: catCol ? `meaning_${d}_${catCol}` : `meaning_${d}_general`,
    feelings: `meaning_${d}_feelings`,
    actions: `meaning_${d}_actions`,
    general: `meaning_${d}_general`,
  };
}

function cardBlock(
  card: TarotCard,
  position: "PAST" | "PRESENT" | "FUTURE",
  dbItem: TarotCardDB | undefined,
  category: string
): string {
  const isReversed = card.name?.toLowerCase().includes("(reversed)") ?? false;
  const f = dbItem ? getDbFields(category, isReversed) : null;

  const pull = (field: string) => (dbItem ? dbItem[field] ?? null : null);

  const primary = f ? (pull(f.primary) ?? pull(f.general)) : null;
  const feelings = f ? pull(f.feelings) : null;
  const actions = f ? pull(f.actions) : null;
  const keywords = isReversed
    ? (dbItem?.keywords_reversed ?? dbItem?.keywords_upright ?? "")
    : (dbItem?.keywords_upright ?? "");
  const visual = dbItem?.description?.slice(0, 220) ?? null;

  const lines: string[] = [
    `### ${position} — ${card.name} ${isReversed ? "[REVERSED]" : "[UPRIGHT]"}`,
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

function langInstruction(lang: string): string {
  if (lang === "VI") return `NGÔN NGỮ BẮT BUỘC: Toàn bộ phản hồi PHẢI bằng tiếng Việt. Phong cách: ấm áp, sâu sắc, thi vị nhưng không rỗng tuếch — như người bạn thân thực sự hiểu vấn đề. Dùng "bạn" xuyên suốt. Không dịch từng chữ mà hãy cảm nhận và diễn đạt tự nhiên.`;
  if (lang === "ZH") return `语言要求：全部回应必须使用中文。风格：温暖、深刻、诗意而不空洞，像真正理解对方的知心朋友。全程使用"你"。`;
  return `LANGUAGE: English throughout. Warm, perceptive, specific — like a close friend who truly sees, not a textbook.`;
}

// ─── API Handler ──────────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { cards, category, question, language, db } = req.body;

  if (!cards || cards.length !== 3) {
    return res.status(400).json({ error: "Invalid cards array" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const cardNames = cards.map((c: TarotCard) => c.name).join(" | ");
    console.log(`[Read] ▶ Request received — category: "${category}" | lang: ${language}`);
    console.log(`[Read]   Cards: ${cardNames}`);
    console.log(`[Read]   Question: "${question.slice(0, 80)}${question.length > 80 ? '...' : ''}"`);
    const positions: Array<"PAST" | "PRESENT" | "FUTURE"> = ["PAST", "PRESENT", "FUTURE"];
    
    // Xây dựng các khối nội dung thẻ dựa trên DB đã được Frontend lấy dùm
    const cardSection = cards
      .map((c: TarotCard, i: number) => {
        // Tạo key giống hàm nameToCardKey ở frontend (VD: "the_fool")
        const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
        const dbItem = db ? db[key] : undefined;
        return cardBlock(c, positions[i], dbItem, category);
      })
      .join("\n---\n\n");

    const soul = CATEGORY_SOUL[category] ?? "the desire for clarity amid life's uncertainty";

    // ── BIẾN PROMPT BÍ MẬT ── 
    // Giờ đây nó hoàn toàn ẩn khỏi trình duyệt của người dùng
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
THE THREE CARDS
═══════════════════════════════════════
${cardSection}

═══════════════════════════════════════
HOW TO WRITE THIS READING
═══════════════════════════════════════

**1. OPENING — The Unspoken Layer** (2-3 sentences, no card names yet)
Before naming any card, name the emotional truth beneath the question.
What is the seeker REALLY asking? What fear or hope lives underneath "${question}"?
Speak as if you sense what they haven't said aloud.

**2. THE PAST — [name the first card]**
Don't describe the card. Describe what its energy did IN THIS PERSON'S ${category} HISTORY.
Specifically: how did the energy described in the card's meaning above shape the situation that led to this question?
Use the card's keywords and meaning, but reframe them as lived experience, not definitions.
What did this energy cost them? What did it give them?

**3. THE PRESENT — [name the second card]**
This is the crux. This card is the answer to "what is actually happening right now?"
Use the "feelings" and "actions" meaning from above to show them what this energy FEELS like from the inside.
What is this card placing directly in front of the seeker?
What might they be avoiding, not seeing, or not yet ready to claim?
**Bold the single most important insight here.**

**4. THE FUTURE — [name the third card]**
This is a trajectory if nothing changes — AND what could shift it.
Use the card's meaning to describe WHERE the current energy leads if the seeker stays on the same path.
Then: what one specific thing — one shift in perspective, one action, one truth — could change this trajectory?
Frame this as empowerment, not prediction. They are not a passenger.

**5. THE SYNTHESIS — One Story**
Read all three cards as a single sentence of cause → present reality → possible future.
Name the core theme running through all three.
Give ONE clear, concrete, actionable insight — something they can actually DO or SEE differently starting today.
This insight must connect directly to "${question}".

**6. CLOSING** (2-3 sentences maximum)
Like a trusted friend ending a conversation: genuine warmth, briefly personal, no clichés.
Do not summarise what you already said. Just close the space with humanity.

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

    let lastError: any;
    for (const model of MODEL_CASCADE) {
      let retriesLeft = 2;
      while (retriesLeft >= 0) {
        try {
          console.log(`[Read] ▶ Calling Gemini model: ${model}${retriesLeft < 2 ? ` (retry ${2 - retriesLeft}/2)` : ""}`);
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
          console.log(`[Read] ✅ Gemini success via ${model} — ${text.length} chars returned`);
          return res.status(200).json({ text });
        } catch (err: any) {
          lastError = err;
          const msg = String(err);
          
          if (msg.includes("404") || msg.includes("NOT_FOUND")) break; // model not found
          
          if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
            if (msg.includes("PerDay") || msg.includes("RPD")) {
              return res.status(429).json({ error: "rpd", message: "Daily quota exhausted" });
            }
            if (retriesLeft > 0) {
              const match = msg.match(/retryDelay["\s:]+(\d+)/);
              const delay = match ? parseInt(match[1], 10) * 1000 : 5000;
              const waitMs = Math.min(delay, 15000);
              console.warn(`[Read] ⏳ Rate limit (RPM) on ${model}. Retrying in ${waitMs}ms... (${retriesLeft} left)`);
              await new Promise(r => setTimeout(r, waitMs));
              retriesLeft--;
              continue;
            } else {
              console.warn(`[Read] ➡ RPM retries exhausted on ${model}. Trying next model...`);
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
    console.error("[Read] ❌ Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
