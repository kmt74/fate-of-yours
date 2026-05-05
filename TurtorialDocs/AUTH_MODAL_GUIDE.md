# AuthModal — Tài liệu giải thích

## 1. AuthModal là gì?

`AuthModal` là hệ thống xác thực người dùng (Authentication) của ứng dụng Fate of Yours. Nó xuất hiện ngay khi người dùng bấm **"Reveal Your Destiny"** trên trang chủ, yêu cầu họ phải đăng nhập hoặc đăng ký trước khi có thể rút bài Tarot.

**Vị trí file:** `src/app/components/auth/AuthModal.tsx`

---

## 2. Cấu trúc bên trong — 3 thành phần

File này thực ra chứa **3 component riêng biệt** được export ra ngoài:

### `AuthModule` — Form đăng nhập / đăng ký
Đây là phần giao diện chính người dùng nhìn thấy.

### `AdminModal` — Cổng vào trang quản trị
Một form riêng biệt, chỉ hiện khi bấm nút "Admin" trên NavBar.

### `validateDate()` — Hàm kiểm tra ngày sinh
Một helper function dùng trong form Sign Up.

---

## 3. Luồng hoạt động của `AuthModule`

### 3.1 Đăng nhập (Sign In)

```
Người dùng nhập Email + Password
        │
        ▼
Kiểm tra validation (email hợp lệ? có nhập pass chưa?)
        │
        ▼ Nếu hợp lệ
supabase.auth.signInWithPassword({ email, password })
        │
        ├─── Thành công ──► login(data.user) ──► điều hướng đến /setup
        │
        └─── Thất bại ───► Hiện thông báo lỗi (sai email/pass, lỗi mạng...)
```

**API được gọi:** Supabase Auth (gọi thẳng, không qua Backend của mình)

### 3.2 Đăng ký (Sign Up)

```
Người dùng nhập Email + Password + Ngày sinh
        │
        ▼
Kiểm tra validation:
  - Email đúng định dạng?
  - Password >= 8 ký tự?
  - Ngày sinh hợp lệ? Người dùng >= 13 tuổi?
        │
        ▼ Nếu hợp lệ
supabase.auth.signUp({ email, password, options: { data: { date_of_birth } } })
        │
        ├─── Thành công ──► signup(data.user) ──► điều hướng đến /setup
        │
        ├─── Email đã tồn tại ──► Hiện thông báo "Already registered, sign in instead"
        │
        └─── Lỗi mạng ──► Hiện "Cannot connect to server"
```

**Lưu ý về xác nhận email:** Nếu Supabase yêu cầu xác nhận email (Email Confirmation bật ON trong cài đặt Supabase), `data.user.identities` sẽ là mảng rỗng. Code phát hiện điều này và thông báo cho người dùng.

---

## 4. Luồng hoạt động của `AdminModal`

Form này **không dùng Supabase**. Nó xác thực cứng (hardcoded) trong code:

```
Admin nhập Email + Password
        │
        ▼
So sánh với hằng số được khai báo đầu file:
  ADMIN_EMAIL    = "admin@fate-of-yours.com"
  ADMIN_PASSWORD = "Admin#2026!"
        │
        ├─── Khớp ──► login(email, pass) ──► điều hướng đến /admin
        │
        └─── Sai ───► Hiện thông báo lỗi "Invalid credentials"
```

> ⚠️ **Vấn đề bảo mật:** Mật khẩu admin đang được hardcode trong Frontend code. Bất kỳ ai tải source code hoặc dùng DevTools đều có thể xem được. Đây là điểm cần cải thiện trong tương lai nếu muốn production-grade.

---

## 5. State management (Quản lý trạng thái)

`AuthModule` quản lý các state sau:

| State | Kiểu | Mục đích |
|---|---|---|
| `tab` | `"login" \| "signup"` | Tab nào đang hiển thị |
| `loginEmail`, `loginPass` | `string` | Giá trị input đăng nhập |
| `signEmail`, `signPass` | `string` | Giá trị input đăng ký |
| `dobDay`, `dobMonth`, `dobYear` | `string` | Ngày sinh (3 dropdown riêng) |
| `loginErrs`, `signErrs` | `Record<string, string>` | Lỗi validation cho từng field |
| `loading` | `boolean` | Hiện spinner khi đang gọi API |
| `dobTouched` | `boolean` | Người dùng đã chạm vào ngày sinh chưa |
| `dobFocused` | `boolean` | Dropdown ngày sinh có đang focus không |

Sau khi đăng nhập/đăng ký thành công, `login()` hoặc `signup()` từ `AppContext` được gọi để lưu thông tin user vào toàn bộ ứng dụng.

---

## 6. Ràng buộc ngày sinh

Hàm `validateDate()` kiểm tra:
- ✅ Tất cả 3 trường (ngày/tháng/năm) đều phải được chọn
- ✅ Ngày hợp lệ (ví dụ: không cho 31/02)
- ✅ Không được là ngày trong tương lai
- ✅ Người dùng phải **đủ 13 tuổi** (bảo vệ trẻ em)

---

## 7. Kết nối với hệ thống tổng thể

```
LandingPage
    │ (Bấm "Reveal Your Destiny")
    ▼
AuthModule hiện ra
    │ (Đăng nhập/Đăng ký thành công)
    ▼
AppContext.login() → isAuthenticated = true, user = {...}
    │
    ▼
Điều hướng đến /setup → Chọn câu hỏi → Rút bài → /reading
```

---

## 8. Hướng cải thiện trong tương lai

| Vấn đề | Giải pháp đề xuất |
|---|---|
| Admin credentials hardcoded | Chuyển sang Supabase Role-based Access Control (RBAC) |
| Không có "Quên mật khẩu" | Thêm `supabase.auth.resetPasswordForEmail()` |
| Không có đăng nhập Google/Facebook | Thêm `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| Không persist session (reload là mất login) | Thêm `supabase.auth.onAuthStateChange()` trong `AppContext` |
