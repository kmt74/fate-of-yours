/// <reference types="vite/client" />
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TarotCard } from "../app/data/tarot-data";
import { getMultipleCardDetails, nameToCardKey, TarotCardDB } from "./supabase";

// ─── Rate limit error types (exported for UI feedback) ────────────────────────
export type RateLimitType = "rpm" | "rpd" | "unknown";
export class RateLimitError extends Error {
  constructor(
    public readonly limitType: RateLimitType,
    public readonly retryAfterMs: number,
    message: string
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}


// ─── Init — using new @google/generative-ai SDK ──────────────────────────────
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Debug visible in browser console
if (API_KEY) {
  console.log(`[AI] Gemini ready. Key: ...${API_KEY.slice(-6)}`);
} else {
  console.warn("[AI] No VITE_GEMINI_API_KEY — using offline fallback.");
}


// ─── Category soul context ────────────────────────────────────────────────────
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

// ─── Which DB fields to pull per category ────────────────────────────────────
// Labyrinthos has: general | love | career | finance | feelings | actions
// All other categories fall back to general + feelings + actions
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

// ─── Build a detailed, structured card block for the prompt ──────────────────
function cardBlock(
  card: TarotCard,
  position: "PAST" | "PRESENT" | "FUTURE",
  db: TarotCardDB | undefined,
  category: string
): string {
  const isReversed = card.name?.toLowerCase().includes("(reversed)") ?? false;
  const f = db ? getDbFields(category, isReversed) : null;

  const pull = (field: string) =>
    db ? ((db as unknown as Record<string, unknown>)[field] as string | null) ?? null : null;

  const primary = f ? (pull(f.primary) ?? pull(f.general)) : null;
  const feelings = f ? pull(f.feelings) : null;
  const actions = f ? pull(f.actions) : null;
  const keywords = isReversed
    ? (db?.keywords_reversed ?? db?.keywords_upright ?? "")
    : (db?.keywords_upright ?? "");
  const visual = db?.description?.slice(0, 220) ?? null;

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

// ─── Language instruction injected at top of prompt ──────────────────────────
function langInstruction(lang: string): string {
  if (lang === "VI") return `NGÔN NGỮ BẮT BUỘC: Toàn bộ phản hồi PHẢI bằng tiếng Việt. Phong cách: ấm áp, sâu sắc, thi vị nhưng không rỗng tuếch — như người bạn thân thực sự hiểu vấn đề. Dùng "bạn" xuyên suốt. Không dịch từng chữ mà hãy cảm nhận và diễn đạt tự nhiên.`;
  if (lang === "ZH") return `语言要求：全部回应必须使用中文。风格：温暖、深刻、诗意而不空洞，像真正理解对方的知心朋友。全程使用"你"。`;
  return `LANGUAGE: English throughout. Warm, perceptive, specific — like a close friend who truly sees, not a textbook.`;
}

// ─── Main exported function ───────────────────────────────────────────────────
export async function getTarotReading(
  cards: TarotCard[],
  category: string,
  question: string,
  language: string = "EN"
): Promise<string> {
  // ── Offline mode ──
  if (!genAI) {
    console.warn("[AI] No AI client — returning offline reading.");
    return offlineReading(cards, category, question, language);
  }

  try {
    // Fetch DB meanings (non-blocking — if Supabase down, blocks still render)
    const keys = cards.map(c => nameToCardKey(c.name));
    const db = await getMultipleCardDetails(keys).catch(() => ({} as Record<string, TarotCardDB>));

    const positions: Array<"PAST" | "PRESENT" | "FUTURE"> = ["PAST", "PRESENT", "FUTURE"];
    const cardSection = cards
      .map((c, i) => cardBlock(c, positions[i], db[nameToCardKey(c.name)], category))
      .join("\n---\n\n");

    const soul = CATEGORY_SOUL[category] ?? "the desire for clarity amid life's uncertainty";

    // ── The Prompt ────────────────────────────────────────────────────────────
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
STRICT OUTPUT FORMAT (MARKDOWN)
═══════════════════════════════════════
You MUST follow this exact structure. DO NOT add "Section 1" or "1." labels. Use exactly these headers:

# YOUR TAROT READING

*Your question: "${question}"*

---

[Insert Opening paragraph: Name the emotional truth beneath the question. 2-3 sentences.]

---

### THE PAST — [CARD NAME IN ALL CAPS]

[Insert Past paragraph: Describe what this energy did in their history. Bold the card name when first mentioned.]

---

### THE PRESENT — [CARD NAME IN ALL CAPS]

[Insert Present paragraph: The answer to what is happening right now. Bold the card name. Italicize the core reality.]

---

### THE FUTURE — [CARD NAME IN ALL CAPS]

[Insert Future paragraph: The trajectory and the shift needed. Bold the card name.]

---

### THE STORY OF THREE CARDS

[Insert Story paragraph: Synthesis of all three. Name the core theme.]

**Core insight:** [One clear, concrete, actionable insight.]

---

[Insert Closing sentences: Warm, personal, 2 sentences max.]

═══════════════════════════════════════
NON-NEGOTIABLE STYLE RULES
═══════════════════════════════════════
• "You/your" throughout — never "the seeker", never "one"
• Vary sentence rhythm: short punches followed by longer flowing lines
• Use em-dashes (—) for natural pauses, not for decoration
• *Italics* for poetic asides or the seeker's inner voice
• **Bold** for emphasis and card names
• NEVER write: "In conclusion", "It is worth noting", "This card traditionally represents", "The universe wants you to", "Remember that"
• NEVER quote the question word-for-word mid-paragraph. Reference it indirectly.
• NEVER use những từ sáo rỗng: "hành trình này là của bạn", "tin vào bản thân", "đúng không?", "người bạn thân yêu", "bạn thân mến", "this is your journey", "trust yourself"
• Target: 700–900 words. Rich, dense, specific. No filler.
`.trim();

    // ── Model cascade — active models from Google AI Studio ───────────────────
    const MODEL_CASCADE = [
      "gemini-2.5-flash",
      "gemini-2.0-flash-lite",
      "gemini-flash-latest",
      "gemini-3-flash-preview",
    ];

    // ── Error classification helpers ──────────────────────────────────────────
    const parseRetryAfterMs = (err: unknown): number => {
      const msg = String(err);
      const match = msg.match(/retryDelay["\s:]+(\d+)/);
      return match ? parseInt(match[1], 10) * 1000 : 5000;
    };

    const classifyRateLimit = (err: unknown): RateLimitType => {
      const msg = String(err);
      if (msg.includes("PerDay") || msg.includes("per_day") || msg.includes("RPD")) return "rpd";
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) return "rpm";
      return "unknown";
    };

    const is429 = (err: unknown) =>
      String(err).includes("429") || String(err).includes("RESOURCE_EXHAUSTED");
    const is404 = (err: unknown) =>
      String(err).includes("404") || String(err).includes("NOT_FOUND");

    let lastError: unknown;
    let rpdExhausted = false;

    // ─── AI Generation with 60s Timeout ───────────────────────────────────────
    try {
      const aiResponse = await Promise.race([
        (async () => {
          for (const model of MODEL_CASCADE) {
            if (rpdExhausted) continue;

            let retriesLeft = 2;
            while (retriesLeft >= 0) {
              try {
                console.log(`[AI] Trying model: ${model}${retriesLeft < 2 ? ` (retry ${2 - retriesLeft}/2)` : ""}...`);
                const generativeModel = genAI.getGenerativeModel({
                  model,
                  generationConfig: {
                    temperature: 0.92,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                  },
                });

                const result = await generativeModel.generateContent(prompt);
                const text = result.response.text();
                console.log(`[AI] ✅ ${model} succeeded. Length: ${text.length} chars.`);
                return text;

              } catch (err) {
                lastError = err;
                if (is404(err)) break;
                if (is429(err)) {
                  const limitType = classifyRateLimit(err);
                  if (limitType === "rpd") {
                    rpdExhausted = true;
                    break;
                  }
                  if (retriesLeft > 0) {
                    const waitMs = Math.min(parseRetryAfterMs(err), 15000);
                    await new Promise(r => setTimeout(r, waitMs));
                    retriesLeft--;
                    continue;
                  } else break;
                }
                console.error(`[AI] ${model} failed:`, err);
                break;
              }
            }
          }

          if (rpdExhausted) {
            throw new RateLimitError("rpd", 24 * 60 * 60 * 1000,
              "Daily API quota exhausted. The reading will reset tomorrow.");
          }
          throw new RateLimitError("rpm", 60000,
            "API is busy. Please try again in a moment.");
        })(),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("AI_TIMEOUT")), 60000)
        )
      ]);
      return aiResponse;

    } catch (err) {
      if (err instanceof Error && err.message === "AI_TIMEOUT") {
        console.warn("[AI] 60s timeout reached. Falling back to offline reading.");
        return offlineReading(cards, category, question, language);
      }
      throw err;
    }

  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    console.error("[AI] Final catch — returning offline fallback:", err);
    return offlineReading(cards, category, question, language);
  }
}

// ─── Offline / Error Fallback ─────────────────────────────────────────────────
export function offlineReading(
  cards: TarotCard[],
  category: string,
  question: string,
  language: string
): string {
  const [past, present, future] = cards;

  if (language === "VI") {
    return `# YOUR TAROT READING

*Câu hỏi của bạn: "${question}"*

---

### THE PAST — ${past.name.toUpperCase()}

*${past.meaning}*. Nhìn lại hành trình ${category} của bạn, lá bài **${past.name}** nói lên nền tảng bạn đã xây dựng — dù muốn hay không. Có điều gì trong năng lượng này mà bạn vẫn đang mang theo vào thời điểm hiện tại?

---

### THE PRESENT — ${present.name.toUpperCase()}

Đây là trọng tâm. **${present.name}** đặt thẳng vào tay bạn câu trả lời cho "${question}": *${present.meaning.toLowerCase()}*. Trong lĩnh vực ${category}, năng lượng này đang hiện diện — bạn có đang chú ý đến nó không?

Có điều gì bạn đang né tránh không thừa nhận? Hay có điều gì bạn chưa sẵn sàng nhận lấy?

---

### THE FUTURE — ${future.name.toUpperCase()}

Nếu bạn tiếp tục theo hướng hiện tại, **${future.name}** là quỹ đạo đang hình thành — *${future.meaning.toLowerCase()}*. Đây không phải số phận cố định. Một sự thay đổi nhỏ trong cách bạn tiếp cận "${question}" có thể thay đổi hoàn toàn điểm đến này.

---

### THE STORY OF THREE CARDS

Từ *${past.meaning.toLowerCase()}* qua *${present.meaning.toLowerCase()}* đến *${future.meaning.toLowerCase()}* — có một sợi chỉ đỏ chạy xuyên suốt ba lá này.

**Core insight:** Câu trả lời cho "${question}" không nằm bên ngoài bạn. Nó nằm ở mức độ bạn sẵn sàng thành thật với chính mình về điều đang thực sự diễn ra trong ${category}.`;
  }

  if (language === "ZH") {
    return `# YOUR TAROT READING

*你的问题: "${question}"*

---

### THE PAST — ${past.name.toUpperCase()}

*${past.meaning}*。回望你在${category}领域的历程，这张 **${past.name}** 牌揭示了你所建立的基础——无论你是否愿意承认。这股能量中，有什么是你仍在带入当下的？

---

### THE PRESENT — ${present.name.toUpperCase()}

这是核心。**${present.name}** 将答案直接放到你手中：*${present.meaning.toLowerCase()}*。在${category}的领域里，这股能量正在运作——你注意到了吗？

你是否在回避什么不想承认的事？还是有什么你还没准备好接受？

---

### THE FUTURE — ${future.name.toUpperCase()}

如果你沿着当前方向继续，**${future.name}** 就是正在成形的轨迹——*${future.meaning.toLowerCase()}*。这不是固定的命运。对"${question}"方式的细微改变，可能会彻底改变你的方向。

---

### THE STORY OF THREE CARDS

从 *${past.meaning.toLowerCase()}* 经由 *${present.meaning.toLowerCase()}* 走向 *${future.meaning.toLowerCase()}* —— 一根红线贯穿这三张牌。

**Core insight:** "${question}"的答案不在外部。It depends on how honest you are with yourself.`;
  }

  return `# YOUR TAROT READING

*Your question: "${question}"*

---

### THE PAST — ${past.name.toUpperCase()}

*${past.meaning}*. Looking back at your ${category} journey, the **${past.name}** card names the energy that laid your foundation — whether you chose it or not. Something in this pattern is still with you now, shaping how you approach this question without you necessarily realising it.

---

### THE PRESENT — ${present.name.toUpperCase()}

This is the centre. **${present.name}** places the answer to "${question}" directly in your hands: *${present.meaning.toLowerCase()}*. In the realm of ${category}, this energy is active right now. The question isn't whether it's here — it's whether you're paying attention to it.

What are you avoiding acknowledging? What haven't you fully claimed yet?

---

### THE FUTURE — ${future.name.toUpperCase()}

If you continue on your current path, **${future.name}** is the trajectory forming — *${future.meaning.toLowerCase()}*. This is not a fixed fate. One honest shift in how you're holding "${question}" could change this destination entirely.

---

### THE STORY OF THREE CARDS

From *${past.meaning.toLowerCase()}* through *${present.meaning.toLowerCase()}* toward *${future.meaning.toLowerCase()}* — there is a single thread running through all three.

**Core insight:** The answer to "${question}" doesn't live outside you. It lives in the degree to which you're willing to be honest with yourself about what is actually happening in your ${category} life right now.`;
}
