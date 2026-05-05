import { createHash } from "node:crypto";

import type { Product } from "../data/products";
import { categories as seedCategories, products as seedProducts } from "../data/products";
import { getCloudflareEnv, getD1Database } from "./cloudflare";
import { getDiscountRate, getShippingFee, roundCurrency } from "./commerce";
import type { DemoOrderInput, DemoOrderReceipt, DemoOrderReportItem } from "../types/demo-orders";

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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES demo_orders(id) ON DELETE CASCADE
)`;
const CREATE_DEMO_ORDERS_CREATED_AT_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_demo_orders_created_at ON demo_orders(created_at DESC)";
const CREATE_DEMO_ORDER_ITEMS_ORDER_ID_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS idx_demo_order_items_order_id ON demo_order_items(order_id)";

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
    image: row.image_url ?? "",
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
    imageUrl: product.imageUrl ?? product.image ?? null,
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

async function ensureSeeded() {
  const db = await getD1Database().catch(() => null);
  if (!db) {
    return null;
  }

  await db.prepare(CREATE_PRODUCTS_TABLE_SQL).run();
  await db.prepare(CREATE_PRODUCTS_CATEGORY_INDEX_SQL).run();
  await db.prepare(CREATE_PRODUCTS_NAME_INDEX_SQL).run();
  await db.prepare(CREATE_DEMO_ORDERS_TABLE_SQL).run();
  await db.prepare(CREATE_DEMO_ORDER_ITEMS_TABLE_SQL).run();
  await db.prepare(CREATE_DEMO_ORDERS_CREATED_AT_INDEX_SQL).run();
  await db.prepare(CREATE_DEMO_ORDER_ITEMS_ORDER_ID_INDEX_SQL).run();
  try {
    await db.prepare(ADD_PRODUCTS_STOCK_COUNT_COLUMN_SQL).run();
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (!message.includes("duplicate column")) {
      throw error;
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
          `INSERT INTO products (
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

  return result.results.map(rowToProduct);
}

export async function getProductById(id: string) {
  const row = await fetchProductRow(id);
  if (row) {
    return rowToProduct(row);
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
    image: input.imageUrl ?? existing.imageUrl ?? existing.image,
    imageUrl: input.imageUrl ?? existing.imageUrl ?? existing.image ?? undefined,
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
        i.stock_after
      FROM demo_order_items i
      INNER JOIN demo_orders o ON o.id = i.order_id
      ORDER BY o.created_at DESC, i.created_at DESC, i.product_name ASC`
    )
    .all<DemoOrderReportRow>();

  return result.results.map(rowToDemoOrderReportItem);
}

export async function createDemoOrder(input: DemoOrderInput): Promise<DemoOrderReceipt> {
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
          id, order_number, customer_first_name, customer_last_name, customer_email, customer_phone,
          shipping_address_line_1, shipping_address_line_2, shipping_city, shipping_state,
          shipping_postal_code, shipping_country, total_items, subtotal, discount_code,
          discount_amount, shipping_fee, total, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        orderId,
        orderNumber,
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

export function parseCloudinarySignature(params: Record<string, string | number>, apiSecret: string) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${sorted}${apiSecret}`).digest("hex");
}

export async function uploadToCloudinary(file: Blob & { name?: string }) {
  const env = await getCloudflareEnv();

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = parseCloudinarySignature({ timestamp }, env.CLOUDINARY_API_SECRET);
  const form = new FormData();
  form.append("file", file, file.name?.trim() || "upload.bin");
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
