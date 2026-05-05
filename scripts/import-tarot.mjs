// scripts/import-tarot.mjs
// Import 78 tarot cards from labyrinthos JSONL into Supabase
// Usage: node scripts/import-tarot.mjs
// Requires .env: SUPABASE_URL, SUPABASE_SERVICE_KEY

import { createClient } from '@supabase/supabase-js';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const JSONL_PATH = process.env.JSONL_PATH || path.join(__dirname, 'data', 'labyrinthos_parsed_features.jsonl');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Maps card_key → static metadata from tarot-data.ts
const CARD_METADATA = {
  // Major Arcana
  'the-fool':           { card_key:'the-fool',           name_en:'The Fool',           name_vi:'Kẻ Khờ',         name_zh:'愚者',    suit:'major', position_number:0,  symbol:'◌', meaning_short:'New beginnings & pure potential' },
  'the-magician':       { card_key:'the-magician',       name_en:'The Magician',       name_vi:'Nhà Ảo Thuật',    name_zh:'魔术师',  suit:'major', position_number:1,  symbol:'✦', meaning_short:'Willpower, skill & manifestation' },
  'the-high-priestess': { card_key:'the-high-priestess', name_en:'The High Priestess', name_vi:'Nữ Tư Tế',        name_zh:'女祭司',  suit:'major', position_number:2,  symbol:'☽', meaning_short:'Intuition, mystery & the subconscious' },
  'the-empress':        { card_key:'the-empress',        name_en:'The Empress',        name_vi:'Nữ Hoàng',        name_zh:'女皇',    suit:'major', position_number:3,  symbol:'❋', meaning_short:'Fertility, abundance & nurturing energy' },
  'the-emperor':        { card_key:'the-emperor',        name_en:'The Emperor',        name_vi:'Hoàng Đế',        name_zh:'皇帝',    suit:'major', position_number:4,  symbol:'◈', meaning_short:'Authority, structure & leadership' },
  'the-hierophant':     { card_key:'the-hierophant',     name_en:'The Hierophant',     name_vi:'Giáo Hoàng',      name_zh:'教皇',    suit:'major', position_number:5,  symbol:'✝', meaning_short:'Tradition, spiritual guidance & wisdom' },
  'the-lovers':         { card_key:'the-lovers',         name_en:'The Lovers',         name_vi:'Đôi Tình Nhân',   name_zh:'恋人',    suit:'major', position_number:6,  symbol:'♡', meaning_short:'Union, choice & alignment of values' },
  'the-chariot':        { card_key:'the-chariot',        name_en:'The Chariot',        name_vi:'Chiến Xa',        name_zh:'战车',    suit:'major', position_number:7,  symbol:'◇', meaning_short:'Determination, victory & willful control' },
  'strength':           { card_key:'strength',           name_en:'Strength',           name_vi:'Sức Mạnh',        name_zh:'力量',    suit:'major', position_number:8,  symbol:'♾', meaning_short:'Courage, patience & inner fortitude' },
  'the-hermit':         { card_key:'the-hermit',         name_en:'The Hermit',         name_vi:'Ẩn Sĩ',          name_zh:'隐者',    suit:'major', position_number:9,  symbol:'✵', meaning_short:'Solitude, introspection & inner guidance' },
  'the-wheel-of-fortune':{ card_key:'the-wheel-of-fortune', name_en:'Wheel of Fortune', name_vi:'Bánh Xe Vận Mệnh', name_zh:'命运之轮', suit:'major', position_number:10, symbol:'⊛', meaning_short:'Fate, cycles & turning points in life' },
  'justice':            { card_key:'justice',            name_en:'Justice',            name_vi:'Công Lý',         name_zh:'正义',    suit:'major', position_number:11, symbol:'⚖', meaning_short:'Truth, fairness & karmic cause and effect' },
  'the-hanged-man':     { card_key:'the-hanged-man',     name_en:'The Hanged Man',     name_vi:'Kẻ Bị Treo',      name_zh:'倒吊人',  suit:'major', position_number:12, symbol:'⊘', meaning_short:'Surrender, sacrifice & new perspectives' },
  'death':              { card_key:'death',              name_en:'Death',              name_vi:'Cái Chết',        name_zh:'死神',    suit:'major', position_number:13, symbol:'⊗', meaning_short:'Transformation, endings & profound transition' },
  'temperance':         { card_key:'temperance',         name_en:'Temperance',         name_vi:'Điều Độ',         name_zh:'节制',    suit:'major', position_number:14, symbol:'≋', meaning_short:'Balance, moderation & divine patience' },
  'the-devil':          { card_key:'the-devil',          name_en:'The Devil',          name_vi:'Ác Quỷ',          name_zh:'恶魔',    suit:'major', position_number:15, symbol:'⊖', meaning_short:'Bondage, materialism & the shadow self' },
  'the-tower':          { card_key:'the-tower',          name_en:'The Tower',          name_vi:'Tháp Sụp Đổ',    name_zh:'高塔',    suit:'major', position_number:16, symbol:'⚡', meaning_short:'Sudden upheaval, revelation & change' },
  'the-star':           { card_key:'the-star',           name_en:'The Star',           name_vi:'Ngôi Sao',        name_zh:'星星',    suit:'major', position_number:17, symbol:'✧', meaning_short:'Hope, faith & spiritual inspiration' },
  'the-moon':           { card_key:'the-moon',           name_en:'The Moon',           name_vi:'Mặt Trăng',       name_zh:'月亮',    suit:'major', position_number:18, symbol:'◯', meaning_short:'Illusion, fear & the unconscious mind' },
  'the-sun':            { card_key:'the-sun',            name_en:'The Sun',            name_vi:'Mặt Trời',        name_zh:'太阳',    suit:'major', position_number:19, symbol:'☀', meaning_short:'Joy, clarity, success & vital energy' },
  'judgement':          { card_key:'judgement',          name_en:'Judgement',          name_vi:'Sự Phán Xét',     name_zh:'审判',    suit:'major', position_number:20, symbol:'⊙', meaning_short:'Reflection, reckoning & spiritual awakening' },
  'the-world':          { card_key:'the-world',          name_en:'The World',          name_vi:'Thế Giới',        name_zh:'世界',    suit:'major', position_number:21, symbol:'◎', meaning_short:'Completion, integration & fulfilment' },
  // Wands
  'ace-of-wands':    { card_key:'ace-of-wands',    name_en:'Ace of Wands',    suit:'wands', position_number:1,  symbol:'✤', meaning_short:'New creative spark & inspiration' },
  'two-of-wands':    { card_key:'two-of-wands',    name_en:'Two of Wands',    suit:'wands', position_number:2,  symbol:'✤', meaning_short:'Bold decisions & future planning' },
  'three-of-wands':  { card_key:'three-of-wands',  name_en:'Three of Wands',  suit:'wands', position_number:3,  symbol:'✤', meaning_short:'Initial success & expansion' },
  'four-of-wands':   { card_key:'four-of-wands',   name_en:'Four of Wands',   suit:'wands', position_number:4,  symbol:'✤', meaning_short:'Celebration, stability & community' },
  'five-of-wands':   { card_key:'five-of-wands',   name_en:'Five of Wands',   suit:'wands', position_number:5,  symbol:'✤', meaning_short:'Conflict, competition & striving' },
  'six-of-wands':    { card_key:'six-of-wands',    name_en:'Six of Wands',    suit:'wands', position_number:6,  symbol:'✤', meaning_short:'Victory & public recognition' },
  'seven-of-wands':  { card_key:'seven-of-wands',  name_en:'Seven of Wands',  suit:'wands', position_number:7,  symbol:'✤', meaning_short:'Perseverance & standing your ground' },
  'eight-of-wands':  { card_key:'eight-of-wands',  name_en:'Eight of Wands',  suit:'wands', position_number:8,  symbol:'✤', meaning_short:'Rapid movement & swift change' },
  'nine-of-wands':   { card_key:'nine-of-wands',   name_en:'Nine of Wands',   suit:'wands', position_number:9,  symbol:'✤', meaning_short:'Discipline & final stand' },
  'ten-of-wands':    { card_key:'ten-of-wands',    name_en:'Ten of Wands',    suit:'wands', position_number:10, symbol:'✤', meaning_short:'Burdens, responsibility & completion' },
  'page-of-wands':   { card_key:'page-of-wands',   name_en:'Page of Wands',   suit:'wands', position_number:11, symbol:'✤', meaning_short:'Enthusiasm & new creative pursuits' },
  'knight-of-wands': { card_key:'knight-of-wands', name_en:'Knight of Wands', suit:'wands', position_number:12, symbol:'✤', meaning_short:'Adventure, passion & bold action' },
  'queen-of-wands':  { card_key:'queen-of-wands',  name_en:'Queen of Wands',  suit:'wands', position_number:13, symbol:'✤', meaning_short:'Creative vision & strong conviction' },
  'king-of-wands':   { card_key:'king-of-wands',   name_en:'King of Wands',   suit:'wands', position_number:14, symbol:'✤', meaning_short:'Leadership, experience & honour' },
  // Cups
  'ace-of-cups':    { card_key:'ace-of-cups',    name_en:'Ace of Cups',    suit:'cups', position_number:1,  symbol:'◉', meaning_short:'New emotional beginning & heartfelt love' },
  'two-of-cups':    { card_key:'two-of-cups',    name_en:'Two of Cups',    suit:'cups', position_number:2,  symbol:'◉', meaning_short:'Partnership & mutual attraction' },
  'three-of-cups':  { card_key:'three-of-cups',  name_en:'Three of Cups',  suit:'cups', position_number:3,  symbol:'◉', meaning_short:'Friendship, joy & community bonds' },
  'four-of-cups':   { card_key:'four-of-cups',   name_en:'Four of Cups',   suit:'cups', position_number:4,  symbol:'◉', meaning_short:'Contemplation & quiet dissatisfaction' },
  'five-of-cups':   { card_key:'five-of-cups',   name_en:'Five of Cups',   suit:'cups', position_number:5,  symbol:'◉', meaning_short:'Loss, grief & letting go' },
  'six-of-cups':    { card_key:'six-of-cups',    name_en:'Six of Cups',    suit:'cups', position_number:6,  symbol:'◉', meaning_short:'Nostalgia, reunion & childhood memories' },
  'seven-of-cups':  { card_key:'seven-of-cups',  name_en:'Seven of Cups',  suit:'cups', position_number:7,  symbol:'◉', meaning_short:'Wishful thinking, illusion & dreaming' },
  'eight-of-cups':  { card_key:'eight-of-cups',  name_en:'Eight of Cups',  suit:'cups', position_number:8,  symbol:'◉', meaning_short:'Walking away, clarity & moving on' },
  'nine-of-cups':   { card_key:'nine-of-cups',   name_en:'Nine of Cups',   suit:'cups', position_number:9,  symbol:'◉', meaning_short:'Contentment & deep satisfaction' },
  'ten-of-cups':    { card_key:'ten-of-cups',    name_en:'Ten of Cups',    suit:'cups', position_number:10, symbol:'◉', meaning_short:'Emotional fulfilment & blissful union' },
  'page-of-cups':   { card_key:'page-of-cups',   name_en:'Page of Cups',   suit:'cups', position_number:11, symbol:'◉', meaning_short:'Dreamy idealism & emotional vision' },
  'knight-of-cups': { card_key:'knight-of-cups', name_en:'Knight of Cups', suit:'cups', position_number:12, symbol:'◉', meaning_short:'Romance, charm & tender imagination' },
  'queen-of-cups':  { card_key:'queen-of-cups',  name_en:'Queen of Cups',  suit:'cups', position_number:13, symbol:'◉', meaning_short:'Psychic depth, nurturing & compassion' },
  'king-of-cups':   { card_key:'king-of-cups',   name_en:'King of Cups',   suit:'cups', position_number:14, symbol:'◉', meaning_short:'Emotional maturity & flowing compassion' },
  // Swords
  'ace-of-swords':    { card_key:'ace-of-swords',    name_en:'Ace of Swords',    suit:'swords', position_number:1,  symbol:'✕', meaning_short:'Breakthrough clarity & decisive truth' },
  'two-of-swords':    { card_key:'two-of-swords',    name_en:'Two of Swords',    suit:'swords', position_number:2,  symbol:'✕', meaning_short:'Stalemate, tension & difficult choices' },
  'three-of-swords':  { card_key:'three-of-swords',  name_en:'Three of Swords',  suit:'swords', position_number:3,  symbol:'✕', meaning_short:'Heartbreak, grief & sorrow' },
  'four-of-swords':   { card_key:'four-of-swords',   name_en:'Four of Swords',   suit:'swords', position_number:4,  symbol:'✕', meaning_short:'Rest, recovery & peaceful retreat' },
  'five-of-swords':   { card_key:'five-of-swords',   name_en:'Five of Swords',   suit:'swords', position_number:5,  symbol:'✕', meaning_short:'Defeat, humiliation & regret' },
  'six-of-swords':    { card_key:'six-of-swords',    name_en:'Six of Swords',    suit:'swords', position_number:6,  symbol:'✕', meaning_short:'Transition, moving forward & release' },
  'seven-of-swords':  { card_key:'seven-of-swords',  name_en:'Seven of Swords',  suit:'swords', position_number:7,  symbol:'✕', meaning_short:'Deception, stealth & careful strategy' },
  'eight-of-swords':  { card_key:'eight-of-swords',  name_en:'Eight of Swords',  suit:'swords', position_number:8,  symbol:'✕', meaning_short:'Restriction, isolation & confusion' },
  'nine-of-swords':   { card_key:'nine-of-swords',   name_en:'Nine of Swords',   suit:'swords', position_number:9,  symbol:'✕', meaning_short:'Anxiety, self-doubt & fear' },
  'ten-of-swords':    { card_key:'ten-of-swords',    name_en:'Ten of Swords',    suit:'swords', position_number:10, symbol:'✕', meaning_short:'Painful endings & devastating loss' },
  'page-of-swords':   { card_key:'page-of-swords',   name_en:'Page of Swords',   suit:'swords', position_number:11, symbol:'✕', meaning_short:'Quick thinking, curiosity & communication' },
  'knight-of-swords': { card_key:'knight-of-swords', name_en:'Knight of Swords', suit:'swords', position_number:12, symbol:'✕', meaning_short:'Ambition, sharpness & conflict' },
  'queen-of-swords':  { card_key:'queen-of-swords',  name_en:'Queen of Swords',  suit:'swords', position_number:13, symbol:'✕', meaning_short:'Independence, perception & complexity' },
  'king-of-swords':   { card_key:'king-of-swords',   name_en:'King of Swords',   suit:'swords', position_number:14, symbol:'✕', meaning_short:'Clarity, authority & decisive leadership' },
  // Pentacles
  'ace-of-pentacles':    { card_key:'ace-of-pentacles',    name_en:'Ace of Pentacles',    suit:'pentacles', position_number:1,  symbol:'✡', meaning_short:'New financial opportunity & manifestation' },
  'two-of-pentacles':    { card_key:'two-of-pentacles',    name_en:'Two of Pentacles',    suit:'pentacles', position_number:2,  symbol:'✡', meaning_short:'Balance, juggling priorities & adaptability' },
  'three-of-pentacles':  { card_key:'three-of-pentacles',  name_en:'Three of Pentacles',  suit:'pentacles', position_number:3,  symbol:'✡', meaning_short:'Skill, teamwork & earned reward' },
  'four-of-pentacles':   { card_key:'four-of-pentacles',   name_en:'Four of Pentacles',   suit:'pentacles', position_number:4,  symbol:'✡', meaning_short:'Security, possession & material caution' },
  'five-of-pentacles':   { card_key:'five-of-pentacles',   name_en:'Five of Pentacles',   suit:'pentacles', position_number:5,  symbol:'✡', meaning_short:'Poverty, charity & spiritual poverty' },
  'six-of-pentacles':    { card_key:'six-of-pentacles',    name_en:'Six of Pentacles',    suit:'pentacles', position_number:6,  symbol:'✡', meaning_short:'Generosity & balanced giving' },
  'seven-of-pentacles':  { card_key:'seven-of-pentacles',  name_en:'Seven of Pentacles',  suit:'pentacles', position_number:7,  symbol:'✡', meaning_short:'Patience, diligence & delayed reward' },
  'eight-of-pentacles':  { card_key:'eight-of-pentacles',  name_en:'Eight of Pentacles',  suit:'pentacles', position_number:8,  symbol:'✡', meaning_short:'Reassessment, reflection & steady growth' },
  'nine-of-pentacles':   { card_key:'nine-of-pentacles',   name_en:'Nine of Pentacles',   suit:'pentacles', position_number:9,  symbol:'✡', meaning_short:'Independence & self-sufficiency' },
  'ten-of-pentacles':    { card_key:'ten-of-pentacles',    name_en:'Ten of Pentacles',    suit:'pentacles', position_number:10, symbol:'✡', meaning_short:'Wealth, legacy & financial abundance' },
  'page-of-pentacles':   { card_key:'page-of-pentacles',   name_en:'Page of Pentacles',   suit:'pentacles', position_number:11, symbol:'✡', meaning_short:'Diligence, reliability & building foundations' },
  'knight-of-pentacles': { card_key:'knight-of-pentacles', name_en:'Knight of Pentacles', suit:'pentacles', position_number:12, symbol:'✡', meaning_short:'Tradition, conservatism & dependability' },
  'queen-of-pentacles':  { card_key:'queen-of-pentacles',  name_en:'Queen of Pentacles',  suit:'pentacles', position_number:13, symbol:'✡', meaning_short:'Abundance, fertility & practical wisdom' },
  'king-of-pentacles':   { card_key:'king-of-pentacles',   name_en:'King of Pentacles',   suit:'pentacles', position_number:14, symbol:'✡', meaning_short:'Wealth, stability & worldly achievement' },
};

function extractCardKey(cardId) {
  return cardId
    // Long URL-style IDs
    .replace(/-meaning-major-arcana-tarot-card-meanings$/, '')
    .replace(/-meaning-minor-arcana-tarot-card-meanings$/, '')
    .replace(/-tarot-card-meanings$/, '')
    // Short-style IDs (e.g. "ace-of-wands-meaning")
    .replace(/-meaning$/, '')
    .trim();
}

async function importCards() {
  console.log('📖 Reading JSONL file:', JSONL_PATH);
  const rl = createInterface({ input: createReadStream(JSONL_PATH) });
  const rows = [];
  let skipped = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    let data;
    try { data = JSON.parse(line); } catch { continue; }

    const cardKey = extractCardKey(data.card_id);
    const meta = CARD_METADATA[cardKey];
    if (!meta) { console.warn(`⚠️  No mapping: "${cardKey}"`); skipped++; continue; }

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

  console.log(`✅ Parsed ${rows.length} cards (skipped: ${skipped})`);
  if (rows.length === 0) { console.error('❌ No rows to import.'); process.exit(1); }

  console.log('⬆️  Uploading to Supabase...');
  const { data: result, error } = await supabase
    .from('tarot_cards')
    .upsert(rows, { onConflict: 'card_key' })
    .select('id, card_key, name_en');

  if (error) { console.error('❌ Error:', error.message, error.details); process.exit(1); }
  console.log(`\n🎉 Imported ${result?.length ?? rows.length} cards!`);
  result?.slice(0, 5).forEach(r => console.log(`  ✓ [${r.id}] ${r.name_en}`));
}

importCards().catch(err => { console.error(err); process.exit(1); });
