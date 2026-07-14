import { createHash } from "node:crypto";

import type { Product } from "@/data/products";
import { categories as seedCategories, products as seedProducts } from "@/data/products";
import { getCloudflareEnv, getD1Database, type D1Database } from "@/lib/cloudflare";
import { getDiscountRate, getShippingFee, roundCurrency } from "@/lib/commerce";
import type {
  DemoOrderInput,
  DemoOrderLookupOrder,
  DemoOrderReceipt,
  DemoOrderReportItem,
  DemoOrderStatus,
} from "@/types/demo-orders";

const CREATE_PRODUCTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  description TEXT NOT NULL,
  specs TEXT NOT NULL,
  in_stock INTEGER NOT NULL DEFAULT 1,
  stock_count INTEGER NOT NULL DEFAULT 0,
  badge TEXT,
  rating REAL NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  image_public_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const CREATE_PRODUCTS_CATEGORY_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_products_category_slug ON products(category_slug)";

const CREATE_PRODUCTS_NAME_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)";
const ADD_PRODUCTS_STOCK_COUNT_COLUMN_SQL =
  "ALTER TABLE products ADD COLUMN stock_count INTEGER NOT NULL DEFAULT 0";
const CREATE_DEMO_ORDERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS demo_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id TEXT,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address_line_1 TEXT NOT NULL,
  shipping_address_line_2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  total_items INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  discount_code TEXT,
  discount_amount REAL NOT NULL DEFAULT 0,
  shipping_fee REAL NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  cancel_reason TEXT,
  cancelled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;
const CREATE_DEMO_ORDER_ITEMS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS demo_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  line_total REAL NOT NULL,
  stock_after INTEGER NOT NULL,
  item_status TEXT NOT NULL DEFAULT 'confirmed',
  cancel_reason TEXT,
  cancelled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES demo_orders(id) ON DELETE CASCADE
)`;
const CREATE_REVIEWS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS product_reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id TEXT,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  verified_purchase INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;
const CREATE_REVIEWS_PRODUCT_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id)";

const CREATE_DEMO_ORDERS_CREATED_AT_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_demo_orders_created_at ON demo_orders(created_at DESC)";
const CREATE_DEMO_ORDER_ITEMS_ORDER_ID_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_demo_order_items_order_id ON demo_order_items(order_id)";

const ORDER_TABLE_MIGRATIONS = [
  "ALTER TABLE demo_orders ADD COLUMN user_id TEXT",
  "ALTER TABLE demo_orders ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed'",
  "ALTER TABLE demo_orders ADD COLUMN cancel_reason TEXT",
  "ALTER TABLE demo_orders ADD COLUMN cancelled_at TEXT",
  "ALTER TABLE demo_order_items ADD COLUMN item_status TEXT NOT NULL DEFAULT 'confirmed'",
  "ALTER TABLE demo_order_items ADD COLUMN cancel_reason TEXT",
  "ALTER TABLE demo_order_items ADD COLUMN cancelled_at TEXT",
];

type ProductRow = {
  id: string;
  name: string;
  category: string;
  category_slug: string;
  price: number;
  original_price: number | null;
  description: string;
  specs: string;
  in_stock: number;
  stock_count: number | null;
  badge: string | null;
  rating: number;
  reviews: number;
  image_url: string | null;
  image_public_id: string | null;
  created_at: string;
  updated_at: string;
};

type UserReviewRow = {
  id: string;
  product_id: string;
  user_id: string | null;
  author: string;
  rating: number;
  title: string;
  body: string;
  verified_purchase: number;
  created_at: string;
};

export interface UserReviewResult {
  id: string;
  productId: string;
  userId: string | null;
  author: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export async function createUserReview(input: {
  productId: string;
  userId?: string | null;
  author: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase?: boolean;
}) {
  if (input.rating < 1 || input.rating > 5) {
    throw new CatalogError("Rating must be between 1 and 5.");
  }
  if (!input.author.trim()) {
    throw new CatalogError("Author name is required.");
  }
  if (!input.title.trim()) {
    throw new CatalogError("Review title is required.");
  }
  if (!input.body.trim()) {
    throw new CatalogError("Review body is required.");
  }

  const db = await ensureSeeded();
  if (!db) {
    throw new Error("D1 binding DB is not configured.");
  }

  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO product_reviews (id, product_id, user_id, author, rating, title, body, verified_purchase)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.productId,
      input.userId ?? null,
      input.author.trim(),
      input.rating,
      input.title.trim(),
      input.body.trim(),
      input.verifiedPurchase ? 1 : 0
    )
    .run();

  return getReviewById(id);
}

export async function getReviewById(reviewId: string) {
  const db = await ensureSeeded();
  if (!db) return null;

  const row = await db
    .prepare("SELECT * FROM product_reviews WHERE id = ?")
    .bind(reviewId)
    .first<UserReviewRow>();

  if (!row) return null;
  return rowToUserReview(row);
}

export async function getReviewsByProduct(productId: string): Promise<UserReviewResult[]> {
  const db = await ensureSeeded();
  if (!db) return [];

  const result = await db
    .prepare(
      "SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC"
    )
    .bind(productId)
    .all<UserReviewRow>();

  return (result.results ?? []).map(rowToUserReview);
}

function rowToUserReview(row: UserReviewRow): UserReviewResult {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    author: row.author,
    rating: row.rating,
    title: row.title,
    body: row.body,
    verifiedPurchase: row.verified_purchase === 1,
    createdAt: row.created_at,
  };
}

type DemoOrderReportRow = {
  order_id: string;
  order_number: string;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  product_id: string;
  product_name: string;
  product_category: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  stock_after: number;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
};

type DemoOrderLookupRow = {
  order_id: string;
  order_number: string;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  user_id: string | null;
  total_items: number;
  subtotal: number;
  discount_code: string | null;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  status: string;
  cancel_reason: string | null;
  cancelled_at: string | null;
  product_id: string | null;
  product_name: string | null;
  product_category: string | null;
  quantity: number | null;
  unit_price: number | null;
  line_total: number | null;
  stock_after: number | null;
  item_status: string | null;
  item_cancel_reason: string | null;
  item_cancelled_at: string | null;
};

export interface ProductInput {
  id?: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number | null;
  description: string;
  specs: string[];
  inStock: boolean;
  stockCount: number;
  badge?: string | null;
  rating: number;
  reviews: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
}

export class CatalogError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CatalogError";
    this.status = status;
  }
}

function normalizeStockCount(stockCount: number | null | undefined, fallbackInStock: boolean) {
  if (typeof stockCount === "number" && Number.isFinite(stockCount)) {
    return Math.max(0, Math.floor(stockCount));
  }

  return fallbackInStock ? 12 : 0;
}

async function getReservedStockMap(db: D1Database): Promise<Map<string, number>> {
  try {
    const now = new Date().toISOString();
    const result = await db
      .prepare(
        `SELECT product_id, SUM(quantity) AS reserved_qty
         FROM user_cart_items
         WHERE reserved_until > ?
         GROUP BY product_id`
      )
      .bind(now)
      .all<{ product_id: string; reserved_qty: number }>();

    const map = new Map<string, number>();
    for (const row of result.results ?? []) {
      map.set(row.product_id, row.reserved_qty);
    }
    return map;
  } catch {
    return new Map();
  }
}

function normalizeProductStock(product: Product): Product {
  const stockCount = normalizeStockCount(product.stockCount, product.inStock);
  return {
    ...product,
    stockCount,
    inStock: stockCount > 0,
  };
}

function rowToProduct(row: ProductRow): Product {
  const stockCount = normalizeStockCount(row.stock_count, row.in_stock === 1);

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categorySlug: row.category_slug,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    description: row.description,
    specs: JSON.parse(row.specs) as string[],
    inStock: stockCount > 0,
    stockCount,
    badge: row.badge ?? undefined,
    rating: row.rating,
    reviews: row.reviews,
    imageUrl: row.image_url ?? undefined,
    imagePublicId: row.image_public_id ?? undefined,
  };
}

function seedRow(product: Product) {
  const stockCount = normalizeStockCount(product.stockCount, product.inStock);

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    categorySlug: product.categorySlug,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    description: product.description,
    specs: JSON.stringify(product.specs),
    inStock: stockCount > 0 ? 1 : 0,
    stockCount,
    badge: product.badge ?? null,
    rating: product.rating,
    reviews: product.reviews,
    imageUrl: product.imageUrl ?? null,
    imagePublicId: product.imagePublicId ?? null,
  };
}

function slugifyId(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "product"}-${crypto.randomUUID().slice(0, 8)}`;
}

function generateDemoOrderNumber() {
  const now = new Date();
  const dateStamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(
    now.getUTCDate()
  ).padStart(2, "0")}`;

  return `MP-${dateStamp}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

function requireText(value: string | undefined, field: string) {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    throw new CatalogError(`${field} is required.`);
  }

  return normalized;
}

function formatCustomerName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

async function ensureSeeded(retries = 3, delay = 100) {
  const db = await getD1Database().catch(() => null);
  if (!db) {
    return null;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await doEnsureSeeded(db);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      const isBusy = message.includes("sqlite_busy") || message.includes("database is locked");
      if (!isBusy || attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
}

async function doEnsureSeeded(db: D1Database) {
  await db.prepare(CREATE_PRODUCTS_TABLE_SQL).run();
  await db.prepare(CREATE_PRODUCTS_CATEGORY_INDEX_SQL).run();
  await db.prepare(CREATE_PRODUCTS_NAME_INDEX_SQL).run();
  await db.prepare(CREATE_DEMO_ORDERS_TABLE_SQL).run();
  await db.prepare(CREATE_DEMO_ORDER_ITEMS_TABLE_SQL).run();
  await db.prepare(CREATE_DEMO_ORDERS_CREATED_AT_INDEX_SQL).run();
  await db.prepare(CREATE_DEMO_ORDER_ITEMS_ORDER_ID_INDEX_SQL).run();
  await db.prepare(CREATE_REVIEWS_TABLE_SQL).run();
  await db.prepare(CREATE_REVIEWS_PRODUCT_INDEX_SQL).run();
  try {
    await db.prepare(ADD_PRODUCTS_STOCK_COUNT_COLUMN_SQL).run();
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (!message.includes("duplicate column")) {
      throw error;
    }
  }

  for (const migration of ORDER_TABLE_MIGRATIONS) {
    try {
      await db.prepare(migration).run();
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (!message.includes("duplicate column")) {
        throw error;
      }
    }
  }

  const existing = await db.prepare("SELECT COUNT(*) AS count FROM products").first<{ count: number }>();

  if ((existing?.count ?? 0) > 0) {
    return db;
  }

  await db.batch(
    seedProducts.map((product) => {
      const row = seedRow(product);
      return db
        .prepare(
          `INSERT OR IGNORE INTO products (
            id, name, category, category_slug, price, original_price,
            description, specs, in_stock, stock_count, badge, rating, reviews,
            image_url, image_public_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          row.id,
          row.name,
          row.category,
          row.categorySlug,
          row.price,
          row.originalPrice,
          row.description,
          row.specs,
          row.inStock,
          row.stockCount,
          row.badge,
          row.rating,
          row.reviews,
          row.imageUrl,
          row.imagePublicId
        );
    })
  );

  return db;
}

async function fetchProductRow(id: string) {
  const db = await ensureSeeded();
  if (!db) {
    return null;
  }

  return db.prepare("SELECT * FROM products WHERE id = ?").bind(id).first<ProductRow>();
}

export async function listProducts(params: {
  search?: string;
  categorySlug?: string;
  sortBy?: "name" | "price-low" | "price-high" | "rating";
} = {}) {
  const db = await ensureSeeded();
  if (!db) {
    let products = seedProducts.map((product) => normalizeProductStock(product));

    if (params.search?.trim()) {
      const query = params.search.trim().toLowerCase();
      products = products.filter((product) =>
        `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query)
      );
    }

    if (params.categorySlug && params.categorySlug !== "all") {
      products = products.filter((product) => product.categorySlug === params.categorySlug);
    }

    switch (params.sortBy) {
      case "price-low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return products;
  }

  const clauses: string[] = [];
  const binds: Array<string | number> = [];

  if (params.search?.trim()) {
    clauses.push("LOWER(name || ' ' || category || ' ' || description) LIKE ?");
    binds.push(`%${params.search.trim().toLowerCase()}%`);
  }

  if (params.categorySlug && params.categorySlug !== "all") {
    clauses.push("category_slug = ?");
    binds.push(params.categorySlug);
  }

  const orderBy =
    params.sortBy === "price-low"
      ? "price ASC, name ASC"
      : params.sortBy === "price-high"
        ? "price DESC, name ASC"
        : params.sortBy === "rating"
          ? "rating DESC, reviews DESC, name ASC"
          : "name ASC";

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await db
    .prepare(`SELECT * FROM products ${where} ORDER BY ${orderBy}`)
    .bind(...binds)
    .all<ProductRow>();

  const products = result.results.map(rowToProduct);

  // Subtract active reservations from available stock
  const reserved = await getReservedStockMap(db);
  return products.map((p) => {
    const reservedQty = reserved.get(p.id) ?? 0;
    if (reservedQty <= 0) return p;
    const adjustedStock = Math.max(0, (p.stockCount ?? 0) - reservedQty);
    return { ...p, stockCount: adjustedStock, inStock: adjustedStock > 0 };
  });
}

export async function getProductById(id: string) {
  const row = await fetchProductRow(id);
  if (row) {
    const product = rowToProduct(row);
    const db = await getD1Database().catch(() => null);
    if (db) {
      const reserved = await getReservedStockMap(db);
      const reservedQty = reserved.get(product.id) ?? 0;
      if (reservedQty > 0) {
        const adjustedStock = Math.max(0, (product.stockCount ?? 0) - reservedQty);
        return { ...product, stockCount: adjustedStock, inStock: adjustedStock > 0 };
      }
    }
    return product;
  }

  const seed = seedProducts.find((product) => product.id === id);
  return seed ? normalizeProductStock(seed) : null;
}

export async function listCategories() {
  const products = await listProducts();
  const counts = new Map<string, number>();

  for (const product of products) {
    counts.set(product.categorySlug, (counts.get(product.categorySlug) ?? 0) + 1);
  }

  return seedCategories.map((category) => ({
    ...category,
    count: counts.get(category.slug) ?? 0,
  }));
}

export async function getCategoryBySlug(slug: string) {
  const categories = await listCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProductsByCategory(slug: string) {
  return listProducts({ categorySlug: slug });
}

export async function getFeaturedProducts() {
  const products = await listProducts();
  return products
    .filter((product) => product.badge || (product.originalPrice && product.originalPrice > product.price))
    .slice(0, 8);
}

export async function createProduct(input: ProductInput) {
  const db = await ensureSeeded();
  if (!db) {
    throw new Error("D1 binding DB is not configured.");
  }
  const id = input.id?.trim() || slugifyId(input.name);
  const stockCount = normalizeStockCount(input.stockCount, input.inStock);

  await db
    .prepare(
      `INSERT INTO products (
        id, name, category, category_slug, price, original_price,
        description, specs, in_stock, stock_count, badge, rating, reviews,
        image_url, image_public_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.name.trim(),
      input.category.trim(),
      input.categorySlug.trim(),
      input.price,
      input.originalPrice ?? null,
      input.description.trim(),
      JSON.stringify(input.specs),
      stockCount > 0 ? 1 : 0,
      stockCount,
      input.badge ?? null,
      input.rating,
      input.reviews,
      input.imageUrl ?? null,
      input.imagePublicId ?? null
    )
    .run();

  return getProductById(id);
}

export async function updateProduct(id: string, input: ProductInput) {
  const existing = await getProductById(id);
  if (!existing) {
    return null;
  }
  const stockCount = normalizeStockCount(input.stockCount, input.inStock);

  const next = {
    ...existing,
    ...input,
    id,
    inStock: stockCount > 0,
    stockCount,
    imageUrl: input.imageUrl ?? existing.imageUrl,
    imagePublicId: input.imagePublicId ?? existing.imagePublicId,
  };

  const db = await ensureSeeded();
  if (!db) {
    throw new Error("D1 binding DB is not configured.");
  }
  await db
    .prepare(
      `UPDATE products SET
        name = ?, category = ?, category_slug = ?, price = ?, original_price = ?,
        description = ?, specs = ?, in_stock = ?, stock_count = ?, badge = ?, rating = ?, reviews = ?,
        image_url = ?, image_public_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .bind(
      next.name.trim(),
      next.category.trim(),
      next.categorySlug.trim(),
      next.price,
      next.originalPrice ?? null,
      next.description.trim(),
      JSON.stringify(next.specs),
      next.stockCount > 0 ? 1 : 0,
      next.stockCount,
      next.badge ?? null,
      next.rating,
      next.reviews,
      next.imageUrl ?? null,
      next.imagePublicId ?? null,
      id
    )
    .run();

  return getProductById(id);
}

export async function deleteProduct(id: string) {
  const existing = await getProductById(id);
  if (!existing) {
    return null;
  }

  const db = await ensureSeeded();
  if (!db) {
    throw new Error("D1 binding DB is not configured.");
  }
  await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
  return existing;
}

function rowToDemoOrderReportItem(row: DemoOrderReportRow): DemoOrderReportItem {
  return {
    orderId: row.order_id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    customerName: formatCustomerName(row.customer_first_name, row.customer_last_name),
    customerEmail: row.customer_email,
    productId: row.product_id,
    productName: row.product_name,
    category: row.product_category,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    lineTotal: row.line_total,
    remainingStock: row.stock_after,
    subtotal: row.subtotal,
    discountAmount: row.discount_amount,
    shippingFee: row.shipping_fee,
  };
}

export async function listDemoOrderReportItems() {
  const db = await ensureSeeded();
  if (!db) {
    return [];
  }

  const result = await db
    .prepare(
      `SELECT
        o.id AS order_id,
        o.order_number,
        o.created_at,
        o.customer_first_name,
        o.customer_last_name,
        o.customer_email,
        i.product_id,
        i.product_name,
        i.product_category,
        i.quantity,
        i.unit_price,
        i.line_total,
        i.stock_after,
        o.subtotal,
        o.discount_amount,
        o.shipping_fee
      FROM demo_order_items i
      INNER JOIN demo_orders o ON o.id = i.order_id
      ORDER BY o.created_at DESC, i.created_at DESC, i.product_name ASC`
    )
    .all<DemoOrderReportRow>();

  return result.results.map(rowToDemoOrderReportItem);
}

export async function listDemoOrdersByEmail(email: string): Promise<DemoOrderLookupOrder[]> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return [];
  }

  const db = await ensureSeeded();
  if (!db) {
    return [];
  }

  const result = await db
    .prepare(
      `SELECT
        o.id AS order_id,
        o.order_number,
        o.created_at,
        o.customer_first_name,
        o.customer_last_name,
        o.customer_email,
        o.user_id,
        o.total_items,
        o.subtotal,
        o.discount_code,
        o.discount_amount,
        o.shipping_fee,
        o.total,
        o.status,
        o.cancel_reason,
        o.cancelled_at,
        i.product_id,
        i.product_name,
        i.product_category,
        i.quantity,
        i.unit_price,
        i.line_total,
        i.stock_after,
        i.item_status,
        i.cancel_reason AS item_cancel_reason,
        i.cancelled_at AS item_cancelled_at
      FROM demo_orders o
      LEFT JOIN demo_order_items i ON i.order_id = o.id
      WHERE LOWER(o.customer_email) = ?
      ORDER BY o.created_at DESC, i.product_name ASC`
    )
    .bind(normalizedEmail)
    .all<DemoOrderLookupRow>();

  const orders = new Map<string, DemoOrderLookupOrder>();

  for (const row of result.results) {
    const existing =
      orders.get(row.order_id) ??
      {
        id: row.order_id,
        orderNumber: row.order_number,
        customerName: formatCustomerName(row.customer_first_name, row.customer_last_name),
        customerEmail: row.customer_email,
        userId: row.user_id,
        totalItems: row.total_items,
        subtotal: row.subtotal,
        discountCode: row.discount_code,
        discountAmount: row.discount_amount,
        shippingFee: row.shipping_fee,
        total: row.total,
        createdAt: row.created_at,
        status: (row.status as DemoOrderStatus) || "confirmed",
        cancelReason: row.cancel_reason,
        cancelledAt: row.cancelled_at,
        items: [],
      };

    if (row.product_id && row.product_name && row.product_category && row.quantity && row.unit_price !== null && row.line_total !== null) {
      existing.items.push({
        productId: row.product_id,
        productName: row.product_name,
        category: row.product_category,
        quantity: row.quantity,
        unitPrice: row.unit_price,
        lineTotal: row.line_total,
        remainingStock: row.stock_after ?? 0,
        itemStatus: (row.item_status as DemoOrderStatus) || "confirmed",
        cancelReason: row.item_cancel_reason,
        cancelledAt: row.item_cancelled_at,
      });
    }

    orders.set(row.order_id, existing);
  }

  return Array.from(orders.values());
}

export async function createDemoOrder(input: DemoOrderInput & { userId?: string | null }): Promise<DemoOrderReceipt> {
  const db = await ensureSeeded();
  if (!db) {
    throw new Error("D1 binding DB is not configured.");
  }

  const firstName = requireText(input.customer?.firstName, "First name");
  const lastName = requireText(input.customer?.lastName, "Last name");
  const email = requireText(input.customer?.email, "Email");
  const phone = requireText(input.customer?.phone, "Phone");
  const addressLine1 = requireText(input.customer?.addressLine1, "Address line 1");
  const addressLine2 = input.customer?.addressLine2?.trim() || null;
  const city = requireText(input.customer?.city, "City");
  const state = requireText(input.customer?.state, "State / Province");
  const postalCode = requireText(input.customer?.postalCode, "ZIP / Postal Code");
  const country = requireText(input.customer?.country, "Country");

  const aggregatedItems = new Map<string, number>();
  for (const rawItem of input.items ?? []) {
    const productId = String(rawItem?.productId ?? "").trim();
    const quantity = Math.floor(Number(rawItem?.quantity ?? 0));

    if (!productId || quantity <= 0) {
      continue;
    }

    aggregatedItems.set(productId, (aggregatedItems.get(productId) ?? 0) + quantity);
  }

  if (aggregatedItems.size === 0) {
    throw new CatalogError("Cart is empty.");
  }

  const requestedItems = Array.from(aggregatedItems.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  const products = await Promise.all(requestedItems.map((item) => getProductById(item.productId)));
  const orderLines = requestedItems.map((item, index) => {
    const product = products[index];
    if (!product) {
      throw new CatalogError(`Product ${item.productId} was not found.`, 404);
    }

    const availableStock = normalizeStockCount(product.stockCount, product.inStock);
    if (availableStock <= 0) {
      throw new CatalogError(`${product.name} is out of stock.`, 409);
    }

    if (item.quantity > availableStock) {
      throw new CatalogError(`Only ${availableStock} of ${product.name} left in stock.`, 409);
    }

    return {
      product,
      quantity: item.quantity,
      availableStock,
      remainingStock: availableStock - item.quantity,
      unitPrice: product.price,
      lineTotal: roundCurrency(product.price * item.quantity),
    };
  });

  const subtotal = roundCurrency(orderLines.reduce((sum, item) => sum + item.lineTotal, 0));
  const rawDiscountCode = input.discountCode?.trim().toUpperCase() || null;
  const discountRate = getDiscountRate(rawDiscountCode);
  const discountCode = discountRate > 0 ? rawDiscountCode : null;
  const discountAmount = roundCurrency(subtotal * discountRate);
  const shippingFee = getShippingFee(subtotal);
  const total = roundCurrency(subtotal - discountAmount + shippingFee);
  const totalItems = orderLines.reduce((sum, item) => sum + item.quantity, 0);
  const createdAt = new Date().toISOString();
  const orderId = crypto.randomUUID();
  const orderNumber = generateDemoOrderNumber();
  const customerName = formatCustomerName(firstName, lastName);

  try {
    for (const line of orderLines) {
      await db
        .prepare(
          `UPDATE products
          SET stock_count = ?, in_stock = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`
        )
        .bind(line.remainingStock, line.remainingStock > 0 ? 1 : 0, line.product.id)
        .run();
    }

    await db
      .prepare(
        `INSERT INTO demo_orders (
          id, order_number, user_id, customer_first_name, customer_last_name, customer_email, customer_phone,
          shipping_address_line_1, shipping_address_line_2, shipping_city, shipping_state,
          shipping_postal_code, shipping_country, total_items, subtotal, discount_code,
          discount_amount, shipping_fee, total, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        orderId,
        orderNumber,
        input.userId ?? null,
        firstName,
        lastName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        totalItems,
        subtotal,
        discountCode,
        discountAmount,
        shippingFee,
        total,
        "confirmed",
        createdAt
      )
      .run();

    await db.batch(
      orderLines.map((line) =>
        db
          .prepare(
            `INSERT INTO demo_order_items (
              id, order_id, order_number, product_id, product_name, product_category,
              quantity, unit_price, line_total, stock_after, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            crypto.randomUUID(),
            orderId,
            orderNumber,
            line.product.id,
            line.product.name,
            line.product.category,
            line.quantity,
            line.unitPrice,
            line.lineTotal,
            line.remainingStock,
            createdAt
          )
      )
    );
  } catch (error) {
    try {
      await db.batch(
        orderLines.map((line) =>
          db
            .prepare(
              `UPDATE products
              SET stock_count = ?, in_stock = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`
            )
            .bind(line.availableStock, line.availableStock > 0 ? 1 : 0, line.product.id)
        )
      );
    } catch {
      // Best-effort rollback for demo data consistency.
    }

    try {
      await db.prepare("DELETE FROM demo_order_items WHERE order_id = ?").bind(orderId).run();
      await db.prepare("DELETE FROM demo_orders WHERE id = ?").bind(orderId).run();
    } catch {
      // Best-effort cleanup if order inserts partially succeeded.
    }

    throw error;
  }

  return {
    id: orderId,
    orderNumber,
    customerName,
    customerEmail: email,
    totalItems,
    subtotal,
    discountCode,
    discountAmount,
    shippingFee,
    total,
    createdAt,
    items: orderLines.map((line) => ({
      productId: line.product.id,
      productName: line.product.name,
      category: line.product.category,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
      remainingStock: line.remainingStock,
    })),
  };
}

export async function listDemoOrdersByUserId(userId: string): Promise<DemoOrderLookupOrder[]> {
  if (!userId) return [];

  const db = await ensureSeeded();
  if (!db) return [];

  const result = await db
    .prepare(
      `SELECT
        o.id AS order_id,
        o.order_number,
        o.created_at,
        o.customer_first_name,
        o.customer_last_name,
        o.customer_email,
        o.user_id,
        o.total_items,
        o.subtotal,
        o.discount_code,
        o.discount_amount,
        o.shipping_fee,
        o.total,
        o.status,
        o.cancel_reason,
        o.cancelled_at,
        i.product_id,
        i.product_name,
        i.product_category,
        i.quantity,
        i.unit_price,
        i.line_total,
        i.stock_after,
        i.item_status,
        i.cancel_reason AS item_cancel_reason,
        i.cancelled_at AS item_cancelled_at
      FROM demo_orders o
      LEFT JOIN demo_order_items i ON i.order_id = o.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC, i.product_name ASC`
    )
    .bind(userId)
    .all<DemoOrderLookupRow>();

  const orders = new Map<string, DemoOrderLookupOrder>();

  for (const row of result.results) {
    const existing =
      orders.get(row.order_id) ??
      {
        id: row.order_id,
        orderNumber: row.order_number,
        customerName: formatCustomerName(row.customer_first_name, row.customer_last_name),
        customerEmail: row.customer_email,
        userId: row.user_id,
        totalItems: row.total_items,
        subtotal: row.subtotal,
        discountCode: row.discount_code,
        discountAmount: row.discount_amount,
        shippingFee: row.shipping_fee,
        total: row.total,
        createdAt: row.created_at,
        status: (row.status as DemoOrderStatus) || "confirmed",
        cancelReason: row.cancel_reason,
        cancelledAt: row.cancelled_at,
        items: [],
      };

    if (row.product_id && row.product_name && row.product_category && row.quantity && row.unit_price !== null && row.line_total !== null) {
      existing.items.push({
        productId: row.product_id,
        productName: row.product_name,
        category: row.product_category,
        quantity: row.quantity,
        unitPrice: row.unit_price,
        lineTotal: row.line_total,
        remainingStock: row.stock_after ?? 0,
        itemStatus: (row.item_status as DemoOrderStatus) || "confirmed",
        cancelReason: row.item_cancel_reason,
        cancelledAt: row.item_cancelled_at,
      });
    }

    orders.set(row.order_id, existing);
  }

  return Array.from(orders.values());
}

export async function getDemoOrderById(orderId: string, userId?: string | null): Promise<DemoOrderLookupOrder | null> {
  const db = await ensureSeeded();
  if (!db) return null;

  let query = `SELECT
    o.id AS order_id,
    o.order_number,
    o.created_at,
    o.customer_first_name,
    o.customer_last_name,
    o.customer_email,
    o.user_id,
    o.total_items,
    o.subtotal,
    o.discount_code,
    o.discount_amount,
    o.shipping_fee,
    o.total,
    o.status,
    o.cancel_reason,
    o.cancelled_at,
    i.product_id,
    i.product_name,
    i.product_category,
    i.quantity,
    i.unit_price,
    i.line_total,
    i.stock_after,
    i.item_status,
    i.cancel_reason AS item_cancel_reason,
    i.cancelled_at AS item_cancelled_at
  FROM demo_orders o
  LEFT JOIN demo_order_items i ON i.order_id = o.id
  WHERE o.id = ?`;

  const params: (string | null)[] = [orderId];

  if (userId) {
    query += " AND o.user_id = ?";
    params.push(userId);
  }

  query += " ORDER BY i.product_name ASC";

  const result = await db.prepare(query).bind(...params).all<DemoOrderLookupRow>();

  if (result.results.length === 0) return null;

  const first = result.results[0];
  const order: DemoOrderLookupOrder = {
    id: first.order_id,
    orderNumber: first.order_number,
    customerName: formatCustomerName(first.customer_first_name, first.customer_last_name),
    customerEmail: first.customer_email,
    userId: first.user_id,
    totalItems: first.total_items,
    subtotal: first.subtotal,
    discountCode: first.discount_code,
    discountAmount: first.discount_amount,
    shippingFee: first.shipping_fee,
    total: first.total,
    createdAt: first.created_at,
    status: (first.status as DemoOrderStatus) || "confirmed",
    cancelReason: first.cancel_reason,
    cancelledAt: first.cancelled_at,
    items: [],
  };

  for (const row of result.results) {
    if (row.product_id && row.product_name && row.product_category && row.quantity && row.unit_price !== null && row.line_total !== null) {
      order.items.push({
        productId: row.product_id,
        productName: row.product_name,
        category: row.product_category,
        quantity: row.quantity,
        unitPrice: row.unit_price,
        lineTotal: row.line_total,
        remainingStock: row.stock_after ?? 0,
        itemStatus: (row.item_status as DemoOrderStatus) || "confirmed",
        cancelReason: row.item_cancel_reason,
        cancelledAt: row.item_cancelled_at,
      });
    }
  }

  return order;
}

export async function cancelDemoOrder(orderId: string, userId: string, reason: string): Promise<DemoOrderLookupOrder | null> {
  const db = await ensureSeeded();
  if (!db) throw new Error("D1 binding DB is not configured.");

  const order = await getDemoOrderById(orderId, userId);
  if (!order) throw new CatalogError("Order not found.", 404);
  if (order.status === "cancelled") throw new CatalogError("Order is already cancelled.");
  if (!reason.trim()) throw new CatalogError("Cancellation reason is required.");

  const now = new Date().toISOString();

  await db
    .prepare(
      `UPDATE demo_orders SET status = 'cancelled', cancel_reason = ?, cancelled_at = ? WHERE id = ?`
    )
    .bind(reason.trim(), now, orderId)
    .run();

  await db
    .prepare(
      `UPDATE demo_order_items SET item_status = 'cancelled', cancel_reason = ?, cancelled_at = ? WHERE order_id = ?`
    )
    .bind(reason.trim(), now, orderId)
    .run();

  return getDemoOrderById(orderId, userId);
}

export async function cancelDemoOrderItem(
  orderId: string,
  itemId: string,
  userId: string,
  reason: string
): Promise<DemoOrderLookupOrder | null> {
  const db = await ensureSeeded();
  if (!db) throw new Error("D1 binding DB is not configured.");

  const order = await getDemoOrderById(orderId, userId);
  if (!order) throw new CatalogError("Order not found.", 404);
  if (order.status === "cancelled") throw new CatalogError("Order is already cancelled.");
  if (!reason.trim()) throw new CatalogError("Cancellation reason is required.");

  const item = order.items.find((i) => i.productId === itemId);
  if (!item) throw new CatalogError("Order item not found.", 404);
  if (item.itemStatus === "cancelled") throw new CatalogError("Item is already cancelled.");

  const now = new Date().toISOString();

  await db
    .prepare(
      `UPDATE demo_order_items SET item_status = 'cancelled', cancel_reason = ?, cancelled_at = ? WHERE order_id = ? AND product_id = ?`
    )
    .bind(reason.trim(), now, orderId, itemId)
    .run();

  // Check if all items are now cancelled
  const updatedOrder = await getDemoOrderById(orderId, userId);
  if (updatedOrder) {
    const allCancelled = updatedOrder.items.every((i) => i.itemStatus === "cancelled");
    const someCancelled = updatedOrder.items.some((i) => i.itemStatus === "cancelled");

    if (allCancelled) {
      await db
        .prepare(`UPDATE demo_orders SET status = 'cancelled', cancel_reason = 'All items cancelled', cancelled_at = ? WHERE id = ?`)
        .bind(now, orderId)
        .run();
    } else if (someCancelled) {
      await db
        .prepare(`UPDATE demo_orders SET status = 'partially_cancelled' WHERE id = ?`)
        .bind(orderId)
        .run();
    }
  }

  return getDemoOrderById(orderId, userId);
}

export async function getReviewsByUserId(userId: string): Promise<UserReviewResult[]> {
  const db = await ensureSeeded();
  if (!db) return [];

  const result = await db
    .prepare(
      "SELECT * FROM product_reviews WHERE user_id = ? ORDER BY created_at DESC"
    )
    .bind(userId)
    .all<UserReviewRow>();

  return (result.results ?? []).map(rowToUserReview);
}

export async function deleteReviewById(reviewId: string, userId: string): Promise<boolean> {
  const db = await ensureSeeded();
  if (!db) throw new Error("D1 binding DB is not configured.");

  const review = await getReviewById(reviewId);
  if (!review) throw new CatalogError("Review not found.", 404);
  if (review.userId !== userId) throw new CatalogError("You can only delete your own reviews.", 403);

  await db.prepare("DELETE FROM product_reviews WHERE id = ?").bind(reviewId).run();
  return true;
}

export function parseCloudinarySignature(params: Record<string, string | number>, apiSecret: string) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${sorted}${apiSecret}`).digest("hex");
}

export async function uploadToCloudinary(file: File) {
  const env = await getCloudflareEnv();

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = parseCloudinarySignature({ timestamp }, env.CLOUDINARY_API_SECRET);
  const form = new FormData();
  form.append("file", file, file.name);
  form.append("api_key", env.CLOUDINARY_API_KEY);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
  };

  return {
    imageUrl: data.secure_url,
    imagePublicId: data.public_id,
    width: data.width ?? null,
    height: data.height ?? null,
  };
}
