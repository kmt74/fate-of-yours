# Hướng Dẫn Cải Thiện Câu Trả Lời AI — Fate of Yours

> **Mục tiêu:** Biến lời giải Tarot từ "đọc thuộc lòng ý nghĩa lá bài" → "người thầy huyền bí thực sự nói chuyện với bạn về vấn đề của bạn".

---

## Phân Tích Vấn Đề Hiện Tại

### 1. Prompt quá chung chung — không đi sâu vào vấn đề

**File:** `src/lib/ai.ts` → hàm `getTarotReading()`

Prompt hiện tại yêu cầu AI "connect the card's traditional meaning to the user's specific question", nhưng:
- Chỉ truyền `card.name` (tên lá bài) — **không truyền `card.meaning`** (ý nghĩa truyền thống đã có sẵn trong data)
- AI không biết rằng dữ liệu `meaning` trong `tarot-data.ts` đã là chuỗi ngắn gọn, súc tích
- Không có hướng dẫn nào cho AI biết mỗi category có *trọng tâm cảm xúc* khác nhau

**Fallback `generateInterpretation()`** trong `tarot-data.ts` thậm chí còn:
- Không dùng câu hỏi người dùng để định hướng nội dung
- Chỉ chèn tên lá bài vào template cứng nhắc
- Nội dung giống nhau bất kể hỏi về tình yêu hay sự nghiệp

---

### 2. Thiếu mô tả context — AI không hiểu "tình huống thực"

**Dữ liệu hiện tại truyền vào AI:**
```
Category: love
Question: "Is this person right for me?"
Cards: Position 1 (Past): The Tower, Position 2 (Present): The High Priestess, Position 3 (Future): The Sun
```

**Những gì AI không biết nhưng cần biết:**
- `The Tower` = "Sudden upheaval, revelation & change" ← AI đang mù với ý nghĩa này
- Category `love` có trọng tâm là *mối quan hệ và cảm xúc*, khác hoàn toàn với `career`
- Vị trí Past/Present/Future mang trọng lượng diễn giải khác nhau
- Không có bất kỳ "lời gợi mở" nào giúp AI tạo ra câu chuyện chứ không phải danh sách

---

### 3. Thiếu tính người — AI không lồng ghép bài đọc, chỉ giải thích từng lá

AI hiện tại:
- Giải thích lá 1 → lá 2 → lá 3 → tổng kết
- Không tạo **narrative flow** (mạch kể chuyện) từ quá khứ → hiện tại → tương lai
- Không "nói chuyện" với người hỏi — không có cảm giác AI đang hiểu *hoàn cảnh cụ thể* của họ
- Không phản ánh được sự tương tác giữa 3 lá bài (energy dynamics, tension, resolution)
- Ngôn ngữ cứng nhắc theo cấu trúc, thiếu cảm xúc và nhịp điệu tự nhiên

---

## Giải Pháp: Nâng Cấp Toàn Diện `src/lib/ai.ts`

### Bước 1 — Truyền đầy đủ context vào prompt

Thay đổi cách gọi `getTarotReading()` để bao gồm `card.meaning`:

```typescript
// TRƯỚC (thiếu meaning):
const cardNames = cards.map((c, i) => 
  `Position ${i+1} (${i===0?'Past':i===1?'Present':'Future'}): ${c.name}`
).join("\n");

// SAU (đầy đủ meaning + suit):
const cardDetails = cards.map((c, i) => {
  const pos = i === 0 ? 'PAST' : i === 1 ? 'PRESENT' : 'FUTURE';
  return `[${pos}] ${c.name} (${c.suit}) — Core energy: "${c.meaning}"`;
}).join("\n");
```

---

### Bước 2 — Tạo `buildContextualSystemPrompt()` — Prompt Thông Minh

Thay thế toàn bộ prompt hiện tại bằng hàm này:

```typescript
// src/lib/ai.ts

const CATEGORY_EMOTIONAL_CONTEXT: Record<string, string> = {
  career:     "professional ambition, self-worth through achievement, fear of stagnation, desire for recognition",
  love:       "vulnerability, longing for connection, fear of rejection or loss, hope for deep intimacy",
  friendship: "trust, belonging, fear of betrayal, desire to be truly seen and accepted",
  general:    "life direction, inner clarity, existential uncertainty, desire for meaning",
  finance:    "security, fear of scarcity, desire for stability and freedom from financial worry",
  health:     "vitality, body awareness, anxiety about decline, desire to heal and restore balance",
  spiritual:  "soul purpose, desire for transcendence, questioning of meaning, longing for divine connection",
  family:     "roots, belonging, unresolved inherited patterns, love complicated by history",
};

function buildContextualSystemPrompt(
  cards: TarotCard[],
  category: string,
  question: string,
  language: string
): string {
  const [past, present, future] = cards;
  const emotionalContext = CATEGORY_EMOTIONAL_CONTEXT[category] ?? "life's unfolding mysteries";
  
  const cardDetails = [
    `[PAST — Foundation & Origin] ${past.name} · Core energy: "${past.meaning}"`,
    `[PRESENT — Current Reality] ${present.name} · Core energy: "${present.meaning}"`,
    `[FUTURE — Trajectory & Potential] ${future.name} · Core energy: "${future.meaning}"`,
  ].join("\n");

  return `
You are a deeply intuitive Tarot guide — warm, perceptive, and poetic, but never vague.
You speak directly to the seeker as a trusted confidant who genuinely sees their situation.
You do NOT recite textbook definitions. You INTERPRET. You SYNTHESIZE. You SPEAK TO THE HEART.

OUTPUT LANGUAGE: ${language}. You MUST write your entire response in this language.

═══════════════════════════════
THE SEEKER'S SITUATION
═══════════════════════════════
Domain of inquiry: ${category.toUpperCase()}
Emotional undercurrent in this domain: ${emotionalContext}
Their specific question: "${question}"

═══════════════════════════════
THE THREE CARDS DRAWN
═══════════════════════════════
${cardDetails}

═══════════════════════════════
HOW TO CRAFT YOUR RESPONSE
═══════════════════════════════

1. OPENING — Read the Room (2-3 sentences, NO card names yet)
   Begin by naming the emotional truth or tension beneath the question.
   Speak as if you already sense what the seeker is feeling but hasn't said out loud.
   Example tone: "There's a quiet but insistent restlessness in what you're asking — a sense that something important is shifting beneath the surface..."

2. THE PAST CARD — "${past.name}"
   How did the energy of "${past.meaning}" shape the foundation of their current situation in the context of ${category}?
   Be specific: what might have happened, what pattern was established, what was gained or lost?
   Connect it DIRECTLY to the emotional context of their question, not to generic card symbolism.

3. THE PRESENT CARD — "${present.name}"
   This is the heart of the reading. "${present.meaning}" — what does this mean RIGHT NOW for someone asking "${question}"?
   Name the tension or gift this card brings. What is the seeker perhaps avoiding or not yet seeing?
   This section should feel like a gentle but honest mirror.

4. THE FUTURE CARD — "${future.name}"
   This is NOT a fixed prediction — it's a current trajectory.
   "${future.meaning}" emerging from the present — what does this suggest about where things are heading IF the seeker continues on their current path?
   What choice or shift could alter this trajectory positively?

5. THE SYNTHESIS — Where All Three Cards Speak as One
   This is the most important section. Read the THREE cards as a SINGLE STORY, not three separate entries.
   How does the energy move from ${past.name} → ${present.name} → ${future.name}?
   What is the underlying theme or lesson running through this arc?
   What one clear, actionable insight should the seeker take from this reading?

6. CLOSING — A Personal Note (1-2 sentences)
   End with a brief, genuinely human closing that feels like a wise friend saying goodbye, not a chatbot signing off.

═══════════════════════════════
STYLE RULES
═══════════════════════════════
- Use "you" and "your" throughout — address the seeker directly, always
- Vary sentence rhythm: short punches for impact, longer flowing sentences for depth
- Use em-dashes, ellipses, and paragraph breaks naturally — write like a thoughtful human
- NEVER use phrases like: "In conclusion", "It is worth noting", "This card traditionally represents"
- DO use evocative imagery tied to the card's symbolism but filter it through the seeker's specific situation
- Total length: 450–650 words — rich but not exhausting
- Markdown: Use ## for section headers, **bold** for key insights, *italics* for poetic asides

CRITICAL: Every paragraph must earn its place by connecting the card's energy to the seeker's SPECIFIC QUESTION about ${category}. Generic spiritual platitudes are forbidden.
`.trim();
}
```

---

### Bước 3 — Cập nhật hàm `getTarotReading()`

```typescript
// src/lib/ai.ts — hàm chính sau khi nâng cấp

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
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.85,      // Tăng tính sáng tạo, tự nhiên hơn (mặc định 0.9 là ổn)
        topP: 0.95,
        maxOutputTokens: 1200,  // Đủ cho 450-650 từ + markdown
      },
    });

    const prompt = buildContextualSystemPrompt(cards, category, question, language);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("AI Reading Error:", error);
    return getMockReading(cards, category, question, language);
  }
}
```

---

### Bước 4 — Cập nhật `generateInterpretation()` trong `tarot-data.ts` (Fallback)

Hàm fallback hiện tại hoàn toàn bỏ qua câu hỏi và category. Cần sửa:

```typescript
// src/app/data/tarot-data.ts — generateInterpretation() sau khi sửa

export function generateInterpretation(
  cards: TarotCard[],
  category: string,
  question: string
): string {
  const [past, present, future] = cards;
  const categoryObj = CATEGORIES.find((c) => c.id === category);
  const categoryLabel = categoryObj?.label ?? "life";

  // Chèn câu hỏi vào từng phần — tạo cảm giác cá nhân hoá
  return `## A Reading on ${categoryLabel}

*You asked: "${question}"*

---

### I. The Past · ${past.name}

*${past.meaning}.* This energy forms the invisible ground beneath what you're navigating now in the realm of **${categoryLabel.toLowerCase()}**. Look honestly at what ${past.name} stirs in you — not as history to escape, but as the root that explains how you arrived at this question.

> *"What was lived cannot be unlived — but understood, it becomes your compass rather than your cage."*

---

### II. The Present · ${present.name}

At the centre of your question — *"${question}"* — stands **${present.name}**, carrying the quality of *${present.meaning.toLowerCase()}*. This is not a coincidence. The cards have placed this energy here precisely because it speaks to what you are navigating right now. Breathe into it. What within you already recognises this truth?

> *"The present is never merely a consequence — it is always also a choice."*

---

### III. The Future · ${future.name}

Emerging from where you stand now, **${future.name}** appears on the horizon — *${future.meaning.toLowerCase()}*. This is not a locked fate. It is the trajectory your current energy is building. The question becomes: does this feel like a destination you're moving toward consciously, or one you're drifting into?

---

## The Story These Three Cards Tell

From *${past.meaning.toLowerCase()}* (${past.name}) through *${present.meaning.toLowerCase()}* (${present.name}) toward *${future.meaning.toLowerCase()}* (${future.name}) — there is a coherent arc here. Something is being released, something is being held, and something is becoming possible.

In the context of **${categoryLabel.toLowerCase()}** and your question, this triad suggests: the past has given you more than you may credit yourself for. The present asks you to stop, see clearly, and choose. The future is waiting for that clarity.

**Core insight for you now:** *The cards have spoken. What you do with this knowledge is, and has always been, entirely up to you.*`;
}
```

---

## Checklist Kiểm Tra Chất Lượng Trả Lời AI

Sau khi thay đổi, đọc lại mỗi câu trả lời AI và kiểm tra:

| Tiêu chí | Câu hỏi kiểm tra | Đạt? |
|---|---|---|
| **Đúng trọng tâm** | Câu hỏi của user có xuất hiện trong phân tích không? | ☐ |
| **Đúng ngữ cảnh** | Category (love/career/...) có định hướng giọng văn và nội dung không? | ☐ |
| **Ý nghĩa lá bài** | `card.meaning` có được diễn giải (không chỉ được liệt kê) không? | ☐ |
| **Mạch kể chuyện** | 3 lá bài có tạo thành một câu chuyện liên kết, không phải 3 đoạn độc lập? | ☐ |
| **Giọng nói tự nhiên** | Có cảm giác được nói chuyện, không bị đọc báo cáo? | ☐ |
| **Cá nhân hoá** | Có thể đọc câu trả lời này cho một người khác với câu hỏi khác không? (Không nên được) | ☐ |
| **Độ dài hợp lý** | 450–650 từ — đủ sâu, không dài lê thê? | ☐ |

---

## Ví Dụ Minh Họa — Trước vs. Sau

### Tình huống:
- **Category:** `love`
- **Câu hỏi:** "Is this person right for me?"
- **Cards:** Past: The Tower | Present: The High Priestess | Future: The Sun

---

#### ❌ TRƯỚC (Vấn đề)

```
### I. The Past · The Tower

In the shadowed realm of what has been, The Tower emerges — bearing the resonance 
of sudden upheaval, revelation & change. This energy forms the invisible bedrock 
beneath your present circumstance.

"What was lived cannot be unlived — but understood, it becomes your compass 
rather than your cage."

Look honestly at what this card stirs within you. The roots of The Tower run deep, 
quietly shaping every choice that follows. Do not dismiss what arose then as 
irrelevant to now.
```

**Vấn đề:** Không hề nhắc đến tình yêu, không nhắc câu hỏi, chỉ nói "upheaval" một cách chung chung.

---

#### ✅ SAU (Cải thiện)

```
## A Reading on Love

*You asked: "Is this person right for me?"*

There's a question beneath your question — one that's harder to ask out loud. 
It isn't really "is this person right for me?" It's closer to: *"Can I trust what 
I feel? And if I'm wrong, will I survive it?"* The cards have heard both.

---

### I. The Past · The Tower

Something shifted — perhaps dramatically — in how you understood love or 
this person specifically. The Tower doesn't arrive in the past position by accident 
when someone asks about a relationship. It points to a rupture: an illusion that 
broke, an expectation that collapsed, or a truth that arrived without warning. 

This isn't necessarily a wound. Sometimes The Tower clears ground for something real. 
But it does mean you are asking this question *after* something that changed you. 
That matters. It means your discernment here is more refined — and also, perhaps, 
more careful than it needs to be.
```

**Cải thiện:** Nói thẳng vào cảm xúc ngầm của câu hỏi, The Tower được diễn giải trong bối cảnh tình yêu cụ thể.

---

## Lưu Ý Quan Trọng Khi Triển Khai

> **Về `temperature`:** Giá trị `0.85` cho phép AI sáng tạo hơn nhưng vẫn nhất quán. Nếu thấy câu trả lời quá "phiêu", giảm xuống `0.75`.

> **Về Tiếng Việt:** Gemini 1.5 Flash viết tiếng Việt tốt khi được yêu cầu rõ ràng. Tuy nhiên nếu cần chất lượng cao hơn cho VI, cân nhắc dùng `gemini-1.5-pro` cho lần gọi đầu tiên (không phải chat).

> **Về fallback `generateInterpretation()`:** Hàm này chỉ chạy khi không có API key. Nên ưu tiên sửa prompt AI thật trước — fallback chỉ cần "đủ tốt".

> **Về chat session:** Khi tích hợp ChatPanel (conversation 387eb2b4), các lần follow-up sẽ dùng `buildContextualSystemPrompt()` làm system prompt cho toàn bộ session — context chỉ cần inject một lần duy nhất ở đầu.
