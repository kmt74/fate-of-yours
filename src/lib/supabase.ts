/// <reference types="vite/client" />
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ─── Types ────────────────────────────────────────────────────────────────────
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
  meaning_upright_health: string | null;
  meaning_upright_feelings: string | null;
  meaning_upright_actions: string | null;
  meaning_upright_spiritual: string | null;
  meaning_upright_family: string | null;
  meaning_upright_friendship: string | null;
  meaning_reversed_general: string | null;
  meaning_reversed_love: string | null;
  meaning_reversed_career: string | null;
  meaning_reversed_finance: string | null;
  meaning_reversed_health: string | null;
  meaning_reversed_feelings: string | null;
  meaning_reversed_actions: string | null;
  meaning_reversed_spiritual: string | null;
  meaning_reversed_family: string | null;
  meaning_reversed_friendship: string | null;
}

// Category → DB column mapping
const CATEGORY_FIELD_MAP: Record<string, string> = {
  career:     'career',
  love:       'love',
  friendship: 'friendship',
  general:    'general',
  finance:    'finance',
  health:     'health',
  spiritual:  'spiritual',
  family:     'family',
};

// Special-case overrides: card names that don't follow the simple lowercase-hyphen rule
const CARD_NAME_OVERRIDES: Record<string, string> = {
  'wheel of fortune': 'the-wheel-of-fortune',
  'ace of wands':     'ace-of-wands',
  'two of wands':     'two-of-wands',
  'three of wands':   'three-of-wands',
  'four of wands':    'four-of-wands',
  'five of wands':    'five-of-wands',
  'six of wands':     'six-of-wands',
  'seven of wands':   'seven-of-wands',
  'eight of wands':   'eight-of-wands',
  'nine of wands':    'nine-of-wands',
  'ten of wands':     'ten-of-wands',
  'page of wands':    'page-of-wands',
  'knight of wands':  'knight-of-wands',
  'queen of wands':   'queen-of-wands',
  'king of wands':    'king-of-wands',
};

// Convert TarotCard name → card_key (e.g. "The Fool" → "the-fool", "Wheel of Fortune" → "the-wheel-of-fortune")
export function nameToCardKey(name: string): string {
  const lower = name.toLowerCase();
  if (CARD_NAME_OVERRIDES[lower]) return CARD_NAME_OVERRIDES[lower];
  return lower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Fetch single card details from DB ────────────────────────────────────────
export async function getCardDetails(cardKey: string): Promise<TarotCardDB | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('*')
    .eq('card_key', cardKey)
    .single();
  if (error) { console.warn('[Supabase] getCardDetails error:', error.message); return null; }
  return data as TarotCardDB;
}

// ─── Fetch category-specific meaning for a card ───────────────────────────────
export async function getCardCategoryMeaning(
  cardKey: string,
  category: string,
  isReversed = false
): Promise<string | null> {
  if (!supabase) return null;
  const direction = isReversed ? 'reversed' : 'upright';
  const cat = CATEGORY_FIELD_MAP[category] ?? 'general';
  const field = `meaning_${direction}_${cat}`;

  const { data, error } = await supabase
    .from('tarot_cards')
    .select(`meaning_short, ${field}`)
    .eq('card_key', cardKey)
    .single();

  if (error || !data) return null;
  return (data as unknown as Record<string, string | null>)[field] || (data as any).meaning_short;
}

// ─── Fetch details for multiple cards (batch) ─────────────────────────────────
export async function getMultipleCardDetails(
  cardKeys: string[]
): Promise<Record<string, TarotCardDB>> {
  if (!supabase || cardKeys.length === 0) return {};
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('*')
    .in('card_key', cardKeys);
  if (error || !data) return {};
  return Object.fromEntries((data as TarotCardDB[]).map(card => [card.card_key, card]));
}

// ─── Check if Supabase is available ──────────────────────────────────────────
export function isSupabaseReady(): boolean {
  return supabase !== null;
}
