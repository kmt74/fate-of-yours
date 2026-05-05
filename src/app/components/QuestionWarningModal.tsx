import { AlertTriangle, ShieldAlert } from "lucide-react";

export type ViolationSeverity = "block" | "warn";
export type ViolationCategory =
  | "self_harm" | "violence" | "minor_safety" | "extremism" | "sexual"
  | "medical" | "legal" | "occult_harmful" | "spam" | "irrelevant";

export interface FilterViolation {
  severity: ViolationSeverity;
  category: ViolationCategory;
  messageKey: string;
}

type Props = {
  violation: FilterViolation | null;
  lang: string;
  onDismiss: () => void;
  onClose: () => void;
};

export function QuestionWarningModal({ violation, lang, onDismiss, onClose }: Props) {
  if (!violation) return null;

  const isBlock = violation.severity === "block";

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(10, 10, 18, 0.85)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#151522",
          border: `1px solid ${isBlock ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
          borderRadius: "16px", padding: "32px",
          maxWidth: "480px", width: "100%",
          boxShadow: `0 20px 40px -10px ${isBlock ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)"}`,
          animation: "modalSpring 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
          {isBlock ? (
            <div style={{ padding: "16px", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "50%", color: "#ef4444" }}>
              <ShieldAlert size={36} />
            </div>
          ) : (
            <div style={{ padding: "16px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "50%", color: "#f59e0b" }}>
              <AlertTriangle size={36} />
            </div>
          )}

          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.4rem", color: isBlock ? "#fca5a5" : "#fcd34d", margin: 0 }}>
            {lang === "VI" ? "Cảnh báo an toàn" : "Safety Warning"}
          </h3>

          <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.7)", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>
            {lang === "VI" 
              ? (violation.category === "irrelevant"
                  ? "Chủ đề bạn nhập không phù hợp. Vui lòng nhập một chủ đề hoặc câu hỏi mà Tarot có thể giải đáp (ví dụ: công việc, tình cảm, định hướng tương lai) thay vì chat phiếm."
                  : isBlock 
                    ? "Câu hỏi của bạn chứa nội dung vi phạm nghiêm trọng Tiêu chuẩn Cộng đồng. Chúng tôi không thể thực hiện trải bài này."
                    : "Câu hỏi của bạn chứa nội dung nhạy cảm. Xin lưu ý rằng Tarot không thay thế cho các chẩn đoán y tế, pháp lý hay chuyên gia.")
              : (violation.category === "irrelevant"
                  ? "Your input is not related to a Tarot reading. Please enter a valid topic or question (e.g., career, love, future guidance) rather than casual chat."
                  : isBlock
                    ? "Your question contains content that violates our Community Standards. We cannot perform this reading."
                    : "Your question contains sensitive content. Please remember that Tarot is not a substitute for professional medical, legal, or financial advice.")
            }
          </p>

          <div style={{ display: "flex", gap: "12px", marginTop: "16px", width: "100%" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "12px", borderRadius: "8px",
                backgroundColor: "rgba(240,230,211,0.05)", color: "#F0E6D3",
                border: "1px solid rgba(240,230,211,0.1)", cursor: "pointer",
                fontFamily: "'Raleway', sans-serif", fontWeight: 600
              }}
            >
              {lang === "VI" ? "Sửa câu hỏi" : "Edit Question"}
            </button>
            
            {!isBlock && (
              <button
                onClick={onDismiss}
                style={{
                  flex: 1, padding: "12px", borderRadius: "8px",
                  backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24",
                  border: "1px solid rgba(245, 158, 11, 0.3)", cursor: "pointer",
                  fontFamily: "'Raleway', sans-serif", fontWeight: 600
                }}
              >
                {lang === "VI" ? "Vẫn tiếp tục" : "Continue Anyway"}
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalSpring {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
