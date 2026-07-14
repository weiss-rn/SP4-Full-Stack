// import { Express } from "express";
import { Hono } from "hono";

import {
  buildAdminSessionCookie,
  buildExpiredAdminSessionCookie,
  getAdminPassword,
  isAdminRequest,
} from "@/lib/admin-auth";
import {
  buildSessionCookie,
  buildExpiredSessionCookie,
  getSessionTokenFromRequest,
  getSessionUser,
  registerUser,
  loginUser,
  createSession,
  deleteSession,
  getUserCart,
  addToUserCart,
  updateCartItem,
  clearUserCart,
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  changePassword,
} from "@/lib/user-auth";
import {
  CatalogError,
  createDemoOrder,
  createProduct,
  createUserReview,
  deleteProduct,
  deleteReviewById,
  getCategoryBySlug,
  getDemoOrderById,
  getFeaturedProducts,
  getProductById,
  getProductsByCategory,
  getReviewsByProduct,
  getReviewsByUserId,
  listCategories,
  listDemoOrdersByEmail,
  listDemoOrdersByUserId,
  listProducts,
  cancelDemoOrder,
  cancelDemoOrderItem,
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

function requireAdmin(request: Request) {
  return isAdminRequest(request) ? null : error("Admin session required.", 401);
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

app.post("/api/admin/session", async (c) => {
  try {
    const payload = await parseJsonBody(c.req.raw);
    const password = String(payload.password ?? "");

    if (password !== getAdminPassword()) {
      return error("Invalid admin password.", 401);
    }

    const response = json({ ok: true });
    response.headers.set("set-cookie", buildAdminSessionCookie(c.req.raw));
    return response;
  } catch {
    return error("Invalid admin sign-in request.", 400);
  }
});

app.delete("/api/admin/session", (c) => {
  const response = json({ ok: true });
  response.headers.set("set-cookie", buildExpiredAdminSessionCookie(c.req.raw));
  return response;
});

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
  const adminError = requireAdmin(c.req.raw);
  if (adminError) {
    return adminError;
  }

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
  const adminError = requireAdmin(c.req.raw);
  if (adminError) {
    return adminError;
  }

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
  const adminError = requireAdmin(c.req.raw);
  if (adminError) {
    return adminError;
  }

  const product = await deleteProduct(c.req.param("id"));
  if (!product) {
    return error("Product not found.", 404);
  }

  return json({ product });
});

app.post("/api/reviews", async (c) => {
  try {
    const payload = await parseJsonBody(c.req.raw);
    const productId = String(payload.productId ?? "").trim();
    const rating = Number(payload.rating);
    const title = String(payload.title ?? "").trim();
    const body = String(payload.body ?? "").trim();

    if (!productId) return error("Product ID is required.");
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return error("Rating must be a number between 1 and 5.");
    }
    if (!title) return error("Review title is required.");
    if (!body) return error("Review body is required.");

    // Try to get the logged-in user for the author name
    let author = "Anonymous Rider";
    let userId: string | null = null;

    const token = getSessionTokenFromRequest(c.req.raw);
    if (token) {
      const user = await getSessionUser(token);
      if (user) {
        userId = user.id;
        author = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Anonymous Rider";
      }
    }

    const review = await createUserReview({
      productId,
      userId,
      author,
      rating: Math.round(rating),
      title,
      body,
      verifiedPurchase: false,
    });

    return json({ review }, 201);
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to submit review.", 400);
  }
});

app.get("/api/reviews/:productId", async (c) => {
  try {
    const reviews = await getReviewsByProduct(c.req.param("productId"));
    return json({ reviews });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to fetch reviews.", 400);
  }
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

    let userId: string | null = null;
    const token = getSessionTokenFromRequest(c.req.raw);
    if (token) {
      const user = await getSessionUser(token);
      if (user) userId = user.id;
    }

    const order = await createDemoOrder({ ...(payload as unknown as Parameters<typeof createDemoOrder>[0]), userId });
    return json({ order }, 201);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unable to create demo order.",
      err instanceof CatalogError ? err.status : 400
    );
  }
});

app.get("/api/demo-orders/lookup", async (c) => {
  const url = new URL(c.req.url);
  const email = url.searchParams.get("email") ?? "";

  if (!email.trim()) {
    return error("Email is required.");
  }

  const orders = await listDemoOrdersByEmail(email);
  return json({ orders });
});

app.post("/api/uploads/image", async (c) => {
  const adminError = requireAdmin(c.req.raw);
  if (adminError) {
    return adminError;
  }

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

// Auth routes
app.post("/api/auth/register", async (c) => {
  try {
    const body = await c.req.json() as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    if (!name || !email || !password) return error("Name, email, and password are required.");
    if (password.length < 6) return error("Password must be at least 6 characters.");
    const user = await registerUser(name, email, password);
    return json({ user }, 201);
  } catch (err) {
    return error(err instanceof Error ? err.message : "Registration failed.", 400);
  }
});

app.post("/api/auth/login", async (c) => {
  try {
    const body = await c.req.json() as Record<string, unknown>;
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    if (!email || !password) return error("Email and password are required.");
    const user = await loginUser(email, password);
    const token = await createSession(user.id);
    const response = json({ user });
    response.headers.set("set-cookie", buildSessionCookie(token, c.req.raw));
    return response;
  } catch (err) {
    return error(err instanceof Error ? err.message : "Login failed.", 401);
  }
});

app.delete("/api/auth/logout", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (token) await deleteSession(token);
  const response = json({ ok: true });
  response.headers.set("set-cookie", buildExpiredSessionCookie(c.req.raw));
  return response;
});

app.get("/api/auth/me", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return json({ user: null, addresses: [] });
  const user = await getSessionUser(token);
  if (!user) return json({ user: null, addresses: [] });

  const profile = await getUserProfile(user.id);
  const addresses = await getUserAddresses(user.id);
  return json({ user: profile ?? user, addresses });
});

app.patch("/api/auth/profile", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  try {
    const body = await c.req.json() as Record<string, unknown>;
    const profile = await updateUserProfile(user.id, {
      firstName: body.firstName !== undefined ? String(body.firstName) : undefined,
      lastName: body.lastName !== undefined ? String(body.lastName) : undefined,
      phoneNumber: body.phoneNumber !== undefined ? String(body.phoneNumber) : undefined,
    });
    return json({ user: profile });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to update profile.", 400);
  }
});

app.get("/api/auth/addresses", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return json({ addresses: [] });
  const user = await getSessionUser(token);
  if (!user) return json({ addresses: [] });
  const addresses = await getUserAddresses(user.id);
  return json({ addresses });
});

app.post("/api/auth/addresses", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  try {
    const body = await c.req.json() as Record<string, unknown>;
    const addresses = await addUserAddress(user.id, {
      label: String(body.label ?? ''),
      firstName: body.firstName !== undefined ? String(body.firstName) : undefined,
      lastName: body.lastName !== undefined ? String(body.lastName) : undefined,
      phoneNumber: body.phoneNumber !== undefined ? String(body.phoneNumber) : undefined,
      addressLine1: String(body.addressLine1 ?? ''),
      addressLine2: body.addressLine2 !== undefined ? String(body.addressLine2) : undefined,
      city: String(body.city ?? ''),
      state: String(body.state ?? ''),
      postalCode: String(body.postalCode ?? ''),
      country: String(body.country ?? ''),
      isDefault: Boolean(body.isDefault),
    });
    return json({ addresses });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to add address.", 400);
  }
});

app.patch("/api/auth/addresses/:id", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  try {
    const body = await c.req.json() as Record<string, unknown>;
    const addresses = await updateUserAddress(c.req.param("id"), user.id, {
      label: body.label !== undefined ? String(body.label) : undefined,
      firstName: body.firstName !== undefined ? String(body.firstName) : undefined,
      lastName: body.lastName !== undefined ? String(body.lastName) : undefined,
      phoneNumber: body.phoneNumber !== undefined ? String(body.phoneNumber) : undefined,
      addressLine1: body.addressLine1 !== undefined ? String(body.addressLine1) : undefined,
      addressLine2: body.addressLine2 !== undefined ? String(body.addressLine2) : undefined,
      city: body.city !== undefined ? String(body.city) : undefined,
      state: body.state !== undefined ? String(body.state) : undefined,
      postalCode: body.postalCode !== undefined ? String(body.postalCode) : undefined,
      country: body.country !== undefined ? String(body.country) : undefined,
      isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : undefined,
    });
    return json({ addresses });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to update address.", 400);
  }
});

app.delete("/api/auth/addresses/:id", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  try {
    await deleteUserAddress(c.req.param("id"), user.id);
    return json({ ok: true });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to delete address.", 400);
  }
});

app.patch("/api/auth/change-password", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  try {
    const body = await c.req.json() as Record<string, unknown>;
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");
    if (!currentPassword || !newPassword) return error("Current and new passwords are required.");
    if (newPassword.length < 6) return error("New password must be at least 6 characters.");
    await changePassword(user.id, currentPassword, newPassword);
    return json({ ok: true });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to change password.", 400);
  }
});

// User cart routes
app.get("/api/cart", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return json({ items: [] });
  const user = await getSessionUser(token);
  if (!user) return json({ items: [] });
  const items = await getUserCart(user.id);
  return json({ items });
});

app.post("/api/cart", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in to use cart sync.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired. Please sign in again.", 401);
  try {
    const body = await c.req.json() as Record<string, unknown>;
    const productId = String(body.productId ?? "").trim();
    const quantity = Math.max(1, Math.floor(Number(body.quantity ?? 1)));
    if (!productId) return error("Product ID is required.");
    const items = await addToUserCart(user.id, productId, quantity);
    return json({ items });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to add to cart.", 400);
  }
});

app.patch("/api/cart/:productId", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in to use cart sync.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired. Please sign in again.", 401);
  try {
    const body = await c.req.json() as Record<string, unknown>;
    const quantity = Math.floor(Number(body.quantity ?? 0));
    const items = await updateCartItem(user.id, c.req.param("productId"), quantity);
    return json({ items });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to update cart.", 400);
  }
});

app.delete("/api/cart", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return json({ ok: true });
  const user = await getSessionUser(token);
  if (!user) return json({ ok: true });
  await clearUserCart(user.id);
  return json({ ok: true });
});

app.delete("/api/cart/:productId", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in to use cart sync.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired. Please sign in again.", 401);
  const items = await updateCartItem(user.id, c.req.param("productId"), 0);
  return json({ items });
});

// User order history routes
app.get("/api/user/orders", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  const orders = await listDemoOrdersByUserId(user.id);
  return json({ orders });
});

app.get("/api/user/orders/:orderId", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  try {
    const order = await getDemoOrderById(c.req.param("orderId"), user.id);
    if (!order) return error("Order not found.", 404);
    return json({ order });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to fetch order.", 400);
  }
});

app.post("/api/user/orders/:orderId/cancel", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  try {
    const payload = await parseJsonBody(c.req.raw);
    const reason = String(payload.reason ?? "").trim();
    if (!reason) return error("Cancellation reason is required.");
    const order = await cancelDemoOrder(c.req.param("orderId"), user.id, reason);
    return json({ order });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unable to cancel order.",
      err instanceof CatalogError ? err.status : 400
    );
  }
});

app.post("/api/user/orders/:orderId/items/:itemId/cancel", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  try {
    const payload = await parseJsonBody(c.req.raw);
    const reason = String(payload.reason ?? "").trim();
    if (!reason) return error("Cancellation reason is required.");
    const order = await cancelDemoOrderItem(
      c.req.param("orderId"),
      c.req.param("itemId"),
      user.id,
      reason
    );
    return json({ order });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unable to cancel item.",
      err instanceof CatalogError ? err.status : 400
    );
  }
});

// User review history routes
app.get("/api/user/reviews", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  const reviews = await getReviewsByUserId(user.id);
  return json({ reviews });
});

app.delete("/api/user/reviews/:reviewId", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token) return error("Please sign in.", 401);
  const user = await getSessionUser(token);
  if (!user) return error("Session expired.", 401);
  try {
    await deleteReviewById(c.req.param("reviewId"), user.id);
    return json({ ok: true });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unable to delete review.",
      err instanceof CatalogError ? err.status : 400
    );
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
