import { GoogleGenAI } from "@google/genai";
import { TarotCard } from "../data/tarot-data";
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


// ─── Init — using new @google/genai SDK ──────────────────────────────────────
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

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
    db ? ((db as Record<string, unknown>)[field] as string | null) ?? null : null;

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
  if (!ai) {
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

    // ── Model cascade — active models from Google AI Studio ───────────────────
    const MODEL_CASCADE = [
      "gemini-2.5-flash",          // 1. Stable 2.5 Flash (Mid-size, 1M context)
      "gemini-2.0-flash-lite",     // 2. Fallback to 2.0 Lite (Usually has highest free quota limit)
      "gemini-flash-latest",       // 3. Fallback alias
      "gemini-3-flash-preview",    // 4. Fallback to Preview model
    ];

    // ── Error classification helpers ──────────────────────────────────────────
    const parseRetryAfterMs = (err: unknown): number => {
      const msg = String(err);
      const match = msg.match(/retryDelay["\s:]+(\d+)/);
      return match ? parseInt(match[1], 10) * 1000 : 5000;
    };

    // RPD = daily limit hit (limit: 0 in the violation, mentions RPD quota ID)
    // RPM = per-minute throttle (temporary, server says retry in Ns)
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
    let rpdExhausted = false; // Once a model hits RPD, track it

    for (const model of MODEL_CASCADE) {
      if (rpdExhausted) {
        // Don't even try — all models share the same project quota for RPD
        console.warn(`[AI] Skipping ${model} — daily quota already confirmed exhausted.`);
        continue;
      }

      // Retry the SAME model up to 2 times for RPM (temporary throttle)
      // before cascading to the next model
      let retriesLeft = 2;
      while (retriesLeft >= 0) {
        try {
          console.log(`[AI] Trying model: ${model}${retriesLeft < 2 ? ` (retry ${2 - retriesLeft}/2)` : ""}...`);
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
          console.log(`[AI] ✅ ${model} succeeded. Length: ${text.length} chars.`);
          return text;

        } catch (err) {
          lastError = err;

          if (is404(err)) {
            // Model doesn't exist — skip immediately, no retries
            console.warn(`[AI] ${model} → 404 (model not found). Skipping.`);
            break; // break while → continue for
          }

          if (is429(err)) {
            const limitType = classifyRateLimit(err);
            const delayMs = parseRetryAfterMs(err);

            if (limitType === "rpd") {
              // Daily quota exhausted — no point retrying any model today
              rpdExhausted = true;
              console.error(`[AI] ${model} → Daily quota (RPD) exhausted. No further retries.`);
              break; // break while → continue for (but rpdExhausted will skip remaining)
            }

            // RPM throttle — wait then retry same model
            if (retriesLeft > 0) {
              const waitMs = Math.min(delayMs, 15000); // cap at 15s
              console.warn(`[AI] ${model} → RPM limit. Waiting ${waitMs}ms then retrying (${retriesLeft} left)...`);
              await new Promise(r => setTimeout(r, waitMs));
              retriesLeft--;
              continue; // retry same model
            } else {
              // Retries exhausted for this model — cascade to next
              console.warn(`[AI] ${model} → RPM retries exhausted. Moving to next model.`);
              break;
            }
          }

          // Unexpected error — stop cascade entirely
          console.error(`[AI] ${model} failed with unexpected error:`, err);
          throw err;
        }
      }
    }

    // All models tried — determine why and throw informative error
    if (rpdExhausted) {
      throw new RateLimitError("rpd", 24 * 60 * 60 * 1000,
        "Daily API quota exhausted. The reading will reset tomorrow.");
    }
    console.error("[AI] All models exhausted (RPM):", lastError);
    throw new RateLimitError("rpm", 60000,
      "API is busy. Please try again in a moment.");

  } catch (err) {
    // RateLimitError is expected control-flow — already logged above, just re-throw
    if (err instanceof RateLimitError) throw err;
    // Unexpected errors (network failure, bad response shape, etc.)
    console.error("[AI] Gemini API unexpected error:", err);
    throw err;
  }
}

// ─── Offline / Error Fallback ─────────────────────────────────────────────────
// This is only used when genAI = null (no API key) or when ReadingPage catches the throw
export function offlineReading(
  cards: TarotCard[],
  category: string,
  question: string,
  language: string
): string {
  const [past, present, future] = cards;

  if (language === "VI") {
    return `## Bài Đọc Tarot Của Bạn

*Câu hỏi của bạn: "${question}"*

---

### Quá Khứ — ${past.name}

${past.meaning}. Nhìn lại hành trình ${category} của bạn, lá bài này nói lên nền tảng bạn đã xây dựng — dù muốn hay không. Có điều gì trong năng lượng này mà bạn vẫn đang mang theo vào thời điểm hiện tại?

### Hiện Tại — ${present.name}

Đây là trọng tâm. **${present.name}** đặt thẳng vào tay bạn câu trả lời cho "${question}": *${present.meaning.toLowerCase()}*. Trong lĩnh vực ${category}, năng lượng này đang hiện diện — bạn có đang chú ý đến nó không?

Có điều gì bạn đang né tránh không thừa nhận? Hay có điều gì bạn chưa sẵn sàng nhận lấy?

### Tương Lai — ${future.name}

Nếu bạn tiếp tục theo hướng hiện tại, **${future.name}** là quỹ đạo đang hình thành — *${future.meaning.toLowerCase()}*. Đây không phải số phận cố định. Một sự thay đổi nhỏ trong cách bạn tiếp cận "${question}" có thể thay đổi hoàn toàn điểm đến này.

---

### Câu Chuyện Của Ba Lá Bài

Từ *${past.meaning.toLowerCase()}* qua *${present.meaning.toLowerCase()}* đến *${future.meaning.toLowerCase()}* — có một sợi chỉ đỏ chạy xuyên suốt ba lá này.

**Thông điệp cốt lõi:** Câu trả lời cho "${question}" không nằm bên ngoài bạn. Nó nằm ở mức độ bạn sẵn sàng thành thật với chính mình về điều đang thực sự diễn ra trong ${category}.`;
  }

  if (language === "ZH") {
    return `## 你的塔罗牌解读

*你的问题: "${question}"*

---

### 过去 — ${past.name}

${past.meaning}。回望你在${category}领域的历程，这张牌揭示了你所建立的基础——无论你是否愿意承认。这股能量中，有什么是你仍在带入当下的？

### 现在 — ${present.name}

这是核心。**${present.name}**将答案直接放到你手中：*${present.meaning.toLowerCase()}*。在${category}的领域里，这股能量正在运作——你注意到了吗？

你是否在回避什么不想承认的事？还是有什么你还没准备好接受？

### 未来 — ${future.name}

如果你沿着当前方向继续，**${future.name}**就是正在成形的轨迹——*${future.meaning.toLowerCase()}*。这不是固定的命运。对"${question}"方式的细微改变，可能会彻底改变你的方向。

---

### 三张牌的故事

从*${past.meaning.toLowerCase()}*经由*${present.meaning.toLowerCase()}*走向*${future.meaning.toLowerCase()}*——一根红线贯穿这三张牌。

**核心洞见：** "${question}"的答案不在外部。它取决于你愿意对${category}中正在发生的事情诚实到什么程度。`;
  }

  // English
  return `## Your Tarot Reading

*Your question: "${question}"*

---

### The Past — ${past.name}

${past.meaning}. Looking back at your ${category} journey, this card names the energy that laid your foundation — whether you chose it or not. Something in this pattern is still with you now, shaping how you approach this question without you necessarily realising it.

### The Present — ${present.name}

This is the centre. **${present.name}** places the answer to "${question}" directly in your hands: *${present.meaning.toLowerCase()}*. In the realm of ${category}, this energy is active right now. The question isn't whether it's here — it's whether you're paying attention to it.

What are you avoiding acknowledging? What haven't you fully claimed yet?

### The Future — ${future.name}

If you continue on your current path, **${future.name}** is the trajectory forming — *${future.meaning.toLowerCase()}*. This is not a fixed fate. One honest shift in how you're holding "${question}" could change this destination entirely.

---

### The Story of Three Cards

From *${past.meaning.toLowerCase()}* through *${present.meaning.toLowerCase()}* toward *${future.meaning.toLowerCase()}* — there is a single thread running through all three.

**Core insight:** The answer to "${question}" doesn't live outside you. It lives in the degree to which you're willing to be honest with yourself about what is actually happening in your ${category} life right now.`;
}
