const fs = require("fs");

// Read current route.ts
let content = fs.readFileSync("src/app/api/[[...route]]/route.ts", "utf8");

// Add imports for user auth
const oldImport = `import {\n  buildAdminSessionCookie,\n  buildExpiredAdminSessionCookie,\n  getAdminPassword,\n  isAdminRequest,\n} from "@/lib/admin-auth";`;

const newImport = oldImport + `
import {\n  buildSessionCookie,\n  buildExpiredSessionCookie,\n  getSessionTokenFromRequest,\n  getSessionUser,\n  registerUser,\n  loginUser,\n  createSession,\n  deleteSession,\n  getUserCart,\n  addToUserCart,\n  updateCartItem,\n  clearUserCart,\n} from "@/lib/user-auth";`;

content = content.replace(oldImport, newImport);

// Add auth/cart routes before the notFound handler
const notFoundBlock = `app.notFound(() => error("Route not found.", 404));`;

const authCartRoutes = `// Auth routes
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
    const token = await createSession(user.id, c.req.raw);
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
  if (!token) return json({ user: null });
  const user = await getSessionUser(token);
  return json({ user });
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

` + notFoundBlock;

content = content.replace(notFoundBlock, authCartRoutes);

fs.writeFileSync("src/app/api/[[...route]]/route.ts", content);
console.log("Updated route.ts with auth + cart API routes");
console.log("New line count:", content.split("\n").length);
