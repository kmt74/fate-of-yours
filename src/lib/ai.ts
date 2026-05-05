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

// ─── Main exported function ───────────────────────────────────────────────────
export async function getTarotReading(
  cards: TarotCard[],
  category: string,
  question: string,
  language: string = "EN"
): Promise<string> {
  try {
    // 1. Lấy dữ liệu DB công khai từ Supabase (Frontend vẫn lo phần này để giảm tải cho Backend)
    const keys = cards.map(c => nameToCardKey(c.name));
    const db = await getMultipleCardDetails(keys).catch(() => ({} as Record<string, TarotCardDB>));

    // 2. Gọi Backend API thay vì gọi trực tiếp AI
    const res = await fetch("/api/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cards, category, question, language, db }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        const data = await res.json();
        throw new RateLimitError(data.error || "rpm", 60000, data.message || "API busy");
      }
      throw new Error(`Backend returned ${res.status}`);
    }

    const data = await res.json();
    return data.text;

  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    console.error("[AI] Backend API failed:", err);
    // Thay vì nuốt lỗi và tự trả về fallback, ta ném lỗi ra ngoài để UI tự handle và hiện thông báo
    throw new Error("backend_failed");
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

  const getImg = (c: TarotCard) => `![${c.name}](/assets/cards/card_${c.id}.jpg)`;

  if (language === "VI") {
    return `## QUÁ KHỨ — ${past.name}
${getImg(past)}

${past.meaning}. Nhìn lại hành trình ${category} của bạn, lá bài này nói lên nền tảng bạn đã xây dựng — dù muốn hay không. Có điều gì trong năng lượng này mà bạn vẫn đang mang theo vào thời điểm hiện tại?

## HIỆN TẠI — ${present.name}
${getImg(present)}

Đây là trọng tâm. **${present.name}** đặt thẳng vào tay bạn câu trả lời cho "${question}": *${present.meaning.toLowerCase()}*. Trong lĩnh vực ${category}, năng lượng này đang hiện diện — bạn có đang chú ý đến nó không?

Có điều gì bạn đang né tránh không thừa nhận? Hay có điều gì bạn chưa sẵn sàng nhận lấy?

## TƯƠNG LAI — ${future.name}
${getImg(future)}

Nếu bạn tiếp tục theo hướng hiện tại, **${future.name}** là quỹ đạo đang hình thành — *${future.meaning.toLowerCase()}*. Đây không phải số phận cố định. Một sự thay đổi nhỏ trong cách bạn tiếp cận "${question}" có thể thay đổi hoàn toàn điểm đến này.

## TỔNG KẾT — Câu chuyện của bạn

Từ *${past.meaning.toLowerCase()}* qua *${present.meaning.toLowerCase()}* đến *${future.meaning.toLowerCase()}* — có một sợi chỉ đỏ chạy xuyên suốt ba lá này.

**Thông điệp cốt lõi:** Câu trả lời cho "${question}" không nằm bên ngoài bạn. Nó nằm ở mức độ bạn sẵn sàng thành thật với chính mình về điều đang thực sự diễn ra trong ${category}.`;
  }

  if (language === "ZH") {
    return `## 过去 — ${past.name}
${getImg(past)}

${past.meaning}。回望你在${category}领域的历程，这张牌揭示了你所建立的基础——无论你是否愿意承认。这股能量中，有什么是你仍在带入当下的？

## 现在 — ${present.name}
${getImg(present)}

这是核心。**${present.name}**将答案直接放到你手中：*${present.meaning.toLowerCase()}*。在${category}的领域里，这股能量正在运作——你注意到了吗？

你是否在回避什么不想承认的事？还是有什么你还没准备好接受？

## 未来 — ${future.name}
${getImg(future)}

如果你沿着当前方向继续，**${future.name}**就是正在成形的轨迹——*${future.meaning.toLowerCase()}*。这不是固定的命运。对"${question}"方式的细微改变，可能会彻底改变你的方向。

## 总结

从*${past.meaning.toLowerCase()}*经由*${present.meaning.toLowerCase()}*走向*${future.meaning.toLowerCase()}*——一根红线贯穿这三张牌。

**核心洞见：** "${question}"的答案不在外部。它取决于你愿意对${category}中正在发生的事情诚实到什么程度。`;
  }

  // English
  return `## THE PAST — ${past.name}
${getImg(past)}

${past.meaning}. Looking back at your ${category} journey, this card names the energy that laid your foundation — whether you chose it or not. Something in this pattern is still with you now, shaping how you approach this question without you realising it.

## THE PRESENT — ${present.name}
${getImg(present)}

This is the centre. **${present.name}** places the answer to "${question}" directly in your hands: *${present.meaning.toLowerCase()}*. In the realm of ${category}, this energy is active right now. The question isn't whether it's here — it's whether you're paying attention to it.

What are you avoiding acknowledging? What haven't you fully claimed yet?

### The Future — ${future.name}

If you continue on your current path, **${future.name}** is the trajectory forming — *${future.meaning.toLowerCase()}*. This is not a fixed fate. One honest shift in how you're holding "${question}" could change this destination entirely.

---

### The Story of Three Cards

From *${past.meaning.toLowerCase()}* through *${present.meaning.toLowerCase()}* toward *${future.meaning.toLowerCase()}* — there is a single thread running through all three.

**Core insight:** The answer to "${question}" doesn't live outside you. It lives in the degree to which you're willing to be honest with yourself about what is actually happening in your ${category} life right now.`;
}
