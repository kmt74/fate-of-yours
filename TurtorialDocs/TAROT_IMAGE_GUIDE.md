# 🖼️ Hướng Dẫn Đưa Hình Ảnh Lá Bài Vào Database

> **Mục tiêu:** Upload 78 ảnh lá bài lên Supabase Storage, lưu URL vào bảng `tarot_cards`, và hiển thị trong app.

---

## Tổng quan luồng hoạt động

```
Ảnh PNG/WebP (máy local)
        ↓
Supabase Storage (bucket: tarot-images)
        ↓  URL công khai
Cột image_url trong bảng tarot_cards
        ↓
App đọc URL → hiển thị <img>
```

---

## Bước 1 — Chuẩn bị ảnh

### Định dạng khuyên dùng
| Tiêu chí | Yêu cầu |
|----------|---------|
| Định dạng | **WebP** (nhỏ nhất, chất lượng tốt) hoặc PNG |
| Kích thước | 400×700 px (tỉ lệ card 4:7) |
| Dung lượng | < 200 KB / ảnh |
| Tên file | Phải khớp `card_key` trong database |

### Quy tắc đặt tên file

Tên file phải khớp chính xác với cột `card_key` trong bảng `tarot_cards`:

```
the-fool.webp
the-magician.webp
the-high-priestess.webp
the-empress.webp
the-emperor.webp
the-hierophant.webp
the-lovers.webp
the-chariot.webp
strength.webp
the-hermit.webp
the-wheel-of-fortune.webp   ← chú ý: có "the-"
justice.webp
the-hanged-man.webp
death.webp
temperance.webp
the-devil.webp
the-tower.webp
the-star.webp
the-moon.webp
the-sun.webp
judgement.webp
the-world.webp
ace-of-wands.webp
two-of-wands.webp
... (tương tự cho cups, swords, pentacles)
page-of-wands.webp
knight-of-wands.webp
queen-of-wands.webp
king-of-wands.webp
```

> **Tip:** Kiểm tra tên đúng bằng cách chạy query trong Supabase:
> ```sql
> SELECT card_key, name_en FROM tarot_cards ORDER BY suit, position_number;
> ```

---

## Bước 2 — Tạo Storage Bucket trên Supabase

1. Vào **https://app.supabase.com** → chọn project của bạn
2. Menu trái → **Storage**
3. Click **"New bucket"**
4. Cấu hình:
   ```
   Name:          tarot-images
   Public bucket: ✅ BẬT (để app đọc được ảnh không cần auth)
   File size limit: 5 MB
   Allowed MIME types: image/webp, image/png, image/jpeg
   ```
5. Click **"Save"**

---

## Bước 3 — Upload ảnh lên Storage

### Cách A — Upload thủ công qua UI (cho ít ảnh)
1. Vào **Storage → tarot-images**
2. Click **"Upload files"**
3. Chọn tất cả file ảnh → Upload

### Cách B — Upload bằng script (khuyên dùng cho 78 ảnh)

Tạo file `scripts/upload-images.mjs`:

```javascript
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, extname, basename } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // Service key có quyền upload
);

const IMAGES_DIR = './card-images'; // Thư mục chứa ảnh trên máy bạn
const BUCKET = 'tarot-images';

async function uploadAll() {
  const files = readdirSync(IMAGES_DIR).filter(f =>
    ['.webp', '.png', '.jpg', '.jpeg'].includes(extname(f).toLowerCase())
  );

  console.log(`Found ${files.length} images to upload...`);
  let success = 0, failed = 0;

  for (const file of files) {
    const filePath = join(IMAGES_DIR, file);
    const fileBuffer = readFileSync(filePath);
    const ext = extname(file).toLowerCase();
    const mimeType = ext === '.webp' ? 'image/webp'
      : ext === '.png' ? 'image/png' : 'image/jpeg';

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(file, fileBuffer, {
        contentType: mimeType,
        upsert: true  // Ghi đè nếu file đã tồn tại
      });

    if (error) {
      console.error(`❌ Failed: ${file} —`, error.message);
      failed++;
    } else {
      console.log(`✅ Uploaded: ${file}`);
      success++;
    }
  }

  console.log(`\nDone: ${success} uploaded, ${failed} failed.`);
}

uploadAll();
```

Chạy script:
```bash
# Đặt ảnh vào thư mục card-images/ trong project
node scripts/upload-images.mjs
```

---

## Bước 4 — Thêm cột image_url vào database

Chạy SQL này trong **Supabase → SQL Editor**:

```sql
-- Thêm cột image_url vào bảng tarot_cards
ALTER TABLE tarot_cards
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Kiểm tra cột đã được thêm
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tarot_cards' AND column_name = 'image_url';
```

---

## Bước 5 — Cập nhật URL vào database

Sau khi upload xong, chạy SQL để tự động điền URL từ Storage vào bảng:

```sql
-- Điền image_url dựa trên card_key (định dạng WebP)
UPDATE tarot_cards
SET image_url = 'https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/tarot-images/' || card_key || '.webp'
WHERE image_url IS NULL;

-- Kiểm tra kết quả
SELECT card_key, image_url FROM tarot_cards LIMIT 5;
```

> **Lưu ý:** Thay `YOUR_PROJECT_ID` bằng ID project thật của bạn.
> Tìm ID tại: Supabase → Settings → General → Reference ID

### Nếu dùng PNG thay WebP:
```sql
UPDATE tarot_cards
SET image_url = 'https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/tarot-images/' || card_key || '.png'
WHERE image_url IS NULL;
```

---

## Bước 6 — Cập nhật TypeScript type

Mở file `src/lib/supabase.ts`, thêm field `image_url` vào interface:

```typescript
export interface TarotCardDB {
  id: number;
  card_key: string;
  name_en: string;
  // ... các field khác
  image_url: string | null;  // ← Thêm dòng này
}
```

---

## Bước 7 — Dùng image_url trong component

Ví dụ trong `RevealedTarotCard.tsx`:

```tsx
// Trước: dùng ảnh placeholder hoặc icon
<div className="card-image-placeholder">🃏</div>

// Sau: dùng ảnh thật từ Supabase
{card.image_url ? (
  <img
    src={card.image_url}
    alt={card.name_en}
    className="w-full h-full object-cover rounded"
    loading="lazy"
  />
) : (
  <div className="card-image-placeholder">🃏</div>
)}
```

---

## Kiểm tra

### Kiểm tra URL hoạt động
Mở trình duyệt và dán URL này (thay card_key thật):
```
https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/tarot-images/the-fool.webp
```
Nếu thấy ảnh → thành công ✅

### Kiểm tra số ảnh đã upload
```sql
SELECT COUNT(*) as total,
       COUNT(image_url) as has_image,
       COUNT(*) - COUNT(image_url) as missing_image
FROM tarot_cards;
```

### Tìm card nào chưa có ảnh
```sql
SELECT card_key, name_en
FROM tarot_cards
WHERE image_url IS NULL
ORDER BY suit, position_number;
```

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|---------|
| Ảnh không hiện, lỗi 404 | Tên file không khớp `card_key` | Đổi tên file theo quy tắc |
| Upload lỗi permission | Dùng anon key thay vì service key | Dùng `SUPABASE_SERVICE_KEY` |
| Bucket không public | Quên bật Public | Storage → Bucket → Edit → bật Public |
| URL trả về 404 | Sai Project ID trong URL | Kiểm tra lại Reference ID |

---

## Nguồn ảnh gợi ý (miễn phí)

| Nguồn | Link | Ghi chú |
|-------|------|---------|
| Rider-Waite (Public Domain) | https://sacred-texts.com/tarot | Bộ cổ điển |
| Wikimedia Commons | https://commons.wikimedia.org | Tìm "Rider Waite tarot" |
| Labyrinthos | https://labyrinthos.co | Phong cách hiện đại |

> ⚠️ Luôn kiểm tra license trước khi dùng ảnh thương mại.
