# Hướng Dẫn Xây Dựng Database Cho 78 Lá Bài Tarot

---

## 1. Nên Dùng Database Nào?

### Lựa chọn: **Supabase (PostgreSQL)**

| Tiêu chí | Supabase | Firebase | PlanetScale |
|---|---|---|---|
| Loại DB | PostgreSQL (SQL) | NoSQL | MySQL |
| Text dài | ✅ `TEXT` không giới hạn | ✅ nhưng không query được | ✅ |
| Query linh hoạt | ✅ SQL đầy đủ | ❌ hạn chế | ✅ |
| Admin UI sẵn | ✅ Table Editor trực quan | ❌ | ✅ |
| Free tier | ✅ 500MB | ✅ | ✅ |
| Phù hợp stack Vite | ✅ SDK JS nhỏ gọn | ✅ | ✅ |
| **Kết luận** | ⭐ **Tốt nhất** | Không phù hợp | Phương án 2 |

**Lý do chọn PostgreSQL (Supabase):**
- Mỗi lá bài có **10–15 trường text dài** (upright/reversed × love/career/finance/health/feelings/actions)
- Dữ liệu có cấu trúc cố định — SQL là lựa chọn tự nhiên
- Supabase có **Table Editor** để sửa dữ liệu như Google Sheets
- SDK `@supabase/supabase-js` tích hợp trực tiếp vào Vite không cần backend

---

## 2. Cấu Trúc Bảng (Schema)

### Bảng `tarot_cards` — Lưu toàn bộ 78 lá bài

```sql
CREATE TABLE tarot_cards (
  -- Định danh
  id              SERIAL PRIMARY KEY,
  card_key        TEXT UNIQUE NOT NULL, -- vd: "the-fool", "ace-of-wands"
  name_en         TEXT NOT NULL,        -- "The Fool"
  name_vi         TEXT,                 -- "Kẻ Khờ"
  name_zh         TEXT,                 -- "愚者"

  -- Phân loại
  suit            TEXT NOT NULL,        -- 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'
  position_number INTEGER,              -- 0-21 cho Major, 1-14 cho Minor
  symbol          TEXT,                 -- ký tự unicode symbol

  -- Ý nghĩa ngắn (đang dùng trong app hiện tại)
  meaning_short   TEXT NOT NULL,        -- "New beginnings & pure potential"

  -- Từ khoá (từ labyrinthos_parsed_features.jsonl)
  keywords_upright   TEXT,             -- "beginnings, freedom, innocence, originality"
  keywords_reversed  TEXT,             -- "reckless, careless, distracted, naive"

  -- Mô tả hình ảnh lá bài
  description     TEXT,                -- mô tả chi tiết hình ảnh trên lá bài

  -- Ý nghĩa XUÔI — theo từng lĩnh vực
  meaning_upright_general  TEXT,
  meaning_upright_love     TEXT,
  meaning_upright_career   TEXT,
  meaning_upright_finance  TEXT,
  meaning_upright_health   TEXT,
  meaning_upright_feelings TEXT,
  meaning_upright_actions  TEXT,
  meaning_upright_spiritual TEXT,
  meaning_upright_family   TEXT,

  -- Ý nghĩa NGƯỢC — theo từng lĩnh vực
  meaning_reversed_general  TEXT,
  meaning_reversed_love     TEXT,
  meaning_reversed_career   TEXT,
  meaning_reversed_finance  TEXT,
  meaning_reversed_health   TEXT,
  meaning_reversed_feelings TEXT,
  meaning_reversed_actions  TEXT,
  meaning_reversed_spiritual TEXT,
  meaning_reversed_family   TEXT,

  -- Metadata
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng `card_translations` (tuỳ chọn — nếu cần đa ngôn ngữ cho nội dung dài)

```sql
CREATE TABLE card_translations (
  id        SERIAL PRIMARY KEY,
  card_id   INTEGER REFERENCES tarot_cards(id) ON DELETE CASCADE,
  language  TEXT NOT NULL,  -- 'vi' | 'zh' | 'en'
  field     TEXT NOT NULL,  -- 'meaning_upright_love', 'description', ...
  content   TEXT NOT NULL,
  UNIQUE(card_id, language, field)
);
```

---

## 3. Nguồn Dữ Liệu Sẵn Có

File `C:\Users\ADMIN\Downloads\labyrinthos_parsed_features.jsonl` đang mở trong editor **đã có sẵn toàn bộ dữ liệu** cho 78 lá bài với format:

```json
{
  "card_id": "the-fool-meaning-major-arcana-tarot-card-meanings",
  "card_name": "The Fool Meaning",
  "keywords_upright": "beginnings, freedom, innocence...",
  "keywords_reversed": "reckless, careless...",
  "description": "The Fool depicts a youth...",
  "meaning_upright_general": "...(500-800 từ)...",
  "meaning_upright_love": "...",
  "meaning_upright_career": "...",
  "meaning_upright_finances": "...",
  "meaning_upright_feelings": "...",
  "meaning_upright_actions": "...",
  "meaning_reversed_general": "...",
  "meaning_reversed_love": "...",
  ...
}
```

**Ánh xạ field từ JSONL → Database:**

| JSONL field | DB column |
|---|---|
| `keywords_upright` | `keywords_upright` |
| `keywords_reversed` | `keywords_reversed` |
| `description` | `description` |
| `meaning_upright_general` | `meaning_upright_general` |
| `meaning_upright_love` | `meaning_upright_love` |
| `meaning_upright_career` | `meaning_upright_career` |
| `meaning_upright_finances` | `meaning_upright_finance` |
| `meaning_upright_feelings` | `meaning_upright_feelings` |
| `meaning_upright_actions` | `meaning_upright_actions` |
| `meaning_reversed_*` | `meaning_reversed_*` |

---

## 4. Triển Khai — Từng Bước

### Bước 1: Tạo Project Supabase

1. Truy cập [supabase.com](https://supabase.com) → **New Project**
2. Đặt tên: `fate-of-yours` · Chọn region gần nhất (Singapore)
3. Lưu lại: **Project URL** và **anon public key**

### Bước 2: Chạy Schema SQL

Vào **SQL Editor** trong Supabase dashboard, paste và chạy toàn bộ câu lệnh CREATE TABLE ở mục 2.

```sql
-- Thêm index để query nhanh hơn
CREATE INDEX idx_tarot_suit ON tarot_cards(suit);
CREATE INDEX idx_tarot_card_key ON tarot_cards(card_key);

-- Trigger tự cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tarot_cards_updated_at
  BEFORE UPDATE ON tarot_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Bước 3: Import Dữ Liệu Từ JSONL

Tạo script `scripts/import-tarot.mjs` tại root dự án:

```javascript
// scripts/import-tarot.mjs
// Chạy: node scripts/import-tarot.mjs

import { createClient } from '@supabase/supabase-js';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY'; // Dùng service key, KHÔNG phải anon key
const JSONL_PATH = 'C:/Users/ADMIN/Downloads/labyrinthos_parsed_features.jsonl';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map card_key → thông tin từ tarot-data.ts hiện tại
const CARD_MAP = {
  'the-fool-meaning-major-arcana-tarot-card-meanings': {
    card_key: 'the-fool', name_en: 'The Fool', name_vi: 'Kẻ Khờ', name_zh: '愚者',
    suit: 'major', position_number: 0, symbol: '◌', meaning_short: 'New beginnings & pure potential'
  },
  'the-magician-meaning-major-arcana-tarot-card-meanings': {
    card_key: 'the-magician', name_en: 'The Magician', name_vi: 'Nhà Ảo Thuật', name_zh: '魔术师',
    suit: 'major', position_number: 1, symbol: '✦', meaning_short: 'Willpower, skill & manifestation'
  },
  // ... thêm mapping cho 78 lá
};

async function importCards() {
  const rl = createInterface({ input: createReadStream(JSONL_PATH) });
  const rows = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    const data = JSON.parse(line);
    const meta = CARD_MAP[data.card_id];
    if (!meta) { console.warn('Unmapped:', data.card_id); continue; }

    rows.push({
      ...meta,
      keywords_upright:  data.keywords_upright  || null,
      keywords_reversed: data.keywords_reversed || null,
      description:       data.description       || null,
      meaning_upright_general:  data.meaning_upright_general  || null,
      meaning_upright_love:     data.meaning_upright_love     || null,
      meaning_upright_career:   data.meaning_upright_career   || null,
      meaning_upright_finance:  data.meaning_upright_finances || null,
      meaning_upright_feelings: data.meaning_upright_feelings || null,
      meaning_upright_actions:  data.meaning_upright_actions  || null,
      meaning_reversed_general:  data.meaning_reversed_general  || null,
      meaning_reversed_love:     data.meaning_reversed_love     || null,
      meaning_reversed_career:   data.meaning_reversed_career   || null,
      meaning_reversed_finance:  data.meaning_reversed_finances || null,
      meaning_reversed_feelings: data.meaning_reversed_feelings || null,
      meaning_reversed_actions:  data.meaning_reversed_actions  || null,
    });
  }

  console.log(`Importing ${rows.length} cards...`);
  const { error } = await supabase.from('tarot_cards').upsert(rows, { onConflict: 'card_key' });
  if (error) console.error('Error:', error);
  else console.log('Done!');
}

importCards();
```

### Bước 4: Cài Supabase SDK vào Dự Án

```bash
npm install @supabase/supabase-js
```

Tạo `src/lib/supabase.ts`:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Kiểu dữ liệu TypeScript
export interface TarotCardDB {
  id: number;
  card_key: string;
  name_en: string;
  name_vi: string | null;
  name_zh: string | null;
  suit: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
  position_number: number | null;
  symbol: string | null;
  meaning_short: string;
  keywords_upright: string | null;
  keywords_reversed: string | null;
  description: string | null;
  meaning_upright_general: string | null;
  meaning_upright_love: string | null;
  meaning_upright_career: string | null;
  meaning_upright_finance: string | null;
  meaning_upright_feelings: string | null;
  meaning_upright_actions: string | null;
  meaning_reversed_general: string | null;
  meaning_reversed_love: string | null;
  meaning_reversed_career: string | null;
  meaning_reversed_finance: string | null;
  meaning_reversed_feelings: string | null;
  meaning_reversed_actions: string | null;
}

// Hàm query lấy ý nghĩa theo category
export async function getCardMeaning(
  cardKey: string,
  category: string,
  isReversed: boolean = false
): Promise<string | null> {
  const direction = isReversed ? 'reversed' : 'upright';
  const field = `meaning_${direction}_${category}` as keyof TarotCardDB;

  const { data, error } = await supabase
    .from('tarot_cards')
    .select(`meaning_short, ${field}`)
    .eq('card_key', cardKey)
    .single();

  if (error || !data) return null;
  return (data[field] as string) || data.meaning_short;
}

// Lấy toàn bộ 78 lá (cho deck page)
export async function getAllCards(): Promise<TarotCardDB[]> {
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('id, card_key, name_en, name_vi, name_zh, suit, symbol, meaning_short')
    .order('suit')
    .order('position_number');

  if (error) throw error;
  return data || [];
}

// Lấy chi tiết 1 lá (cho AI reading)
export async function getCardDetails(cardKey: string): Promise<TarotCardDB | null> {
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('*')
    .eq('card_key', cardKey)
    .single();

  if (error) return null;
  return data;
}
```

### Bước 5: Thêm biến môi trường

Thêm vào file `.env` tại root dự án:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_anon_key...
```

### Bước 6: Tích hợp vào `ai.ts`

Nâng cấp `getTarotReading()` để lấy ý nghĩa chi tiết từ DB:

```typescript
// src/lib/ai.ts — đoạn bổ sung
import { getCardDetails } from './supabase';

async function buildRichCardContext(
  cards: TarotCard[],
  category: string
): Promise<string> {
  const positions = ['PAST', 'PRESENT', 'FUTURE'];
  const details = await Promise.all(
    cards.map(c => getCardDetails(c.name.toLowerCase().replace(/\s+/g, '-')))
  );

  return details.map((detail, i) => {
    const card = cards[i];
    const catField = `meaning_upright_${category}` as keyof typeof detail;
    const catMeaning = detail?.[catField] || detail?.meaning_upright_general || card.meaning;

    return `[${positions[i]}] ${card.name}
  Short meaning: ${card.meaning}
  In context of ${category}: ${catMeaning?.slice(0, 300)}...
  Keywords: ${detail?.keywords_upright || ''}`;
  }).join('\n\n');
}
```

---

## 5. Quản Lý Database Dễ Dàng

### 5.1 — Supabase Table Editor (Giao diện trực quan)

Supabase cung cấp **Table Editor** tại `app.supabase.com → Table Editor`:
- Xem toàn bộ 78 lá bài dạng bảng
- Click vào ô bất kỳ → sửa trực tiếp như Google Sheets
- Lọc theo `suit`, search theo `name_en`
- Export CSV, Import CSV

> **Dùng hằng ngày cho:** sửa typo, thêm ý nghĩa tiếng Việt, cập nhật nội dung

### 5.2 — Admin CMS Tích Hợp Trong App (Phần 5.1 trong ADMIN_DASHBOARD_FEATURES.md)

Tạo `src/app/pages/admin/CardEditor.tsx`:

```typescript
// Giao diện sửa lá bài ngay trong Admin Dashboard
// Tính năng:
// - Danh sách 78 lá với filter/search
// - Click vào lá bài → form sửa đầy đủ tất cả fields
// - Auto-save khi blur khỏi textarea
// - Preview ý nghĩa sau khi sửa

import { supabase, TarotCardDB } from '../../../lib/supabase';

export function CardEditor() {
  const [cards, setCards] = useState<TarotCardDB[]>([]);
  const [selected, setSelected] = useState<TarotCardDB | null>(null);
  const [saving, setSaving] = useState(false);

  // Load danh sách
  useEffect(() => {
    supabase.from('tarot_cards')
      .select('id, card_key, name_en, suit, meaning_short')
      .order('suit').order('position_number')
      .then(({ data }) => setCards(data || []));
  }, []);

  // Auto-save khi blur
  const handleBlurSave = async (field: keyof TarotCardDB, value: string) => {
    if (!selected) return;
    setSaving(true);
    await supabase.from('tarot_cards')
      .update({ [field]: value })
      .eq('id', selected.id);
    setSaving(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
      {/* Sidebar: danh sách lá bài */}
      <div>
        {cards.map(card => (
          <div key={card.id} onClick={() => setSelected(card as TarotCardDB)}>
            {card.name_en} · <span>{card.suit}</span>
          </div>
        ))}
      </div>

      {/* Main: form sửa */}
      {selected && (
        <div>
          <h2>{selected.name_en}</h2>
          {saving && <span>Saving...</span>}
          {[
            'meaning_upright_general', 'meaning_upright_love',
            'meaning_upright_career', 'meaning_upright_finance',
            'meaning_reversed_general', 'meaning_reversed_love',
          ].map(field => (
            <div key={field}>
              <label>{field}</label>
              <textarea
                defaultValue={selected[field as keyof TarotCardDB] as string || ''}
                onBlur={e => handleBlurSave(field as keyof TarotCardDB, e.target.value)}
                rows={6}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 5.3 — Row Level Security (Bảo mật)

Chạy trong Supabase SQL Editor để bảo vệ data:

```sql
-- Cho phép tất cả đọc (public read)
ALTER TABLE tarot_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tarot cards"
  ON tarot_cards FOR SELECT
  USING (true);

-- Chỉ admin được sửa (cần auth.uid() kiểm tra)
CREATE POLICY "Admin can update tarot cards"
  ON tarot_cards FOR UPDATE
  USING (auth.email() = 'admin@fate-of-yours.com');
```

---

## 6. Lộ Trình Triển Khai

```
Ngày 1 — Setup hạ tầng
├── [ ] Tạo Supabase project
├── [ ] Chạy schema SQL
└── [ ] Test kết nối từ app

Ngày 2 — Import dữ liệu
├── [ ] Hoàn thiện CARD_MAP trong import script (78 entries)
├── [ ] Chạy node scripts/import-tarot.mjs
└── [ ] Verify 78 rows trong Table Editor

Ngày 3 — Tích hợp vào app
├── [ ] Thêm VITE_SUPABASE_* vào .env
├── [ ] Cập nhật getTarotReading() dùng DB meanings
└── [ ] Test reading với dữ liệu chi tiết

Ngày 4 — Admin CMS
├── [ ] Xây dựng CardEditor component
└── [ ] Thêm vào Admin Dashboard
```

---

## Lưu Ý

> **Service Key vs Anon Key:** Script import dùng `SERVICE_ROLE_KEY` (bypass RLS). App client dùng `ANON_KEY`. Không bao giờ để SERVICE_ROLE_KEY trong frontend.

> **File JSONL hiện tại** tại `C:\Users\ADMIN\Downloads\labyrinthos_parsed_features.jsonl` đã có đủ 78+ lá bài với đầy đủ ý nghĩa chi tiết — đây là nguồn dữ liệu chính để import.

> **Offline fallback:** Giữ nguyên `tarot-data.ts` làm fallback khi không có kết nối Supabase. Merge logic: ưu tiên DB → fallback về `tarot-data.ts`.
