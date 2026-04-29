export interface TarotCard {
  id: number;
  name: string;
  suit: "major" | "wands" | "cups" | "swords" | "pentacles";
  symbol: string;
  meaning: string;
}

const majorArcana: TarotCard[] = [
  { id: 0, name: "The Fool", suit: "major", symbol: "◌", meaning: "New beginnings & pure potential" },
  { id: 1, name: "The Magician", suit: "major", symbol: "✦", meaning: "Willpower, skill & manifestation" },
  { id: 2, name: "The High Priestess", suit: "major", symbol: "☽", meaning: "Intuition, mystery & the subconscious" },
  { id: 3, name: "The Empress", suit: "major", symbol: "❋", meaning: "Fertility, abundance & nurturing energy" },
  { id: 4, name: "The Emperor", suit: "major", symbol: "◈", meaning: "Authority, structure & leadership" },
  { id: 5, name: "The Hierophant", suit: "major", symbol: "✝", meaning: "Tradition, spiritual guidance & wisdom" },
  { id: 6, name: "The Lovers", suit: "major", symbol: "♡", meaning: "Union, choice & alignment of values" },
  { id: 7, name: "The Chariot", suit: "major", symbol: "◇", meaning: "Determination, victory & willful control" },
  { id: 8, name: "Strength", suit: "major", symbol: "♾", meaning: "Courage, patience & inner fortitude" },
  { id: 9, name: "The Hermit", suit: "major", symbol: "✵", meaning: "Solitude, introspection & inner guidance" },
  { id: 10, name: "Wheel of Fortune", suit: "major", symbol: "⊛", meaning: "Fate, cycles & turning points in life" },
  { id: 11, name: "Justice", suit: "major", symbol: "⚖", meaning: "Truth, fairness & karmic cause and effect" },
  { id: 12, name: "The Hanged Man", suit: "major", symbol: "⊘", meaning: "Surrender, sacrifice & new perspectives" },
  { id: 13, name: "Death", suit: "major", symbol: "⊗", meaning: "Transformation, endings & profound transition" },
  { id: 14, name: "Temperance", suit: "major", symbol: "≋", meaning: "Balance, moderation & divine patience" },
  { id: 15, name: "The Devil", suit: "major", symbol: "⊖", meaning: "Bondage, materialism & the shadow self" },
  { id: 16, name: "The Tower", suit: "major", symbol: "⚡", meaning: "Sudden upheaval, revelation & change" },
  { id: 17, name: "The Star", suit: "major", symbol: "✧", meaning: "Hope, faith & spiritual inspiration" },
  { id: 18, name: "The Moon", suit: "major", symbol: "◯", meaning: "Illusion, fear & the unconscious mind" },
  { id: 19, name: "The Sun", suit: "major", symbol: "☀", meaning: "Joy, clarity, success & vital energy" },
  { id: 20, name: "Judgement", suit: "major", symbol: "⊙", meaning: "Reflection, reckoning & spiritual awakening" },
  { id: 21, name: "The World", suit: "major", symbol: "◎", meaning: "Completion, integration & fulfilment" },
];

function createSuit(
  suit: "wands" | "cups" | "swords" | "pentacles",
  symbol: string,
  startId: number,
  meanings: string[]
): TarotCard[] {
  const labels = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
  return labels.map((label, i) => ({
    id: startId + i,
    name: `${label} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
    suit,
    symbol,
    meaning: meanings[i],
  }));
}

const wands = createSuit("wands", "✤", 22, [
  "New creative spark & inspiration", "Bold decisions & future planning", "Initial success & expansion",
  "Celebration, stability & community", "Conflict, competition & striving", "Victory & public recognition",
  "Perseverance & standing your ground", "Rapid movement & swift change", "Discipline & final stand",
  "Burdens, responsibility & completion", "Enthusiasm & new creative pursuits", "Adventure, passion & bold action",
  "Creative vision & strong conviction", "Leadership, experience & honour",
]);

const cups = createSuit("cups", "◉", 36, [
  "New emotional beginning & heartfelt love", "Partnership & mutual attraction", "Friendship, joy & community bonds",
  "Contemplation & quiet dissatisfaction", "Loss, grief & letting go", "Nostalgia, reunion & childhood memories",
  "Wishful thinking, illusion & dreaming", "Walking away, clarity & moving on", "Contentment & deep satisfaction",
  "Emotional fulfilment & blissful union", "Dreamy idealism & emotional vision", "Romance, charm & tender imagination",
  "Psychic depth, nurturing & compassion", "Emotional maturity & flowing compassion",
]);

const swords = createSuit("swords", "✕", 50, [
  "Breakthrough clarity & decisive truth", "Stalemate, tension & difficult choices", "Heartbreak, grief & sorrow",
  "Rest, recovery & peaceful retreat", "Defeat, humiliation & regret", "Transition, moving forward & release",
  "Deception, stealth & careful strategy", "Restriction, isolation & confusion", "Anxiety, self-doubt & fear",
  "Painful endings & devastating loss", "Quick thinking, curiosity & communication", "Ambition, sharpness & conflict",
  "Independence, perception & complexity", "Clarity, authority & decisive leadership",
]);

const pentacles = createSuit("pentacles", "✡", 64, [
  "New financial opportunity & manifestation", "Balance, juggling priorities & adaptability", "Skill, teamwork & earned reward",
  "Security, possession & material caution", "Poverty, charity & spiritual poverty", "Generosity & balanced giving",
  "Patience, diligence & delayed reward", "Reassessment, reflection & steady growth", "Independence & self-sufficiency",
  "Wealth, legacy & financial abundance", "Diligence, reliability & building foundations", "Tradition, conservatism & dependability",
  "Abundance, fertility & practical wisdom", "Wealth, stability & worldly achievement",
]);

export const TAROT_DECK: TarotCard[] = [
  ...majorArcana,
  ...wands,
  ...cups,
  ...swords,
  ...pentacles,
];

// ─── Bilingual Major Arcana Names ─────────────────────────────────────────────
export const MAJOR_ARCANA_VI: Record<number, string> = {
  0: "Kẻ Khờ", 1: "Nhà Ảo Thuật", 2: "Nữ Tư Tế", 3: "Nữ Hoàng",
  4: "Hoàng Đế", 5: "Giáo Hoàng", 6: "Đôi Tình Nhân", 7: "Chiến Xa",
  8: "Sức Mạnh", 9: "Ẩn Sĩ", 10: "Bánh Xe Vận Mệnh", 11: "Công Lý",
  12: "Kẻ Bị Treo", 13: "Cái Chết", 14: "Điều Độ", 15: "Ác Quỷ",
  16: "Tháp Sụp Đổ", 17: "Ngôi Sao", 18: "Mặt Trăng", 19: "Mặt Trời",
  20: "Sự Phán Xét", 21: "Thế Giới",
};

export const MAJOR_ARCANA_ZH: Record<number, string> = {
  0: "愚者", 1: "魔术师", 2: "女祭司", 3: "女皇",
  4: "皇帝", 5: "教皇", 6: "恋人", 7: "战车",
  8: "力量", 9: "隐者", 10: "命运之轮", 11: "正义",
  12: "倒吊人", 13: "死神", 14: "节制", 15: "恶魔",
  16: "高塔", 17: "星星", 18: "月亮", 19: "太阳",
  20: "审判", 21: "世界",
};

// ─── Bilingual Category Labels ─────────────────────────────────────────────────
export const CATEGORY_VI: Record<string, { label: string; description: string }> = {
  career:     { label: "Sự Nghiệp",  description: "Tham vọng, công việc và mục đích sống" },
  love:       { label: "Tình Yêu",   description: "Tình cảm, lãng mạn và trái tim" },
  friendship: { label: "Tình Bạn",   description: "Niềm tin, cộng đồng và đồng hành" },
  general:    { label: "Tổng Quát",  description: "Hướng dẫn toàn diện và sự rõ ràng" },
  finance:    { label: "Tài Chính",  description: "Tiền bạc, thịnh vượng và an toàn" },
  health:     { label: "Sức Khỏe",   description: "Thể chất, tâm trí và năng lượng sống" },
  spiritual:  { label: "Tâm Linh",   description: "Mục đích, sự thức tỉnh và nội tâm" },
  family:     { label: "Gia Đình",   description: "Gốc rễ, mối quan hệ và di sản" },
};

export const CATEGORY_ZH: Record<string, { label: string; description: string }> = {
  career:     { label: "事业",   description: "抱负、工作与人生目标" },
  love:       { label: "爱情",   description: "关系、浪漫与情感连接" },
  friendship: { label: "友情",   description: "信任、社群与盟友" },
  general:    { label: "综合",   description: "全面指引与人生清晰" },
  finance:    { label: "财务",   description: "金钱、繁荣与安全感" },
  health:     { label: "健康",   description: "身体、心灵与活力" },
  spiritual:  { label: "灵性",   description: "目的、觉醒与内心探索" },
  family:     { label: "家庭",   description: "根源、关系与传承" },
};

// --- Categories ---
export interface Category {
  id: string;
  label: string;
  icon: string;
  description: string;
  accentColor: string;
  questions: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: "career",
    label: "Career",
    icon: "◈",
    description: "Ambitions, work & life purpose",
    accentColor: "#C9A84C",
    questions: [
      "Will I get a promotion?",
      "Should I change careers?",
      "What opportunities lie ahead?",
      "Am I in the right profession?",
    ],
  },
  {
    id: "love",
    label: "Love",
    icon: "♡",
    description: "Romance, bonds & the heart",
    accentColor: "#E27B82",
    questions: [
      "Will I find true love?",
      "How can I improve my relationship?",
      "Is this person right for me?",
      "When will I meet my soulmate?",
    ],
  },
  {
    id: "friendship",
    label: "Friendship",
    icon: "✦",
    description: "Trust, community & allies",
    accentColor: "#7EA8E0",
    questions: [
      "Who are my true allies?",
      "How can I resolve this conflict?",
      "Should I forgive this person?",
      "Am I being a good friend?",
    ],
  },
  {
    id: "general",
    label: "General Guidance",
    icon: "◎",
    description: "Life path & inner wisdom",
    accentColor: "#8B5CF6",
    questions: [
      "What should I focus on now?",
      "What is blocking my progress?",
      "What lesson should I learn?",
      "What does my near future hold?",
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: "✦",
    description: "Wealth, abundance & security",
    accentColor: "#4ECDA4",
    questions: [
      "Will my financial situation improve?",
      "Should I make this investment?",
      "What is blocking my abundance?",
      "How can I attract more prosperity?",
    ],
  },
  {
    id: "health",
    label: "Health",
    icon: "✚",
    description: "Vitality, wellness & healing",
    accentColor: "#E88A5A",
    questions: [
      "What does my energy say about my health?",
      "What do I need to heal within myself?",
      "How can I improve my wellbeing?",
      "What habits serve my highest good?",
    ],
  },
  {
    id: "spiritual",
    label: "Spiritual Growth",
    icon: "☽",
    description: "Soul path, purpose & awakening",
    accentColor: "#C084FC",
    questions: [
      "What is my soul's purpose?",
      "How can I deepen my spiritual practice?",
      "What energies are guiding me now?",
      "What truth am I ready to receive?",
    ],
  },
  {
    id: "family",
    label: "Family",
    icon: "⌂",
    description: "Bonds, roots & belonging",
    accentColor: "#60A5FA",
    questions: [
      "How can I strengthen family bonds?",
      "What healing does my family need?",
      "How do I navigate this family conflict?",
      "What ancestral energy surrounds me?",
    ],
  },
];

// --- AI Interpretation Generator ---
export function generateInterpretation(
  cards: TarotCard[],
  category: string,
  question: string
): string {
  const [past, present, future] = cards;
  const categoryObj = CATEGORIES.find((c) => c.id === category);
  const categoryLabel = categoryObj?.label ?? "life";

  return `## The Three-Card Spread

*A reading on ${categoryLabel.toLowerCase()} · "${question}"*

---

### I. The Past · ${past.name}

In the shadowed realm of what has been, **${past.name}** emerges — bearing the resonance of *${past.meaning.toLowerCase()}*. This energy forms the invisible bedrock beneath your present circumstance.

> "What was lived cannot be unlived — but understood, it becomes your compass rather than your cage."

Look honestly at what this card stirs within you. The roots of **${past.name}** run deep, quietly shaping every choice that follows. Do not dismiss what arose then as irrelevant to now.

**What this placement reveals:**
- The foundational energy you carry into the present
- Patterns and conditioning that may still be active
- The harvest — both gift and burden — of the path walked so far

---

### II. The Present · ${present.name}

**${present.name}** stands at the threshold with you now. Its essence — *${present.meaning.toLowerCase()}* — is the living truth of this moment.

This card does not flatter, nor does it condemn. It simply **is**. Breathe into its symbolism. Allow it to illuminate what you already sense but have not yet dared to fully name.

> "The present is never merely a consequence — it is always also a choice."

**Key energies at play:**
- The primary force surrounding your current situation
- Where your attention and energy are most concentrated
- The invitation ${present.name} is extending to you right now

---

### III. The Future · ${future.name}

Turning toward what may be, **${future.name}** rises on the horizon — carrying the potential of *${future.meaning.toLowerCase()}*.

The future is not a fixed point in the dark. It is a current shaped by every intention and action you carry forward from this moment. ${future.name} reveals a *trajectory*, not a prison.

> "The most powerful force in shaping what comes next is the quality of presence you bring to right now."

---

## The Synthesis

Together, **${past.name}**, **${present.name}**, and **${future.name}** form a living arc — a single narrative woven from three distinct moments of time and energy. The movement from *${past.meaning.toLowerCase()}* through *${present.meaning.toLowerCase()}* toward *${future.meaning.toLowerCase()}* is not accidental. It is the story the cards have recognised in you.

Receive this reading not as destiny, but as a mirror. The ancient wisdom held within these symbols has spoken. **What you do with this knowledge is, and has always been, entirely up to you.**`;
}