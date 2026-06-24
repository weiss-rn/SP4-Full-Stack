const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ========================
// Constants
// ========================
const SHIPPING_FEE = 14.99;
const DISCOUNT_CODES = { MOTO10: 0.1, PARTS20: 0.2, RIDE15: 0.15, FIRST25: 0.25 };
const USER_SESSION_COOKIE = 'motoparts.session';
const USER_SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const ADMIN_SESSION_COOKIE = 'sparemoto_admin';
const ADMIN_SESSION_MAX_AGE = 8 * 60 * 60;
const CART_RESERVATION_MINUTES = 30;

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getDiscountRate(code) {
  if (!code) return 0;
  return DISCOUNT_CODES[code.trim().toUpperCase()] ?? 0;
}

function getShippingFee(subtotal) {
  return subtotal >= 200 ? 0 : SHIPPING_FEE;
}

// ========================
// Password Hashing
// ========================
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'sparemoto-salt-v1').digest('hex');
}

// ========================
// Auth Helpers
// ========================
function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin123';
}

function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN || 'sparemoto-demo-admin';
}

function isAdminRequest(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = parseCookies(cookieHeader);
  return cookies[ADMIN_SESSION_COOKIE] === getAdminSessionToken();
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(entry => {
    const idx = entry.indexOf('=');
    if (idx === -1) return;
    const key = decodeURIComponent(entry.slice(0, idx).trim());
    const val = decodeURIComponent(entry.slice(idx + 1).trim());
    cookies[key] = val;
  });
  return cookies;
}

function getSessionTokenFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies[USER_SESSION_COOKIE] || null;
}

function buildSessionCookie(token, req) {
  const secure = req.protocol === 'https' ? '; Secure' : '';
  return `${USER_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${USER_SESSION_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`;
}

function buildExpiredSessionCookie(req) {
  const secure = req.protocol === 'https' ? '; Secure' : '';
  return `${USER_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}

function buildAdminSessionCookie(req) {
  const secure = req.protocol === 'https' ? '; Secure' : '';
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(getAdminSessionToken())}; Path=/; Max-Age=${ADMIN_SESSION_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`;
}

function buildExpiredAdminSessionCookie(req) {
  const secure = req.protocol === 'https' ? '; Secure' : '';
  return `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}



// ========================
// Helper Functions
// ========================
function parseNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseNullableNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  return parseNumber(value);
}

function toBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1';
  return false;
}

function parseSpecs(value) {
  if (Array.isArray(value)) return value.map(e => String(e).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map(e => e.trim()).filter(Boolean);
  return [];
}

function parsePayload(payload) {
  const name = String(payload.name || '').trim();
  const category = String(payload.category || '').trim();
  const categorySlug = String(payload.categorySlug || '').trim();
  const description = String(payload.description || '').trim();
  const specs = parseSpecs(payload.specs);
  if (!name || !category || !categorySlug || !description || specs.length === 0) {
    throw new Error('Missing required product fields.');
  }
  const parsedStockCount = parseNumber(payload.stockCount);
  const stockCount = parsedStockCount !== null
    ? Math.max(0, Math.floor(parsedStockCount))
    : toBool(payload.inStock) ? 12 : 0;
  return {
    id: typeof payload.id === 'string' ? payload.id.trim() : undefined,
    name, category, categorySlug,
    price: (() => { const p = parseNumber(payload.price); if (p === null) throw new Error('Price must be a number.'); return p; })(),
    originalPrice: parseNullableNumber(payload.originalPrice),
    description, specs,
    inStock: stockCount > 0,
    stockCount,
    badge: typeof payload.badge === 'string' && payload.badge.trim() ? payload.badge.trim() : null,
    rating: (() => { const r = parseNumber(payload.rating); if (r === null) throw new Error('Rating must be a number.'); return r; })(),
    reviews: (() => { const r = parseNumber(payload.reviews); if (r === null) throw new Error('Reviews must be a number.'); return r; })(),
    imageUrl: typeof payload.imageUrl === 'string' && payload.imageUrl.trim() ? payload.imageUrl.trim() : null,
    imagePublicId: typeof payload.imagePublicId === 'string' && payload.imagePublicId.trim() ? payload.imagePublicId.trim() : null,
  };
}

function generateOrderNumber() {
  const now = new Date();
  const dateStamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`;
  return `MP-${dateStamp}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

function slugifyId(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${base || 'product'}-${crypto.randomUUID().slice(0, 8)}`;
}

// ========================
// Database Helpers
// ========================
async function ensureTables() {
  // Products table
  await db.execute(`CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL, category VARCHAR(100) NOT NULL,
    category_slug VARCHAR(100) NOT NULL, price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) DEFAULT NULL, description TEXT NOT NULL, specs JSON NOT NULL,
    in_stock TINYINT(1) NOT NULL DEFAULT 1, stock_count INT NOT NULL DEFAULT 0,
    badge VARCHAR(50) DEFAULT NULL, rating DECIMAL(3,1) NOT NULL DEFAULT 0,
    reviews INT NOT NULL DEFAULT 0, image_url VARCHAR(500) DEFAULT NULL,
    image_public_id VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_slug (category_slug), INDEX idx_name (name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(() => {});

  // Users table
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY, first_name VARCHAR(100) NOT NULL DEFAULT '',
    last_name VARCHAR(100) NOT NULL DEFAULT '', phone_number VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(() => {});

  // Sessions table
  await db.execute(`CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE, expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token), INDEX idx_expires (expires_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(() => {});

  // Addresses table
  await db.execute(`CREATE TABLE IF NOT EXISTS user_addresses (
    id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL,
    label VARCHAR(100) NOT NULL DEFAULT '', first_name VARCHAR(100) NOT NULL DEFAULT '',
    last_name VARCHAR(100) NOT NULL DEFAULT '', phone_number VARCHAR(50) NOT NULL DEFAULT '',
    address_line_1 VARCHAR(255) NOT NULL DEFAULT '', address_line_2 VARCHAR(255) NOT NULL DEFAULT '',
    city VARCHAR(100) NOT NULL DEFAULT '', state VARCHAR(100) NOT NULL DEFAULT '',
    postal_code VARCHAR(20) NOT NULL DEFAULT '', country VARCHAR(100) NOT NULL DEFAULT '',
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(() => {});

  // Carts table
  await db.execute(`CREATE TABLE IF NOT EXISTS user_carts (
    id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(() => {});

  // Cart items table
  await db.execute(`CREATE TABLE IF NOT EXISTS user_cart_items (
    id VARCHAR(64) PRIMARY KEY, cart_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL, quantity INT NOT NULL DEFAULT 1,
    reserved_until DATETIME NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES user_carts(id) ON DELETE CASCADE,
    INDEX idx_cart_id (cart_id), INDEX idx_product_id (product_id),
    INDEX idx_reserved (reserved_until)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(() => {});

  // Demo orders table
  await db.execute(`CREATE TABLE IF NOT EXISTS demo_orders (
    id VARCHAR(64) PRIMARY KEY, order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id VARCHAR(64) DEFAULT NULL, customer_first_name VARCHAR(100) NOT NULL,
    customer_last_name VARCHAR(100) NOT NULL, customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address_line_1 VARCHAR(255) NOT NULL, shipping_address_line_2 VARCHAR(255) DEFAULT NULL,
    shipping_city VARCHAR(100) NOT NULL, shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL, shipping_country VARCHAR(100) NOT NULL,
    total_items INT NOT NULL, subtotal DECIMAL(10,2) NOT NULL,
    discount_code VARCHAR(50) DEFAULT NULL, discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_fee DECIMAL(10,2) NOT NULL, total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    cancel_reason TEXT DEFAULT NULL, cancelled_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_email (customer_email), INDEX idx_order_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(() => {});

  // Demo order items table
  await db.execute(`CREATE TABLE IF NOT EXISTS demo_order_items (
    id VARCHAR(64) PRIMARY KEY, order_id VARCHAR(64) NOT NULL,
    order_number VARCHAR(50) NOT NULL, product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL, product_category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL, unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL, stock_after INT NOT NULL,
    item_status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    cancel_reason TEXT DEFAULT NULL, cancelled_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES demo_orders(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(() => {});

  // Product reviews table
  await db.execute(`CREATE TABLE IF NOT EXISTS product_reviews (
    id VARCHAR(64) PRIMARY KEY, product_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) DEFAULT NULL, author VARCHAR(100) NOT NULL,
    rating INT NOT NULL, title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL, verified_purchase TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reviews_product (product_id), INDEX idx_reviews_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(() => {});
}

async function getSessionUser(token) {
  if (!token) return null;
  const [rows] = await db.execute(
    'SELECT u.id, u.first_name, u.last_name, u.phone_number, u.email FROM user_sessions s INNER JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()',
    [token]
  );
  if (rows.length === 0) return null;
  return {
    id: rows[0].id,
    firstName: rows[0].first_name,
    lastName: rows[0].last_name,
    phoneNumber: rows[0].phone_number,
    email: rows[0].email,
  };
}

async function getUserCart(userId) {
  let [carts] = await db.execute('SELECT id FROM user_carts WHERE user_id = ?', [userId]);
  if (carts.length === 0) {
    const cartId = crypto.randomUUID();
    await db.execute('INSERT INTO user_carts (id, user_id) VALUES (?, ?)', [cartId, userId]);
    carts = [{ id: cartId }];
  }
  await db.execute('DELETE FROM user_cart_items WHERE cart_id = ? AND reserved_until < NOW()', [carts[0].id]);
  const [items] = await db.execute(
    'SELECT id, product_id, quantity, reserved_until FROM user_cart_items WHERE cart_id = ?',
    [carts[0].id]
  );
  return items;
}

// ========================
// Routes: Admin Auth
// ========================
app.post('/api/admin/session', (req, res) => {
  try {
    const { password } = req.body;
    if (password !== getAdminPassword()) {
      return res.status(401).json({ error: 'Invalid admin password.' });
    }
    res.setHeader('set-cookie', buildAdminSessionCookie(req));
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: 'Invalid admin sign-in request.' });
  }
});

app.delete('/api/admin/session', (req, res) => {
  res.setHeader('set-cookie', buildExpiredAdminSessionCookie(req));
  res.json({ ok: true });
});

// ========================
// Routes: Products
// ========================
app.get('/api/products', async (req, res) => {
  try {
    const { q: search, category: categorySlug, sort } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      query += ' AND LOWER(CONCAT(name, \' \', category, \' \', description)) LIKE ?';
      params.push(`%${search.trim().toLowerCase()}%`);
    }
    if (categorySlug && categorySlug !== 'all') {
      query += ' AND category_slug = ?';
      params.push(categorySlug);
    }

    let orderBy = 'name ASC';
    if (sort === 'price-low') orderBy = 'price ASC, name ASC';
    else if (sort === 'price-high') orderBy = 'price DESC, name ASC';
    else if (sort === 'rating') orderBy = 'rating DESC, reviews DESC, name ASC';

    query += ` ORDER BY ${orderBy}`;

    const [products] = await db.execute(query, params);
    res.json({ products });
  } catch (err) {
    console.error('Error listing products:', err);
    res.status(500).json({ error: 'Failed to list products.' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    const product = products[0];
    product.specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs;
    res.json({ product: formatProduct(product) });
  } catch (err) {
    console.error('Error getting product:', err);
    res.status(500).json({ error: 'Failed to get product.' });
  }
});

app.post('/api/products', async (req, res) => {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Admin session required.' });
  try {
    const payload = parsePayload(req.body);
    const id = payload.id || slugifyId(payload.name);
    const stockCount = Math.max(0, Math.floor(payload.stockCount ?? (payload.inStock ? 12 : 0)));

    await db.execute(
      `INSERT INTO products (id, name, category, category_slug, price, original_price, description, specs, in_stock, stock_count, badge, rating, reviews, image_url, image_public_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, payload.name, payload.category, payload.categorySlug, payload.price,
       payload.originalPrice ?? null, payload.description, JSON.stringify(payload.specs),
       stockCount > 0 ? 1 : 0, stockCount, payload.badge ?? null,
       payload.rating, payload.reviews, payload.imageUrl ?? null, payload.imagePublicId ?? null]
    );

    const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json({ product: formatProduct(products[0]) });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: err.message || 'Unable to create product.' });
  }
});

app.patch('/api/products/:id', async (req, res) => {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Admin session required.' });
  try {
    const [existing] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Product not found.' });

    const payload = parsePayload({ id: req.params.id, ...req.body });
    const stockCount = Math.max(0, Math.floor(payload.stockCount ?? (payload.inStock ? 12 : 0)));

    await db.execute(
      `UPDATE products SET name = ?, category = ?, category_slug = ?, price = ?, original_price = ?,
       description = ?, specs = ?, in_stock = ?, stock_count = ?, badge = ?, rating = ?, reviews = ?,
       image_url = ?, image_public_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [payload.name, payload.category, payload.categorySlug, payload.price,
       payload.originalPrice ?? null, payload.description, JSON.stringify(payload.specs),
       stockCount > 0 ? 1 : 0, stockCount, payload.badge ?? null, payload.rating, payload.reviews,
       payload.imageUrl ?? null, payload.imagePublicId ?? null, req.params.id]
    );

    const [updated] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({ product: formatProduct(updated[0]) });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ error: err.message || 'Unable to update product.' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Admin session required.' });
  try {
    const [existing] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Product not found.' });
    await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ product: formatProduct(existing[0]) });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// ========================
// Routes: Categories
// ========================
app.get('/api/categories', async (req, res) => {
  try {
    const [products] = await db.execute('SELECT category_slug, COUNT(*) AS count FROM products GROUP BY category_slug');
    const countMap = {};
    for (const p of products) countMap[p.category_slug] = p.count;

    const [cats] = await db.execute('SELECT DISTINCT category, category_slug FROM products');
    const categories = cats.map(c => ({
      slug: c.category_slug,
      name: c.category,
      count: countMap[c.category_slug] || 0,
    }));
    res.json({ categories });
  } catch (err) {
    console.error('Error listing categories:', err);
    res.status(500).json({ error: 'Failed to list categories.' });
  }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const [cats] = await db.execute('SELECT DISTINCT category, category_slug FROM products WHERE category_slug = ?', [req.params.slug]);
    if (cats.length === 0) return res.status(404).json({ error: 'Category not found.' });

    const [products] = await db.execute('SELECT * FROM products WHERE category_slug = ?', [req.params.slug]);
    res.json({
      category: { slug: cats[0].category_slug, name: cats[0].category, count: products.length },
      products: products.map(formatProduct),
    });
  } catch (err) {
    console.error('Error getting category:', err);
    res.status(500).json({ error: 'Failed to get category.' });
  }
});

// ========================
// Routes: Featured
// ========================
app.get('/api/featured', async (req, res) => {
  try {
    const [products] = await db.execute(
      "SELECT * FROM products WHERE badge IS NOT NULL OR original_price > price LIMIT 8"
    );
    res.json({ products: products.map(formatProduct) });
  } catch (err) {
    console.error('Error getting featured:', err);
    res.status(500).json({ error: 'Failed to get featured products.' });
  }
});

// ========================
// Routes: Reviews
// ========================
app.post('/api/reviews', async (req, res) => {
  try {
    const { productId, rating, title, body } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID is required.' });
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }
    if (!title) return res.status(400).json({ error: 'Review title is required.' });
    if (!body) return res.status(400).json({ error: 'Review body is required.' });

    let author = 'Anonymous Rider';
    let userId = null;
    const token = getSessionTokenFromRequest(req);
    if (token) {
      const user = await getSessionUser(token);
      if (user) {
        userId = user.id;
        author = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Anonymous Rider';
      }
    }

    const id = crypto.randomUUID();
    await db.execute(
      'INSERT INTO product_reviews (id, product_id, user_id, author, rating, title, body) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, productId, userId, author, Math.round(rating), title.trim(), body.trim()]
    );

    res.status(201).json({
      review: { id, productId, userId, author, rating: Math.round(rating), title, body, verifiedPurchase: false, createdAt: new Date().toISOString() }
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(400).json({ error: err.message || 'Unable to submit review.' });
  }
});

app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const [reviews] = await db.execute(
      'SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC',
      [req.params.productId]
    );
    res.json({
      reviews: reviews.map(r => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        author: r.author,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verifiedPurchase: r.verified_purchase === 1,
        createdAt: r.created_at,
      }))
    });
  } catch (err) {
    console.error('Error getting reviews:', err);
    res.status(400).json({ error: err.message || 'Unable to fetch reviews.' });
  }
});

// ========================
// Routes: Auth
// ========================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) return res.status(400).json({ error: 'An account with this email already exists.' });

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const fn = name.trim().split(' ')[0] || '';
    const ln = name.trim().split(' ').slice(1).join(' ') || '';

    await db.execute(
      'INSERT INTO users (id, first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?, ?)',
      [id, fn, ln, normalizedEmail, passwordHash]
    );

    res.status(201).json({ user: { id, firstName: fn, lastName: ln, email: normalizedEmail } });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const normalizedEmail = email.trim().toLowerCase();
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });

    const user = users[0];
    if (hashPassword(password) !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Clean expired sessions
    await db.execute('DELETE FROM user_sessions WHERE expires_at < NOW()');

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + USER_SESSION_MAX_AGE * 1000).toISOString();
    await db.execute(
      'INSERT INTO user_sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [crypto.randomUUID(), user.id, token, expiresAt]
    );

    res.setHeader('set-cookie', buildSessionCookie(token, req));
    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,
        email: user.email,
      }
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(401).json({ error: err.message || 'Login failed.' });
  }
});

app.delete('/api/auth/logout', async (req, res) => {
  try {
    const token = getSessionTokenFromRequest(req);
    if (token) await db.execute('DELETE FROM user_sessions WHERE token = ?', [token]);
    res.setHeader('set-cookie', buildExpiredSessionCookie(req));
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: true });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = getSessionTokenFromRequest(req);
    if (!token) return res.json({ user: null, addresses: [] });

    const sessionUser = await getSessionUser(token);
    if (!sessionUser) return res.json({ user: null, addresses: [] });

    const [profiles] = await db.execute(
      'SELECT id, first_name, last_name, phone_number, email, created_at FROM users WHERE id = ?',
      [sessionUser.id]
    );
    const [addresses] = await db.execute(
      'SELECT id, label, first_name, last_name, phone_number, address_line_1, address_line_2, city, state, postal_code, country, is_default FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC',
      [sessionUser.id]
    );

    const profile = profiles.length > 0 ? {
      id: profiles[0].id,
      firstName: profiles[0].first_name,
      lastName: profiles[0].last_name,
      phoneNumber: profiles[0].phone_number,
      email: profiles[0].email,
      createdAt: profiles[0].created_at,
    } : sessionUser;

    res.json({
      user: profile,
      addresses: addresses.map(a => ({
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
      }))
    });
  } catch (err) {
    console.error('Error getting user:', err);
    res.json({ user: null, addresses: [] });
  }
});

app.patch('/api/auth/profile', async (req, res) => {
  try {
    const token = getSessionTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: 'Please sign in.' });
    const user = await getSessionUser(token);
    if (!user) return res.status(401).json({ error: 'Session expired.' });

    const { firstName, lastName, phoneNumber } = req.body;
    const sets = [];
    const params = [];

    if (firstName !== undefined) { sets.push('first_name = ?'); params.push(String(firstName).trim()); }
    if (lastName !== undefined) { sets.push('last_name = ?'); params.push(String(lastName).trim()); }
    if (phoneNumber !== undefined) { sets.push('phone_number = ?'); params.push(String(phoneNumber).trim()); }

    if (sets.length > 0) {
      params.push(user.id);
      await db.execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
    }

    const [profiles] = await db.execute('SELECT * FROM users WHERE id = ?', [user.id]);
    res.json({
      user: profiles.length > 0 ? {
        id: profiles[0].id,
        firstName: profiles[0].first_name,
        lastName: profiles[0].last_name,
        phoneNumber: profiles[0].phone_number,
        email: profiles[0].email,
      } : user
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(400).json({ error: err.message || 'Unable to update profile.' });
  }
});

// ========================
// Routes: Addresses
// ========================
app.get('/api/auth/addresses', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.json({ addresses: [] });
  const user = await getSessionUser(token);
  if (!user) return res.json({ addresses: [] });
  try {
    const [addresses] = await db.execute(
      'SELECT id, label, first_name, last_name, phone_number, address_line_1, address_line_2, city, state, postal_code, country, is_default FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC',
      [user.id]
    );
    res.json({
      addresses: addresses.map(a => ({
        id: a.id, label: a.label, firstName: a.first_name, lastName: a.last_name,
        phoneNumber: a.phone_number, addressLine1: a.address_line_1, addressLine2: a.address_line_2,
        city: a.city, state: a.state, postalCode: a.postal_code, country: a.country, isDefault: a.is_default === 1,
      }))
    });
  } catch (err) {
    res.json({ addresses: [] });
  }
});

app.post('/api/auth/addresses', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    const { label, firstName, lastName, phoneNumber, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
    const id = crypto.randomUUID();
    if (isDefault) await db.execute('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [user.id]);
    await db.execute(
      `INSERT INTO user_addresses (id, user_id, label, first_name, last_name, phone_number, address_line_1, address_line_2, city, state, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.id, (label || '').trim(), (firstName || '').trim(), (lastName || '').trim(),
       (phoneNumber || '').trim(), (addressLine1 || '').trim(), (addressLine2 || '').trim(),
       (city || '').trim(), (state || '').trim(), (postalCode || '').trim(), (country || '').trim(),
       isDefault ? 1 : 0]
    );

    const [addresses] = await db.execute('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC', [user.id]);
    res.json({
      addresses: addresses.map(a => ({
        id: a.id, label: a.label, firstName: a.first_name, lastName: a.last_name,
        phoneNumber: a.phone_number, addressLine1: a.address_line_1, addressLine2: a.address_line_2,
        city: a.city, state: a.state, postalCode: a.postal_code, country: a.country, isDefault: a.is_default === 1,
      }))
    });
  } catch (err) {
    console.error('Error adding address:', err);
    res.status(400).json({ error: err.message || 'Unable to add address.' });
  }
});

app.patch('/api/auth/addresses/:id', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    const { label, firstName, lastName, phoneNumber, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
    if (isDefault) await db.execute('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [user.id]);

    const sets = [];
    const params = [];
    const fieldMap = { label, first_name: firstName, last_name: lastName, phone_number: phoneNumber, address_line_1: addressLine1, address_line_2: addressLine2, city, state, postal_code: postalCode, country };
    for (const [col, val] of Object.entries(fieldMap)) {
      if (val !== undefined) { sets.push(`${col} = ?`); params.push(String(val).trim()); }
    }
    if (isDefault !== undefined) { sets.push('is_default = ?'); params.push(isDefault ? 1 : 0); }
    sets.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id, user.id);
    await db.execute(`UPDATE user_addresses SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, params);

    const [addresses] = await db.execute('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC', [user.id]);
    res.json({
      addresses: addresses.map(a => ({
        id: a.id, label: a.label, firstName: a.first_name, lastName: a.last_name,
        phoneNumber: a.phone_number, addressLine1: a.address_line_1, addressLine2: a.address_line_2,
        city: a.city, state: a.state, postalCode: a.postal_code, country: a.country, isDefault: a.is_default === 1,
      }))
    });
  } catch (err) {
    console.error('Error updating address:', err);
    res.status(400).json({ error: err.message || 'Unable to update address.' });
  }
});

app.delete('/api/auth/addresses/:id', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    await db.execute('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [req.params.id, user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to delete address.' });
  }
});

// ========================
// Routes: Change Password
// ========================
app.patch('/api/auth/change-password', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new passwords are required.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters.' });

    const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });
    if (hashPassword(currentPassword) !== users[0].password_hash) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(newPassword), user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to change password.' });
  }
});

// ========================
// Routes: Cart
// ========================
app.get('/api/cart', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.json({ items: [] });
  const user = await getSessionUser(token);
  if (!user) return res.json({ items: [] });
  try {
    const items = await getUserCart(user.id);
    res.json({ items });
  } catch (err) {
    res.json({ items: [] });
  }
});

app.post('/api/cart', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in to use cart sync.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  try {
    const { productId, quantity: qty } = req.body;
    const quantity = Math.max(1, Math.floor(Number(qty ?? 1)));
    if (!productId) return res.status(400).json({ error: 'Product ID is required.' });

    let [carts] = await db.execute('SELECT id FROM user_carts WHERE user_id = ?', [user.id]);
    if (carts.length === 0) {
      const cartId = crypto.randomUUID();
      await db.execute('INSERT INTO user_carts (id, user_id) VALUES (?, ?)', [cartId, user.id]);
      carts = [{ id: cartId }];
    }
    const cartId = carts[0].id;

    // Check stock availability
    const [existing] = await db.execute(
      'SELECT id, quantity FROM user_cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    const userCurrentQty = existing.length > 0 ? existing[0].quantity : 0;
    const reservedUntil = new Date(Date.now() + CART_RESERVATION_MINUTES * 60 * 1000).toISOString();

    if (existing.length > 0) {
      await db.execute(
        'UPDATE user_cart_items SET quantity = ?, reserved_until = ? WHERE id = ?',
        [userCurrentQty + quantity, reservedUntil, existing[0].id]
      );
    } else {
      await db.execute(
        'INSERT INTO user_cart_items (id, cart_id, product_id, quantity, reserved_until) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), cartId, productId, quantity, reservedUntil]
      );
    }

    const items = await getUserCart(user.id);
    res.json({ items });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(400).json({ error: err.message || 'Unable to add to cart.' });
  }
});

app.patch('/api/cart/:productId', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in to use cart sync.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    const quantity = Math.floor(Number(req.body.quantity ?? 0));
    const [carts] = await db.execute('SELECT id FROM user_carts WHERE user_id = ?', [user.id]);
    if (carts.length === 0) return res.json({ items: [] });

    const reservedUntil = new Date(Date.now() + CART_RESERVATION_MINUTES * 60 * 1000).toISOString();
    if (quantity <= 0) {
      await db.execute('DELETE FROM user_cart_items WHERE cart_id = ? AND product_id = ?', [carts[0].id, req.params.productId]);
    } else {
      await db.execute(
        'UPDATE user_cart_items SET quantity = ?, reserved_until = ? WHERE cart_id = ? AND product_id = ?',
        [quantity, reservedUntil, carts[0].id, req.params.productId]
      );
    }
    const items = await getUserCart(user.id);
    res.json({ items });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to update cart.' });
  }
});

app.delete('/api/cart', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.json({ ok: true });
  const user = await getSessionUser(token);
  if (!user) return res.json({ ok: true });
  try {
    const [carts] = await db.execute('SELECT id FROM user_carts WHERE user_id = ?', [user.id]);
    if (carts.length > 0) await db.execute('DELETE FROM user_cart_items WHERE cart_id = ?', [carts[0].id]);
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

app.delete('/api/cart/:productId', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in to use cart sync.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    const [carts] = await db.execute('SELECT id FROM user_carts WHERE user_id = ?', [user.id]);
    if (carts.length > 0) {
      await db.execute('DELETE FROM user_cart_items WHERE cart_id = ? AND product_id = ?', [carts[0].id, req.params.productId]);
    }
    const items = await getUserCart(user.id);
    res.json({ items });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to update cart.' });
  }
});

// ========================
// Routes: Demo Orders
// ========================
app.post('/api/demo-orders', async (req, res) => {
  try {
    const { customer, items: orderItems, discountCode: rawDiscountCode } = req.body;
    if (!customer || !orderItems) return res.status(400).json({ error: 'Customer info and items are required.' });

    // Get user if logged in
    let userId = null;
    const token = getSessionTokenFromRequest(req);
    if (token) {
      const user = await getSessionUser(token);
      if (user) userId = user.id;
    }

    const firstName = String(customer.firstName || '').trim();
    const lastName = String(customer.lastName || '').trim();
    const email = String(customer.email || '').trim();
    const phone = String(customer.phone || '').trim();
    const addressLine1 = String(customer.addressLine1 || '').trim();
    const addressLine2 = (customer.addressLine2 || '').trim() || null;
    const city = String(customer.city || '').trim();
    const state = String(customer.state || '').trim();
    const postalCode = String(customer.postalCode || '').trim();
    const country = String(customer.country || '').trim();

    if (!firstName || !lastName || !email || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
      return res.status(400).json({ error: 'All required customer fields must be filled.' });
    }

    // Aggregate items
    const aggregated = new Map();
    for (const item of orderItems) {
      const pid = String(item.productId || '').trim();
      const qty = Math.floor(Number(item.quantity || 0));
      if (pid && qty > 0) aggregated.set(pid, (aggregated.get(pid) || 0) + qty);
    }
    if (aggregated.size === 0) return res.status(400).json({ error: 'Cart is empty.' });

    // Fetch products and validate stock
    const productIds = Array.from(aggregated.keys());
    const placeholders = productIds.map(() => '?').join(',');
    const [productRows] = await db.execute(`SELECT * FROM products WHERE id IN (${placeholders})`, productIds);
    const productMap = {};
    for (const p of productRows) productMap[p.id] = p;

    const orderLines = [];
    for (const [pid, qty] of aggregated) {
      const product = productMap[pid];
      if (!product) return res.status(404).json({ error: `Product ${pid} not found.` });
      const availableStock = Math.max(0, Math.floor(product.stock_count ?? 0));
      if (availableStock <= 0) return res.status(409).json({ error: `${product.name} is out of stock.` });
      if (qty > availableStock) return res.status(409).json({ error: `Only ${availableStock} of ${product.name} left in stock.` });

      orderLines.push({
        product,
        quantity: qty,
        remainingStock: availableStock - qty,
        unitPrice: product.price,
        lineTotal: roundCurrency(product.price * qty),
      });
    }

    const subtotal = roundCurrency(orderLines.reduce((sum, l) => sum + l.lineTotal, 0));
    const discountCode = rawDiscountCode ? rawDiscountCode.trim().toUpperCase() : null;
    const discountRate = getDiscountRate(discountCode);
    const effectiveDiscountCode = discountRate > 0 ? discountCode : null;
    const discountAmount = roundCurrency(subtotal * discountRate);
    const shippingFee = getShippingFee(subtotal);
    const total = roundCurrency(subtotal - discountAmount + shippingFee);
    const totalItems = orderLines.reduce((sum, l) => sum + l.quantity, 0);
    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();

    // Update stock
    for (const line of orderLines) {
      await db.execute('UPDATE products SET stock_count = ?, in_stock = ? WHERE id = ?',
        [line.remainingStock, line.remainingStock > 0 ? 1 : 0, line.product.id]);
    }

    // Insert order
    await db.execute(
      `INSERT INTO demo_orders (id, order_number, user_id, customer_first_name, customer_last_name,
       customer_email, customer_phone, shipping_address_line_1, shipping_address_line_2,
       shipping_city, shipping_state, shipping_postal_code, shipping_country,
       total_items, subtotal, discount_code, discount_amount, shipping_fee, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, orderNumber, userId, firstName, lastName, email, phone,
       addressLine1, addressLine2, city, state, postalCode, country,
       totalItems, subtotal, effectiveDiscountCode, discountAmount, shippingFee, total]
    );

    // Insert order items
    for (const line of orderLines) {
      await db.execute(
        `INSERT INTO demo_order_items (id, order_id, order_number, product_id, product_name,
         product_category, quantity, unit_price, line_total, stock_after)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), orderId, orderNumber, line.product.id, line.product.name,
         line.product.category, line.quantity, line.unitPrice, line.lineTotal, line.remainingStock]
      );
    }

    res.status(201).json({
      order: {
        id: orderId,
        orderNumber,
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        totalItems,
        subtotal,
        discountCode: effectiveDiscountCode,
        discountAmount,
        shippingFee,
        total,
        createdAt: new Date().toISOString(),
        items: orderLines.map(l => ({
          productId: l.product.id,
          productName: l.product.name,
          category: l.product.category,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
          remainingStock: l.remainingStock,
        })),
      }
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(400).json({ error: err.message || 'Unable to create demo order.' });
  }
});

app.get('/api/demo-orders/lookup', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required.' });

    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await db.execute(
      `SELECT o.id AS order_id, o.order_number, o.created_at, o.customer_first_name, o.customer_last_name,
        o.customer_email, o.user_id, o.total_items, o.subtotal, o.discount_code, o.discount_amount,
        o.shipping_fee, o.total, o.status, o.cancel_reason, o.cancelled_at,
        i.product_id, i.product_name, i.product_category, i.quantity, i.unit_price,
        i.line_total, i.stock_after, i.item_status, i.cancel_reason AS item_cancel_reason,
        i.cancelled_at AS item_cancelled_at
      FROM demo_orders o
      LEFT JOIN demo_order_items i ON i.order_id = o.id
      WHERE LOWER(o.customer_email) = ?
      ORDER BY o.created_at DESC, i.product_name ASC`,
      [normalizedEmail]
    );

    const ordersMap = new Map();
    for (const row of rows) {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          id: row.order_id,
          orderNumber: row.order_number,
          customerName: `${row.customer_first_name} ${row.customer_last_name}`,
          customerEmail: row.customer_email,
          userId: row.user_id,
          totalItems: row.total_items,
          subtotal: row.subtotal,
          discountCode: row.discount_code,
          discountAmount: row.discount_amount,
          shippingFee: row.shipping_fee,
          total: row.total,
          createdAt: row.created_at,
          status: row.status || 'confirmed',
          cancelReason: row.cancel_reason,
          cancelledAt: row.cancelled_at,
          items: [],
        });
      }
      if (row.product_id) {
        ordersMap.get(row.order_id).items.push({
          productId: row.product_id,
          productName: row.product_name,
          category: row.product_category,
          quantity: row.quantity,
          unitPrice: row.unit_price,
          lineTotal: row.line_total,
          remainingStock: row.stock_after ?? 0,
          itemStatus: row.item_status || 'confirmed',
          cancelReason: row.item_cancel_reason,
          cancelledAt: row.item_cancelled_at,
        });
      }
    }

    res.json({ orders: Array.from(ordersMap.values()) });
  } catch (err) {
    console.error('Error looking up orders:', err);
    res.status(400).json({ error: err.message || 'Unable to look up orders.' });
  }
});

// ========================
// Routes: User Orders
// ========================
app.get('/api/user/orders', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });

  try {
    const [rows] = await db.execute(
      `SELECT o.id AS order_id, o.order_number, o.created_at, o.customer_first_name, o.customer_last_name,
        o.customer_email, o.user_id, o.total_items, o.subtotal, o.discount_code, o.discount_amount,
        o.shipping_fee, o.total, o.status, o.cancel_reason, o.cancelled_at,
        i.product_id, i.product_name, i.product_category, i.quantity, i.unit_price,
        i.line_total, i.stock_after, i.item_status, i.cancel_reason AS item_cancel_reason,
        i.cancelled_at AS item_cancelled_at
      FROM demo_orders o
      LEFT JOIN demo_order_items i ON i.order_id = o.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC, i.product_name ASC`,
      [user.id]
    );

    const ordersMap = new Map();
    for (const row of rows) {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          id: row.order_id, orderNumber: row.order_number, customerName: `${row.customer_first_name} ${row.customer_last_name}`,
          customerEmail: row.customer_email, userId: row.user_id, totalItems: row.total_items,
          subtotal: row.subtotal, discountCode: row.discount_code, discountAmount: row.discount_amount,
          shippingFee: row.shipping_fee, total: row.total, createdAt: row.created_at,
          status: row.status || 'confirmed', cancelReason: row.cancel_reason, cancelledAt: row.cancelled_at, items: [],
        });
      }
      if (row.product_id) {
        ordersMap.get(row.order_id).items.push({
          productId: row.product_id, productName: row.product_name, category: row.product_category,
          quantity: row.quantity, unitPrice: row.unit_price, lineTotal: row.line_total,
          remainingStock: row.stock_after ?? 0, itemStatus: row.item_status || 'confirmed',
          cancelReason: row.item_cancel_reason, cancelledAt: row.item_cancelled_at,
        });
      }
    }
    res.json({ orders: Array.from(ordersMap.values()) });
  } catch (err) {
    console.error('Error getting user orders:', err);
    res.status(500).json({ error: 'Unable to fetch orders.' });
  }
});

app.get('/api/user/orders/:orderId', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    const [rows] = await db.execute(
      `SELECT o.id AS order_id, o.order_number, o.created_at, o.customer_first_name, o.customer_last_name,
        o.customer_email, o.user_id, o.total_items, o.subtotal, o.discount_code, o.discount_amount,
        o.shipping_fee, o.total, o.status, o.cancel_reason, o.cancelled_at,
        i.product_id, i.product_name, i.product_category, i.quantity, i.unit_price,
        i.line_total, i.stock_after, i.item_status, i.cancel_reason AS item_cancel_reason,
        i.cancelled_at AS item_cancelled_at
      FROM demo_orders o
      LEFT JOIN demo_order_items i ON i.order_id = o.id
      WHERE o.id = ? AND o.user_id = ?
      ORDER BY i.product_name ASC`,
      [req.params.orderId, user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found.' });

    const order = {
      id: rows[0].order_id, orderNumber: rows[0].order_number,
      customerName: `${rows[0].customer_first_name} ${rows[0].customer_last_name}`,
      customerEmail: rows[0].customer_email, userId: rows[0].user_id,
      totalItems: rows[0].total_items, subtotal: rows[0].subtotal,
      discountCode: rows[0].discount_code, discountAmount: rows[0].discount_amount,
      shippingFee: rows[0].shipping_fee, total: rows[0].total,
      createdAt: rows[0].created_at, status: rows[0].status || 'confirmed',
      cancelReason: rows[0].cancel_reason, cancelledAt: rows[0].cancelled_at, items: [],
    };
    for (const row of rows) {
      if (row.product_id) {
        order.items.push({
          productId: row.product_id, productName: row.product_name, category: row.product_category,
          quantity: row.quantity, unitPrice: row.unit_price, lineTotal: row.line_total,
          remainingStock: row.stock_after ?? 0, itemStatus: row.item_status || 'confirmed',
          cancelReason: row.item_cancel_reason, cancelledAt: row.item_cancelled_at,
        });
      }
    }
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to fetch order.' });
  }
});

app.post('/api/user/orders/:orderId/cancel', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) return res.status(400).json({ error: 'Cancellation reason is required.' });

    const [orders] = await db.execute('SELECT * FROM demo_orders WHERE id = ? AND user_id = ?', [req.params.orderId, user.id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found.' });
    if (orders[0].status === 'cancelled') return res.status(400).json({ error: 'Order is already cancelled.' });

    const now = new Date().toISOString();
    await db.execute('UPDATE demo_orders SET status = ?, cancel_reason = ?, cancelled_at = ? WHERE id = ?',
      ['cancelled', reason.trim(), now, req.params.orderId]);
    await db.execute('UPDATE demo_order_items SET item_status = ?, cancel_reason = ?, cancelled_at = ? WHERE order_id = ?',
      ['cancelled', reason.trim(), now, req.params.orderId]);

    const [rows] = await db.execute(
      `SELECT * FROM demo_orders WHERE id = ?`, [req.params.orderId]
    );
    res.json({
      order: {
        id: rows[0].id, orderNumber: rows[0].order_number, status: 'cancelled',
        cancelReason: rows[0].cancel_reason, cancelledAt: rows[0].cancelled_at,
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to cancel order.' });
  }
});

app.post('/api/user/orders/:orderId/items/:itemId/cancel', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) return res.status(400).json({ error: 'Cancellation reason is required.' });

    const [orders] = await db.execute('SELECT * FROM demo_orders WHERE id = ? AND user_id = ?', [req.params.orderId, user.id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found.' });
    if (orders[0].status === 'cancelled') return res.status(400).json({ error: 'Order is already cancelled.' });

    const now = new Date().toISOString();
    await db.execute(
      'UPDATE demo_order_items SET item_status = ?, cancel_reason = ?, cancelled_at = ? WHERE order_id = ? AND product_id = ?',
      ['cancelled', reason.trim(), now, req.params.orderId, req.params.itemId]
    );

    // Check if all items cancelled
    const [items] = await db.execute('SELECT item_status FROM demo_order_items WHERE order_id = ?', [req.params.orderId]);
    const allCancelled = items.every(i => i.item_status === 'cancelled');
    const someCancelled = items.some(i => i.item_status === 'cancelled');
    if (allCancelled) {
      await db.execute('UPDATE demo_orders SET status = ?, cancel_reason = ?, cancelled_at = ? WHERE id = ?',
        ['cancelled', 'All items cancelled', now, req.params.orderId]);
    } else if (someCancelled) {
      await db.execute('UPDATE demo_orders SET status = ? WHERE id = ?', ['partially_cancelled', req.params.orderId]);
    }

    const [rows] = await db.execute('SELECT * FROM demo_orders WHERE id = ?', [req.params.orderId]);
    res.json({
      order: {
        id: rows[0].id, orderNumber: rows[0].order_number, status: rows[0].status,
        cancelReason: rows[0].cancel_reason, cancelledAt: rows[0].cancelled_at,
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to cancel item.' });
  }
});

// ========================
// Routes: User Reviews
// ========================
app.get('/api/user/reviews', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    const [reviews] = await db.execute(
      'SELECT * FROM product_reviews WHERE user_id = ? ORDER BY created_at DESC', [user.id]
    );
    res.json({
      reviews: reviews.map(r => ({
        id: r.id, productId: r.product_id, userId: r.user_id, author: r.author,
        rating: r.rating, title: r.title, body: r.body,
        verifiedPurchase: r.verified_purchase === 1, createdAt: r.created_at,
      }))
    });
  } catch (err) {
    res.json({ reviews: [] });
  }
});

app.delete('/api/user/reviews/:reviewId', async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  try {
    const [reviews] = await db.execute('SELECT * FROM product_reviews WHERE id = ?', [req.params.reviewId]);
    if (reviews.length === 0) return res.status(404).json({ error: 'Review not found.' });
    if (reviews[0].user_id !== user.id) return res.status(403).json({ error: 'You can only delete your own reviews.' });
    await db.execute('DELETE FROM product_reviews WHERE id = ?', [req.params.reviewId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to delete review.' });
  }
});

// ========================
// Routes: Image Upload
// ========================
app.post('/api/uploads/image', (req, res) => {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Admin session required.' });
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'Upload failed.' });
    if (!req.file) return res.status(400).json({ error: 'Expected a file upload.' });
    res.status(201).json({
      upload: {
        imageUrl: `/uploads/${req.file.filename}`,
        imagePublicId: req.file.filename,
        width: null, height: null,
      }
    });
  });
});

// ========================
// Helper: Format Product
// ========================
function formatProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categorySlug: row.category_slug,
    price: row.price,
    originalPrice: row.original_price || undefined,
    description: row.description,
    specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs,
    inStock: row.in_stock === 1,
    stockCount: row.stock_count,
    badge: row.badge || undefined,
    rating: row.rating,
    reviews: row.reviews,
    imageUrl: row.image_url || undefined,
    imagePublicId: row.image_public_id || undefined,
  };
}

// ========================
// Error handler
// ========================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ========================
// Start Server
// ========================
async function start() {
  try {
    await ensureTables();
    console.log('Database tables ensured.');
  } catch (err) {
    console.warn('Could not ensure tables (DB may need setup):', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Sparemoto Express API running on http://localhost:${PORT}`);
    console.log(`Admin password: ${getAdminPassword()}`);
  });
}

start();
