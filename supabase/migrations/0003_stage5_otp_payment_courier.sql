-- ============================================================
-- Stage 5: OTP, Payment, Courier & Fraud Prevention
-- Run this in Supabase SQL Editor AFTER 0002.
-- ============================================================

-- ── OTP Table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code_hash text NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otps_phone_order ON otps(phone, order_id);
CREATE INDEX IF NOT EXISTS idx_otps_expires ON otps(expires_at);

-- ── Orders: add payment/courier/fraud columns ────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_tran_id text,
  ADD COLUMN IF NOT EXISTS payment_val_id text,
  ADD COLUMN IF NOT EXISTS payment_details jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS steadfast_consignment_id text,
  ADD COLUMN IF NOT EXISTS fraud_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fraud_signals jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS advance_amount integer DEFAULT 0;

-- ── RLS for OTPs: service role only (all access via server actions) ──
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
-- No public policies — only service role (createAdminClient) can access

-- ── Settings table for configurable values ───────────────────
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default settings
INSERT INTO settings (key, value) VALUES
  ('high_value_threshold', '300000'::jsonb),    -- ৳3000 in paisa
  ('otp_required', 'true'::jsonb),
  ('steadfast_enabled', 'true'::jsonb),
  ('delivery_fee_inside_dhaka', '6000'::jsonb),
  ('delivery_fee_outside_dhaka', '12000'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS for settings: admin only
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
