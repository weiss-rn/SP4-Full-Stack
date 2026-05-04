// import { Express } from "express";
import { Hono } from "hono";

import {
  CatalogError,
  createDemoOrder,
  createProduct,
  deleteProduct,
  getCategoryBySlug,
  getFeaturedProducts,
  getProductById,
  getProductsByCategory,
  listCategories,
  listProducts,
  updateProduct,
  uploadToCloudinary,
} from "@/lib/catalog";

const app = new Hono();

function json<T>(data: T, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function error(message: string, status = 400) {
  return json({ error: message }, status);
}

function toBool(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true" || value === "1";
  }

  return false;
}

function parseSpecs(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function parseNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return parseNumber(value);
}

function requireNumber(value: unknown, field: string) {
  const parsed = parseNumber(value);
  if (parsed === null) {
    throw new Error(`${field} must be a number.`);
  }

  return parsed;
}

function parsePayload(payload: Record<string, unknown>) {
  const name = String(payload.name ?? "").trim();
  const category = String(payload.category ?? "").trim();
  const categorySlug = String(payload.categorySlug ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const specs = parseSpecs(payload.specs);

  if (!name || !category || !categorySlug || !description || specs.length === 0) {
    throw new Error("Missing required product fields.");
  }

  const parsedStockCount = parseNumber(payload.stockCount);
  const stockCount =
    parsedStockCount !== null ? Math.max(0, Math.floor(parsedStockCount)) : toBool(payload.inStock) ? 12 : 0;

  return {
    id: typeof payload.id === "string" ? payload.id.trim() : undefined,
    name,
    category,
    categorySlug,
    price: requireNumber(payload.price, "Price"),
    originalPrice: parseNullableNumber(payload.originalPrice),
    description,
    specs,
    inStock: stockCount > 0,
    stockCount,
    badge: typeof payload.badge === "string" && payload.badge.trim() ? payload.badge.trim() : null,
    rating: requireNumber(payload.rating, "Rating"),
    reviews: requireNumber(payload.reviews, "Reviews"),
    imageUrl: typeof payload.imageUrl === "string" && payload.imageUrl.trim() ? payload.imageUrl.trim() : null,
    imagePublicId: typeof payload.imagePublicId === "string" && payload.imagePublicId.trim() ? payload.imagePublicId.trim() : null,
  };
}

async function parseJsonBody(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    throw new Error("Invalid JSON body.");
  }

  return body;
}

app.get("/api/products", async (c) => {
  const url = new URL(c.req.url);
  const products = await listProducts({
    search: url.searchParams.get("q") ?? undefined,
    categorySlug: url.searchParams.get("category") ?? undefined,
    sortBy: (url.searchParams.get("sort") as "name" | "price-low" | "price-high" | "rating" | null) ?? undefined,
  });

  return json({ products });
});

app.get("/api/products/:id", async (c) => {
  const product = await getProductById(c.req.param("id"));
  if (!product) {
    return error("Product not found.", 404);
  }

  return json({ product });
});

app.post("/api/products", async (c) => {
  try {
    const payload = await parseJsonBody(c.req.raw);
    const product = await createProduct(parsePayload(payload));
    return json({ product }, 201);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unable to create product.",
      err instanceof CatalogError ? err.status : 400
    );
  }
});

app.patch("/api/products/:id", async (c) => {
  try {
    const payload = await parseJsonBody(c.req.raw);
    const product = await updateProduct(c.req.param("id"), parsePayload({ id: c.req.param("id"), ...payload }));

    if (!product) {
      return error("Product not found.", 404);
    }

    return json({ product });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unable to update product.",
      err instanceof CatalogError ? err.status : 400
    );
  }
});

app.delete("/api/products/:id", async (c) => {
  const product = await deleteProduct(c.req.param("id"));
  if (!product) {
    return error("Product not found.", 404);
  }

  return json({ product });
});

app.get("/api/categories", async () => {
  const categories = await listCategories();
  return json({ categories });
});

app.get("/api/categories/:slug", async (c) => {
  const category = await getCategoryBySlug(c.req.param("slug"));
  if (!category) {
    return error("Category not found.", 404);
  }

  const products = await getProductsByCategory(category.slug);
  return json({ category, products });
});

app.get("/api/featured", async () => {
  const products = await getFeaturedProducts();
  return json({ products });
});

app.post("/api/demo-orders", async (c) => {
  try {
    const payload = await parseJsonBody(c.req.raw);
    const order = await createDemoOrder(payload as unknown as Parameters<typeof createDemoOrder>[0]);
    return json({ order }, 201);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unable to create demo order.",
      err instanceof CatalogError ? err.status : 400
    );
  }
});

app.post("/api/uploads/image", async (c) => {
  try {
    const formData = await c.req.raw.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return error("Expected a file upload.");
    }

    const upload = await uploadToCloudinary(file);
    return json({ upload }, 201);
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to upload image.");
  }
});

app.notFound(() => error("Route not found.", 404));

async function handler(request: Request) {
  return app.fetch(request);
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
