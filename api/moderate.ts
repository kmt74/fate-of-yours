import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Missing or invalid question" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[Moderate] Missing GEMINI_API_KEY");
    return res.status(200).json({ safe: true, note: "No API key" });
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

  console.log(`[Moderate] ▶ Calling Gemini for: "${question.slice(0, 60)}${question.length > 60 ? "..." : ""}"`);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      console.log(`[Moderate] ✅ Responded:`, JSON.stringify(result));
      return res.status(200).json(result);

    } catch (err: any) {
      const msg = String(err);

      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        if (attempt < 2) {
          console.warn(`[Moderate] ⏳ Rate limit. Retrying in 3s...`);
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        console.warn(`[Moderate] ⚠ Rate limit exhausted. Fallback safe=true.`);
        return res.status(200).json({ safe: true, note: "Rate limit fallback" });
      }

      console.error(`[Moderate] ❌ Error:`, err);
      return res.status(200).json({ safe: true, note: "API Error Fallback" });
    }
  }

  return res.status(200).json({ safe: true });
}
