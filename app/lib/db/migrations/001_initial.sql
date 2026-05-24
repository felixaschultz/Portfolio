-- Shop orders (download tracking)
CREATE TABLE IF NOT EXISTS shop_orders (
  payment_intent_id TEXT PRIMARY KEY,
  customer_email TEXT,
  customer_name TEXT,
  company_name TEXT,
  gallery_slug TEXT NOT NULL,
  gallery_title TEXT,
  license_id TEXT,
  license_label TEXT,
  image_count INTEGER NOT NULL DEFAULT 0,
  amount_ore INTEGER NOT NULL DEFAULT 0,
  locale TEXT,
  paid_at TIMESTAMPTZ NOT NULL,
  download_expires_at TIMESTAMPTZ NOT NULL,
  first_downloaded_at TIMESTAMPTZ,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shop_orders_expires_idx ON shop_orders (download_expires_at);
CREATE INDEX IF NOT EXISTS shop_orders_downloaded_idx ON shop_orders (first_downloaded_at);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_passkeys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_name TEXT,
  transports TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_passkeys_user_idx ON admin_passkeys (user_id);

-- WebAuthn challenge store (short-lived)
CREATE TABLE IF NOT EXISTS admin_webauthn_challenges (
  challenge TEXT PRIMARY KEY,
  user_id TEXT REFERENCES admin_users (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
