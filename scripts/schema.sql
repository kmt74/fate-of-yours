-- ============================================================
-- Fate of Yours — Tarot Cards Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS tarot_cards (
  -- Identity
  id              SERIAL PRIMARY KEY,
  card_key        TEXT UNIQUE NOT NULL,
  name_en         TEXT NOT NULL,
  name_vi         TEXT,
  name_zh         TEXT,

  -- Classification
  suit            TEXT NOT NULL CHECK (suit IN ('major','wands','cups','swords','pentacles')),
  position_number INTEGER,
  symbol          TEXT,

  -- Short meaning (used in current app)
  meaning_short   TEXT NOT NULL DEFAULT '',

  -- Keywords
  keywords_upright   TEXT,
  keywords_reversed  TEXT,

  -- Card image description
  description     TEXT,

  -- UPRIGHT meanings by category
  meaning_upright_general   TEXT,
  meaning_upright_love      TEXT,
  meaning_upright_career    TEXT,
  meaning_upright_finance   TEXT,
  meaning_upright_health    TEXT,
  meaning_upright_feelings  TEXT,
  meaning_upright_actions   TEXT,
  meaning_upright_spiritual TEXT,
  meaning_upright_family    TEXT,
  meaning_upright_friendship TEXT,

  -- REVERSED meanings by category
  meaning_reversed_general   TEXT,
  meaning_reversed_love      TEXT,
  meaning_reversed_career    TEXT,
  meaning_reversed_finance   TEXT,
  meaning_reversed_health    TEXT,
  meaning_reversed_feelings  TEXT,
  meaning_reversed_actions   TEXT,
  meaning_reversed_spiritual TEXT,
  meaning_reversed_family    TEXT,
  meaning_reversed_friendship TEXT,

  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_tarot_suit     ON tarot_cards(suit);
CREATE INDEX IF NOT EXISTS idx_tarot_card_key ON tarot_cards(card_key);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tarot_cards_updated_at ON tarot_cards;
CREATE TRIGGER tarot_cards_updated_at
  BEFORE UPDATE ON tarot_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE tarot_cards ENABLE ROW LEVEL SECURITY;

-- Public can read all cards
CREATE POLICY IF NOT EXISTS "Public read tarot cards"
  ON tarot_cards FOR SELECT
  USING (true);

-- Only authenticated admin can modify
CREATE POLICY IF NOT EXISTS "Admin can modify tarot cards"
  ON tarot_cards FOR ALL
  USING (auth.email() = 'admin@fate-of-yours.com');
