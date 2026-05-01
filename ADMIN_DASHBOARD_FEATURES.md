# Gợi Ý Các Phần Admin Dashboard — Fate of Yours

> Dựa trên phân tích codebase hiện tại: app dùng `localStorage` cho history, có `User` system với flag `isAdmin`, 8 categories, 78 lá bài, và tích hợp Gemini AI.
> Các phần được chia theo **mức độ ưu tiên** và **độ phức tạp triển khai**.

---

## Tổng Quan Kiến Trúc Admin

```
/admin
├── Overview (Dashboard chính)
├── Users          (quản lý người dùng)
├── Readings       (theo dõi lịch sử trải bài)
├── Analytics      (thống kê & biểu đồ)
├── Content        (quản lý nội dung)
│   ├── Tarot Cards  (chỉnh sửa lá bài)
│   ├── Categories   (quản lý chủ đề)
│   └── AI Prompts   (tinh chỉnh prompt AI)
├── AI Monitor     (giám sát chất lượng AI)
└── Settings       (cấu hình hệ thống)
```

---

## PHẦN 1 — Overview Dashboard *(Ưu tiên cao · Đơn giản)*

> Trang đầu tiên admin thấy khi đăng nhập. Cần hiển thị sức khoẻ tổng thể của app.

### Thẻ Thống Kê Nhanh (KPI Cards)

| Thẻ | Dữ liệu | Nguồn hiện tại |
|---|---|---|
| 👤 Tổng người dùng | Số tài khoản đã đăng ký | localStorage keys `history_*` |
| 🃏 Tổng lần trải bài | Tổng readings đã thực hiện | Tổng hợp từ tất cả history |
| 🔥 Hoạt động hôm nay | Readings trong 24h qua | Filter theo timestamp |
| 🤖 Lần gọi AI | Số lần dùng Gemini API | Cần tracking riêng |
| 💬 Câu hỏi phổ biến nhất | Category được chọn nhiều nhất | Aggregate từ readings |
| ⭐ Lá bài xuất hiện nhiều nhất | Top card được rút | Aggregate từ readings |

### Activity Feed (Hoạt động gần đây)
- Timeline 10–20 sự kiện mới nhất: ai đăng ký, ai trải bài, ai thực hiện chat AI
- Format: `[icon] [user email] [hành động] · [thời gian]`
- Ví dụ: `🃏 user@gmail.com performed a Love reading · 5 minutes ago`

### Quick Actions
- Nút "Send Announcement" — gửi thông báo hệ thống (nếu có notification)
- Nút "Export Data" — xuất CSV toàn bộ readings
- Nút "Clear AI Cache" — reset prompt cache nếu có

---

## PHẦN 2 — Quản Lý Người Dùng *(Ưu tiên cao · Trung bình)*

> App hiện lưu user qua `login(email, password)` trong `AppContext`. Cần tập trung hoá.

### Danh Sách User
- Bảng với: Avatar placeholder · Email · Ngày sinh (DOB) · Ngày đăng ký · Số readings · Ngôn ngữ dùng
- Tìm kiếm theo email
- Filter: Tất cả / Active hôm nay / New this week / Admin only

### Chi Tiết User (khi click vào)
- Xem toàn bộ lịch sử readings của user đó
- Thống kê cá nhân: category yêu thích, lá bài xuất hiện nhiều nhất, tần suất dùng app
- Hành động: **Promote to Admin** / **Suspend account** / **Delete account**

### Phân Quyền
- Hiện tại `isAdmin` là boolean đơn giản — gợi ý mở rộng thành role:
  - `user` — người dùng thường
  - `moderator` — xem được readings của người khác, không sửa cấu hình
  - `admin` — toàn quyền

---

## PHẦN 3 — Reading Logs *(Ưu tiên cao · Đơn giản)*

> Hiện tại `HistoryPage.tsx` chỉ cho user thấy readings của chính họ. Admin cần thấy TẤT CẢ.

### Bảng Tất Cả Readings
Các cột:
- ID · Timestamp · User email · Category · Câu hỏi · 3 lá bài · Có dùng AI không · Ngôn ngữ

### Filters & Search
- Filter theo: Category · Thời gian (hôm nay / tuần này / tháng này) · Ngôn ngữ (EN/VI/ZH) · Có AI / Không AI
- Search theo: email người dùng, câu hỏi (keyword)
- Sort: Mới nhất · Cũ nhất · Theo category

### Xem Chi Tiết Reading
- Mở modal/drawer hiển thị đầy đủ: câu hỏi, 3 lá bài, full AI interpretation text
- Nút **Flag as Inappropriate** — đánh dấu nội dung cần xem lại
- Nút **Delete Reading** — xoá (cần confirm)

---

## PHẦN 4 — Analytics & Biểu Đồ *(Ưu tiên trung bình · Phức tạp)*

> Phần này cần backend/DB để tổng hợp dữ liệu. Với localStorage có thể làm phiên bản đơn giản.

### 4.1 — Biểu Đồ Sử Dụng
- **Line chart**: Số readings theo ngày/tuần/tháng
- **Bar chart**: Readings theo giờ trong ngày (peak hours)
- **Heatmap**: Ngày trong tuần × giờ (khi nào người dùng hay dùng nhất)

### 4.2 — Phân Tích Category
- **Pie/Donut chart**: Tỉ lệ % mỗi category được chọn
- Ranking: Love > Career > Finance > ... (với số lượng tuyệt đối)
- Trend: Category nào đang tăng/giảm trong 30 ngày qua

### 4.3 — Top Lá Bài
- **Top 10 lá xuất hiện nhiều nhất** (overall)
- **Top 5 lá theo từng vị trí** (Past / Present / Future riêng biệt)
- **Lá "duyên phận"**: cặp lá nào hay xuất hiện cùng nhau nhất
- Bảng đầy đủ 78 lá với số lần xuất hiện — có thể sort, search

### 4.4 — Phân Tích AI
- Tỉ lệ gọi AI thành công vs. fallback (mock reading)
- Phân phối ngôn ngữ: EN / VI / ZH
- Average response time của Gemini API
- Ước tính token đã dùng / chi phí API (nếu track được)

### 4.5 — Retention & Engagement
- **New vs. Returning users** trong 30 ngày
- **Session depth**: Bao nhiêu readings mỗi lần user vào app
- Users có dùng Chat AI không (khi tích hợp ChatPanel)

---

## PHẦN 5 — Quản Lý Nội Dung *(Ưu tiên trung bình · Phức tạp)*

### 5.1 — Tarot Card Editor

> File nguồn: `src/app/data/tarot-data.ts` — hiện tại hardcode. Cần CMS để chỉnh sửa mà không cần deploy lại.

**Danh sách tất cả 78 lá bài** — bảng có thể sort/filter theo:
- Suit (Major Arcana / Wands / Cups / Swords / Pentacles)
- Alphabet

**Form chỉnh sửa mỗi lá:**
- `name` — tên tiếng Anh
- `meaning` — ý nghĩa ngắn (hiển thị trong app)
- `symbol` — ký tự symbol (unicode)
- Tên tiếng Việt (từ `MAJOR_ARCANA_VI`)
- Tên tiếng Trung (từ `MAJOR_ARCANA_ZH`)
- **Extended meaning** *(mới)* — mô tả dài hơn dùng cho AI prompt
- **Reversed meaning** *(nâng cao)* — ý nghĩa khi lá bài bị ngược

> 💡 **Gợi ý triển khai:** Lưu override vào localStorage hoặc Supabase, merge với hardcode data khi load app.

### 5.2 — Category Manager

**Danh sách 8 categories hiện tại** — cho phép:
- Sửa `label`, `description`, `icon`, `accentColor`
- Thêm/sửa/xoá các câu hỏi gợi ý (`questions[]`) cho mỗi category
- Bật/tắt hiển thị category (ẩn "Friendship" nếu không muốn)
- Thêm category mới (nếu mở rộng)

**Bản địa hoá:**
- Quản lý nhãn tiếng Việt (`CATEGORY_VI`) và tiếng Trung (`CATEGORY_ZH`) trực tiếp từ UI

### 5.3 — AI Prompt Studio *(Quan trọng nhất)*

> Đây là phần có giá trị cao nhất — cho phép tinh chỉnh câu trả lời AI mà không cần code.

**Prompt Template Editor:**
- Xem và sửa `system prompt` hiện tại (từ `buildContextualSystemPrompt()`)
- Rich text editor với các biến placeholder được highlight: `{{card.name}}`, `{{category}}`, `{{question}}`
- Live preview: nhập tên lá bài + category + câu hỏi → xem prompt sẽ trông như thế nào

**Category Emotional Context:**
- Bảng chỉnh sửa `CATEGORY_EMOTIONAL_CONTEXT` — mô tả cảm xúc ngầm của từng category
- Ví dụ: `love` → *"vulnerability, longing for connection, fear of rejection..."*
- Dễ thêm sắc thái văn hoá phù hợp người dùng Việt Nam

**Tone Presets:**
- Chọn giọng văn mặc định: Mystical Oracle · Warm Friend · Clinical Analyst · Poetic Guide
- Tạo và lưu custom preset

**A/B Testing (nâng cao):**
- Tạo 2 phiên bản prompt khác nhau
- Phân phối 50/50 cho người dùng
- So sánh "reading quality score" (nếu có feedback từ user)

---

## PHẦN 6 — AI Monitor *(Ưu tiên trung bình · Đơn giản)*

> Giám sát chất lượng và chi phí của Gemini API.

### API Health Dashboard
- Status indicator: 🟢 API OK / 🔴 API Error / 🟡 High Latency
- Lỗi gần đây: danh sách error log với timestamp, user, cards, error message
- Tỉ lệ fallback: `X% readings dùng mock reading do API lỗi`

### Reading Quality Monitor
- **User Feedback** *(cần thêm vào ReadingPage)*: nút 👍 / 👎 sau mỗi reading
- Danh sách readings bị đánh giá thấp → admin review để cải thiện prompt
- Từ khoá phổ biến trong câu hỏi người dùng → hiểu người dùng cần gì

### API Usage & Cost
- Token đã dùng trong tháng
- Ước tính chi phí (dựa trên Gemini pricing)
- Cảnh báo khi gần đến giới hạn

---

## PHẦN 7 — Settings & Configuration *(Ưu tiên thấp · Đơn giản)*

### Cấu Hình Hệ Thống
- **Maintenance Mode**: bật/tắt → hiển thị banner "App đang bảo trì" cho user thường
- **AI On/Off**: tắt hoàn toàn Gemini, dùng fallback `generateInterpretation()` cho tất cả
- **Language Default**: ngôn ngữ mặc định khi user mới đăng ký
- **Reading History Limit**: giới hạn bao nhiêu readings mỗi user được lưu (tránh đầy localStorage)

### Quản Lý Tài Khoản Admin
- Đổi email admin (hiện hardcode `admin@fate-of-yours.com` trong `AppContext.tsx`)
- Đổi password admin
- Multi-admin: thêm nhiều email admin

### Thông Báo Hệ Thống
- Tạo banner thông báo hiển thị trên LandingPage (ví dụ: "🎉 Chào mừng tháng 5!")
- Bật/tắt email notification (khi kết nối Supabase)

---

## Lộ Trình Triển Khai Gợi Ý

```
Sprint 1 (Tuần 1-2) — Nền tảng
├── [x] Phần 1: Overview Dashboard (stats từ localStorage)
├── [x] Phần 3: Reading Logs (aggregate toàn bộ readings)
└── [x] Phần 7: Settings cơ bản (Maintenance mode, AI toggle)

Sprint 2 (Tuần 3-4) — Nội dung
├── [ ] Phần 5.3: AI Prompt Studio (HIGH VALUE)
├── [ ] Phần 5.2: Category Manager
└── [ ] Phần 6: AI Monitor (basic error log)

Sprint 3 (Tuần 5-6) — Người dùng & Phân tích
├── [ ] Phần 2: User Management (cần migrate sang real DB)
├── [ ] Phần 4: Analytics & Charts
└── [ ] Phần 5.1: Tarot Card Editor

Sprint 4 (Tuần 7+) — Nâng cao
├── [ ] A/B Testing prompt
├── [ ] User feedback system
└── [ ] Multi-admin roles
```

---

## Lưu Ý Kỹ Thuật Quan Trọng

> **Database Migration:** Tất cả phần quản lý User và Reading Logs đòi hỏi chuyển từ `localStorage` sang Supabase (hoặc tương đương). Đây là prerequisite cho Sprint 3+.

> **Navigation:** Thêm sidebar navigation cho admin thay vì dùng `GlobalNavBar` của user — 2 context hoàn toàn khác nhau.

> **Auth Guard:** Hiện tại `AdminDashboard.tsx` đã có guard (`if (!user?.isAdmin) return <Navigate />`). Đủ cho MVP — nâng cấp khi có JWT/session thật.

> **AI Prompt Studio** là phần có ROI cao nhất: không cần DB, chỉ cần localStorage để lưu custom prompt, nhưng cho phép cải thiện chất lượng AI đáng kể mà không cần deploy lại code.
