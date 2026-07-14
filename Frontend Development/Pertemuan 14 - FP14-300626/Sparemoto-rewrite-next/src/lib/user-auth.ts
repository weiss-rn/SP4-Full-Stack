import { getD1Database, type D1Database } from "@/lib/cloudflare";

const CREATE_USERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone_number TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const CREATE_USER_ADDRESSES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone_number TEXT NOT NULL DEFAULT '',
  address_line_1 TEXT NOT NULL DEFAULT '',
  address_line_2 TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

const CREATE_USER_SESSIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

const CREATE_USER_SESSIONS_TOKEN_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token)";

const CREATE_USER_SESSIONS_EXPIRES_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)";

const CREATE_USER_CARTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_carts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const CREATE_USER_CART_ITEMS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_cart_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  reserved_until TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(cart_id) REFERENCES user_carts(id) ON DELETE CASCADE
)`;

const CREATE_USER_CART_ITEMS_CART_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_user_cart_items_cart_id ON user_cart_items(cart_id)";

const CREATE_USER_CART_ITEMS_PRODUCT_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_user_cart_items_product_id ON user_cart_items(product_id)";

const CREATE_USER_CART_ITEMS_RESERVED_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_user_cart_items_reserved ON user_cart_items(reserved_until)";

export const USER_SESSION_COOKIE = "motoparts.session";
export const USER_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const CART_RESERVATION_MINUTES = 30;

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "sparemoto-salt-v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function ensureUserTables() {
  const db = await getD1Database().catch(() => null);
  if (!db) return null;
  await db.prepare(CREATE_USERS_TABLE_SQL).run();
  await db.prepare(CREATE_USER_SESSIONS_TABLE_SQL).run();
  await db.prepare(CREATE_USER_SESSIONS_TOKEN_INDEX_SQL).run();
  await db.prepare(CREATE_USER_SESSIONS_EXPIRES_INDEX_SQL).run();
  await db.prepare(CREATE_USER_CARTS_TABLE_SQL).run();
  await db.prepare(CREATE_USER_CART_ITEMS_TABLE_SQL).run();
  await db.prepare(CREATE_USER_CART_ITEMS_CART_INDEX_SQL).run();
  await db.prepare(CREATE_USER_CART_ITEMS_PRODUCT_INDEX_SQL).run();
  await db.prepare(CREATE_USER_CART_ITEMS_RESERVED_INDEX_SQL).run();
  await db.prepare(CREATE_USER_ADDRESSES_TABLE_SQL).run();

  // Migrate older users table — add columns that may be missing
  for (const col of ["first_name", "last_name", "phone_number"]) {
    try {
      await db.prepare(`ALTER TABLE users ADD COLUMN ${col} TEXT NOT NULL DEFAULT ''`).run();
    } catch {
      // Column already exists — safe to ignore
    }
  }

  return db;
}

export async function registerUser(name: string, email: string, password: string, firstName?: string, lastName?: string, phoneNumber?: string) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(normalizedEmail).first();
  if (existing) throw new Error("An account with this email already exists.");

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const fn = (firstName || name.trim().split(' ')[0] || '').trim();
  const ln = (lastName || name.trim().split(' ').slice(1).join(' ') || '').trim();
  const phone = (phoneNumber || '').trim();

  await db.prepare("INSERT INTO users (id, first_name, last_name, phone_number, email, password_hash) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, fn, ln, phone, normalizedEmail, passwordHash).run();

  return { id, firstName: fn, lastName: ln, phoneNumber: phone, email: normalizedEmail };
}

export async function loginUser(email: string, password: string) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.prepare("SELECT id, first_name, last_name, phone_number, email, password_hash FROM users WHERE email = ?")
    .bind(normalizedEmail).first<{ id: string; first_name: string; last_name: string; phone_number: string; email: string; password_hash: string }>();

  if (!user) throw new Error("Invalid email or password.");

  const hash = await hashPassword(password);
  if (hash !== user.password_hash) throw new Error("Invalid email or password.");

  return { id: user.id, firstName: user.first_name, lastName: user.last_name, phoneNumber: user.phone_number, email: user.email };
}

export async function createSession(userId: string): Promise<string> {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  // Clean up expired sessions
  await db.prepare("DELETE FROM user_sessions WHERE expires_at < ?")
    .bind(new Date().toISOString()).run();

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + USER_SESSION_MAX_AGE * 1000).toISOString();

  await db.prepare("INSERT INTO user_sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), userId, token, expiresAt).run();

  return token;
}

export async function getSessionUser(token: string) {
  const db = await ensureUserTables();
  if (!db) return null;

  const session = await db.prepare(
    "SELECT u.id, u.first_name, u.last_name, u.phone_number, u.email FROM user_sessions s INNER JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?"
  ).bind(token, new Date().toISOString()).first<{ id: string; first_name: string; last_name: string; phone_number: string; email: string }>();

  return session ? { id: session.id, firstName: session.first_name, lastName: session.last_name, phoneNumber: session.phone_number, email: session.email } : null;
}

export async function deleteSession(token: string) {
  const db = await ensureUserTables();
  if (!db) return;
  await db.prepare("DELETE FROM user_sessions WHERE token = ?").bind(token).run();
}

export function buildSessionCookie(token: string, request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${USER_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${USER_SESSION_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`;
}

export function buildExpiredSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${USER_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}

export function getSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp("(?:^|; )" + USER_SESSION_COOKIE + "=([^;]*)"));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

// Cart operations
export async function getUserCart(userId: string) {
  const db = await ensureUserTables();
  if (!db) return [];

  let cart = await db.prepare("SELECT id FROM user_carts WHERE user_id = ?").bind(userId).first<{ id: string }>();
  if (!cart) {
    const cartId = crypto.randomUUID();
    await db.prepare("INSERT INTO user_carts (id, user_id) VALUES (?, ?)").bind(cartId, userId).run();
    cart = { id: cartId };
  }

  // Clean up expired reservations
  const now = new Date().toISOString();
  await db.prepare("DELETE FROM user_cart_items WHERE cart_id = ? AND reserved_until < ?")
    .bind(cart.id, now).run();

  const items = await db.prepare(
    "SELECT id, product_id, quantity, reserved_until FROM user_cart_items WHERE cart_id = ?"
  ).bind(cart.id).all<{ id: string; product_id: string; quantity: number; reserved_until: string }>();

  return items.results ?? [];
}

async function getAvailableStock(
  db: D1Database,
  productId: string,
  excludeCartId?: string
): Promise<{ available: number; physicalStock: number }> {
  const now = new Date().toISOString();

  // Get physical stock from products table
  const product = await db
    .prepare("SELECT stock_count FROM products WHERE id = ?")
    .bind(productId)
    .first<{ stock_count: number | null }>();
  const physicalStock = Math.max(0, Math.floor(product?.stock_count ?? 0));

  // Get total active reservations across ALL users (excluding this user's own cart)
  const reservedResult = await db
    .prepare(
      `SELECT COALESCE(SUM(quantity), 0) AS total
       FROM user_cart_items
       WHERE product_id = ? AND reserved_until > ?
       ${excludeCartId ? "AND cart_id != ?" : ""}`
    )
    .bind(
      productId,
      now,
      ...(excludeCartId ? [excludeCartId] : [])
    )
    .first<{ total: number }>();

  const totalReserved = reservedResult?.total ?? 0;
  return { available: Math.max(0, physicalStock - totalReserved), physicalStock };
}

export async function addToUserCart(userId: string, productId: string, quantity: number) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  let cart = await db.prepare("SELECT id FROM user_carts WHERE user_id = ?").bind(userId).first<{ id: string }>();
  if (!cart) {
    const cartId = crypto.randomUUID();
    await db.prepare("INSERT INTO user_carts (id, user_id) VALUES (?, ?)").bind(cartId, userId).run();
    cart = { id: cartId };
  }

  // Check stock availability before adding
  const existing = await db
    .prepare("SELECT id, quantity FROM user_cart_items WHERE cart_id = ? AND product_id = ?")
    .bind(cart.id, productId)
    .first<{ id: string; quantity: number }>();

  const userCurrentQty = existing?.quantity ?? 0;
  const userNewTotal = userCurrentQty + quantity;

  const { available } = await getAvailableStock(db, productId, cart.id);
  if (userNewTotal > available) {
    throw new Error(
      `Only ${available} unit${available === 1 ? "" : "s"} of this item available. You already have ${userCurrentQty} in your cart.`
    );
  }

  const reservedUntil = new Date(Date.now() + CART_RESERVATION_MINUTES * 60 * 1000).toISOString();

  if (existing) {
    await db
      .prepare("UPDATE user_cart_items SET quantity = ?, reserved_until = ? WHERE id = ?")
      .bind(userNewTotal, reservedUntil, existing.id)
      .run();
  } else {
    await db
      .prepare(
        "INSERT INTO user_cart_items (id, cart_id, product_id, quantity, reserved_until) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(crypto.randomUUID(), cart.id, productId, quantity, reservedUntil)
      .run();
  }

  return getUserCart(userId);
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  const cart = await db.prepare("SELECT id FROM user_carts WHERE user_id = ?").bind(userId).first<{ id: string }>();
  if (!cart) return [];

  // Check stock if increasing quantity
  if (quantity > 0) {
    const existingItem = await db
      .prepare("SELECT id, quantity FROM user_cart_items WHERE cart_id = ? AND product_id = ?")
      .bind(cart.id, productId)
      .first<{ id: string; quantity: number }>();

    if (existingItem && quantity > existingItem.quantity) {
      const addedQty = quantity - existingItem.quantity;
      const { available } = await getAvailableStock(db, productId, cart.id);
      if (existingItem.quantity + addedQty > available) {
        throw new Error(
          `Only ${available} unit${available === 1 ? "" : "s"} available.`
        );
      }
    }
  }

  const reservedUntil = new Date(Date.now() + CART_RESERVATION_MINUTES * 60 * 1000).toISOString();

  if (quantity <= 0) {
    await db
      .prepare("DELETE FROM user_cart_items WHERE cart_id = ? AND product_id = ?")
      .bind(cart.id, productId)
      .run();
  } else {
    await db
      .prepare("UPDATE user_cart_items SET quantity = ?, reserved_until = ? WHERE cart_id = ? AND product_id = ?")
      .bind(quantity, reservedUntil, cart.id, productId)
      .run();
  }

  return getUserCart(userId);
}

export async function clearUserCart(userId: string) {
  const db = await ensureUserTables();
  if (!db) return;

  const cart = await db.prepare("SELECT id FROM user_carts WHERE user_id = ?").bind(userId).first<{ id: string }>();
  if (!cart) return;
  await db.prepare("DELETE FROM user_cart_items WHERE cart_id = ?").bind(cart.id).run();
}

export async function getUserProfile(userId: string) {
  const db = await ensureUserTables();
  if (!db) return null;

  const user = await db.prepare(
    "SELECT id, first_name, last_name, phone_number, email, created_at FROM users WHERE id = ?"
  ).bind(userId).first<{ id: string; first_name: string; last_name: string; phone_number: string; email: string; created_at: string }>();

  if (!user) return null;
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    phoneNumber: user.phone_number,
    email: user.email,
    createdAt: user.created_at,
  };
}

export async function updateUserProfile(userId: string, data: { firstName?: string; lastName?: string; phoneNumber?: string }) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  const sets: string[] = [];
  const binds: Array<string | number> = [];

  if (data.firstName !== undefined) {
    sets.push("first_name = ?");
    binds.push(data.firstName.trim());
  }
  if (data.lastName !== undefined) {
    sets.push("last_name = ?");
    binds.push(data.lastName.trim());
  }
  if (data.phoneNumber !== undefined) {
    sets.push("phone_number = ?");
    binds.push(data.phoneNumber.trim());
  }

  if (sets.length === 0) return getUserProfile(userId);

  await db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).bind(...binds, userId).run();
  return getUserProfile(userId);
}

export async function getUserAddresses(userId: string) {
  const db = await ensureUserTables();
  if (!db) return [];

  const result = await db.prepare(
    "SELECT id, label, first_name, last_name, phone_number, address_line_1, address_line_2, city, state, postal_code, country, is_default FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC"
  ).bind(userId).all<{
    id: string;
    label: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: number;
  }>();

  return (result.results ?? []).map((a) => ({
    id: a.id,
    label: a.label,
    firstName: a.first_name,
    lastName: a.last_name,
    phoneNumber: a.phone_number,
    addressLine1: a.address_line_1,
    addressLine2: a.address_line_2,
    city: a.city,
    state: a.state,
    postalCode: a.postal_code,
    country: a.country,
    isDefault: a.is_default === 1,
  }));
}

export async function addUserAddress(
  userId: string,
  data: {
    label?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }
) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  const id = crypto.randomUUID();

  // If setting as default, unset others
  if (data.isDefault) {
    await db.prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?").bind(userId).run();
  }

  await db.prepare(
    `INSERT INTO user_addresses (id, user_id, label, first_name, last_name, phone_number, address_line_1, address_line_2, city, state, postal_code, country, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    userId,
    (data.label || '').trim(),
    (data.firstName || '').trim(),
    (data.lastName || '').trim(),
    (data.phoneNumber || '').trim(),
    data.addressLine1.trim(),
    (data.addressLine2 || '').trim(),
    data.city.trim(),
    data.state.trim(),
    data.postalCode.trim(),
    data.country.trim(),
    data.isDefault ? 1 : 0
  ).run();

  return getUserAddresses(userId);
}

export async function updateUserAddress(
  addressId: string,
  userId: string,
  data: {
    label?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
  }
) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  // If setting as default, unset others
  if (data.isDefault) {
    await db.prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?").bind(userId).run();
  }

  const sets: string[] = [];
  const binds: Array<string | number> = [];

  const fields: Record<string, string | undefined> = {
    label: data.label,
    first_name: data.firstName,
    last_name: data.lastName,
    phone_number: data.phoneNumber,
    address_line_1: data.addressLine1,
    address_line_2: data.addressLine2,
    city: data.city,
    state: data.state,
    postal_code: data.postalCode,
    country: data.country,
  };

  for (const [col, val] of Object.entries(fields)) {
    if (val !== undefined) {
      sets.push(`${col} = ?`);
      binds.push(val.trim());
    }
  }

  if (data.isDefault !== undefined) {
    sets.push("is_default = ?");
    binds.push(data.isDefault ? 1 : 0);
  }

  sets.push("updated_at = CURRENT_TIMESTAMP");

  await db.prepare(`UPDATE user_addresses SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`).bind(...binds, addressId, userId).run();
  return getUserAddresses(userId);
}

export async function deleteUserAddress(addressId: string, userId: string) {
  const db = await ensureUserTables();
  if (!db) return;
  await db.prepare("DELETE FROM user_addresses WHERE id = ? AND user_id = ?").bind(addressId, userId).run();
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  if (newPassword.length < 6) throw new Error("New password must be at least 6 characters.");

  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  const user = await db.prepare("SELECT password_hash FROM users WHERE id = ?")
    .bind(userId).first<{ password_hash: string }>();
  if (!user) throw new Error("User not found.");

  const currentHash = await hashPassword(currentPassword);
  if (currentHash !== user.password_hash) throw new Error("Current password is incorrect.");

  const newHash = await hashPassword(newPassword);
  await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newHash, userId).run();

  // Invalidate all other sessions (keep current session valid by returning new token info)
  // For simplicity, we just update the password and let existing sessions continue
  return { success: true };
}
