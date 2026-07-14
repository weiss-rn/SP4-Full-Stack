const fs = require("fs");

// 1. Add user-auth.ts with password hashing (Web Crypto for Edge)
fs.writeFileSync("src/lib/user-auth.ts", `import { getCloudflareEnv, getD1Database } from "@/lib/cloudflare";

const CREATE_USERS_TABLE_SQL = \`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)\`;

const CREATE_USER_SESSIONS_TABLE_SQL = \`
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
)\`;

const CREATE_USER_SESSIONS_TOKEN_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token)";

const CREATE_USER_SESSIONS_EXPIRES_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)";

const CREATE_USER_CARTS_TABLE_SQL = \`
CREATE TABLE IF NOT EXISTS user_carts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)\`;

const CREATE_USER_CART_ITEMS_TABLE_SQL = \`
CREATE TABLE IF NOT EXISTS user_cart_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  reserved_until TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(cart_id) REFERENCES user_carts(id) ON DELETE CASCADE
)\`;

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
  return db;
}

export async function registerUser(name: string, email: string, password: string) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(normalizedEmail).first();
  if (existing) throw new Error("An account with this email already exists.");

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)")
    .bind(id, name.trim(), normalizedEmail, passwordHash).run();

  return { id, name: name.trim(), email: normalizedEmail };
}

export async function loginUser(email: string, password: string) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?")
    .bind(normalizedEmail).first<{ id: string; name: string; email: string; password_hash: string }>();

  if (!user) throw new Error("Invalid email or password.");

  const hash = await hashPassword(password);
  if (hash !== user.password_hash) throw new Error("Invalid email or password.");

  return { id: user.id, name: user.name, email: user.email };
}

export async function createSession(userId: string, request: Request): Promise<string> {
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
    "SELECT u.id, u.name, u.email FROM user_sessions s INNER JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?"
  ).bind(token, new Date().toISOString()).first<{ id: string; name: string; email: string }>();

  return session ?? null;
}

export async function deleteSession(token: string) {
  const db = await ensureUserTables();
  if (!db) return;
  await db.prepare("DELETE FROM user_sessions WHERE token = ?").bind(token).run();
}

export function buildSessionCookie(token: string, request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return \`\${USER_SESSION_COOKIE}=\${encodeURIComponent(token)}; Path=/; Max-Age=\${USER_SESSION_MAX_AGE}; HttpOnly; SameSite=Lax\${secure}\`;
}

export function buildExpiredSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return \`\${USER_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax\${secure}\`;
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

export async function addToUserCart(userId: string, productId: string, quantity: number) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  let cart = await db.prepare("SELECT id FROM user_carts WHERE user_id = ?").bind(userId).first<{ id: string }>();
  if (!cart) {
    const cartId = crypto.randomUUID();
    await db.prepare("INSERT INTO user_carts (id, user_id) VALUES (?, ?)").bind(cartId, userId).run();
    cart = { id: cartId };
  }

  const reservedUntil = new Date(Date.now() + CART_RESERVATION_MINUTES * 60 * 1000).toISOString();

  const existing = await db.prepare(
    "SELECT id, quantity FROM user_cart_items WHERE cart_id = ? AND product_id = ?"
  ).bind(cart.id, productId).first<{ id: string; quantity: number }>();

  if (existing) {
    const newQty = existing.quantity + quantity;
    await db.prepare("UPDATE user_cart_items SET quantity = ?, reserved_until = ? WHERE id = ?")
      .bind(newQty, reservedUntil, existing.id).run();
  } else {
    await db.prepare(
      "INSERT INTO user_cart_items (id, cart_id, product_id, quantity, reserved_until) VALUES (?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), cart.id, productId, quantity, reservedUntil).run();
  }

  return getUserCart(userId);
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const db = await ensureUserTables();
  if (!db) throw new Error("Database not configured.");

  const cart = await db.prepare("SELECT id FROM user_carts WHERE user_id = ?").bind(userId).first<{ id: string }>();
  if (!cart) return [];

  const reservedUntil = new Date(Date.now() + CART_RESERVATION_MINUTES * 60 * 1000).toISOString();

  if (quantity <= 0) {
    await db.prepare("DELETE FROM user_cart_items WHERE cart_id = ? AND product_id = ?")
      .bind(cart.id, productId).run();
  } else {
    await db.prepare("UPDATE user_cart_items SET quantity = ?, reserved_until = ? WHERE cart_id = ? AND product_id = ?")
      .bind(quantity, reservedUntil, cart.id, productId).run();
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
`);
console.log("Created src/lib/user-auth.ts");

console.log("Auth + cart infrastructure generated!");
