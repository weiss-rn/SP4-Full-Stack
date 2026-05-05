import express from "express";
import multer from "multer";

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
} from "../lib/catalog";

const upload = multer({
  storage: multer.memoryStorage(),
});

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
    imagePublicId:
      typeof payload.imagePublicId === "string" && payload.imagePublicId.trim() ? payload.imagePublicId.trim() : null,
  };
}

function parseSortBy(value: unknown) {
  return value === "name" || value === "price-low" || value === "price-high" || value === "rating"
    ? value
    : undefined;
}

function sendError(response: express.Response, message: string, status = 400) {
  return response.status(status).json({ error: message });
}

function normalizeCatalogError(error: unknown, fallbackMessage: string) {
  return {
    message: error instanceof Error ? error.message : fallbackMessage,
    status: error instanceof CatalogError ? error.status : 400,
  };
}

export function createApiRouter() {
  const router = express.Router();

  router.use(express.json({ limit: "10mb" }));
  router.use(express.urlencoded({ extended: true }));

  router.get("/products", async (request, response) => {
    const search = typeof request.query.q === "string" ? request.query.q : undefined;
    const categorySlug = typeof request.query.category === "string" ? request.query.category : undefined;
    const sortBy = parseSortBy(request.query.sort);

    const products = await listProducts({
      search,
      categorySlug,
      sortBy,
    });

    return response.json({ products });
  });

  router.get("/products/:id", async (request, response) => {
    const product = await getProductById(request.params.id);
    if (!product) {
      return sendError(response, "Product not found.", 404);
    }

    return response.json({ product });
  });

  router.post("/products", async (request, response) => {
    try {
      const payload = request.body as Record<string, unknown>;
      const product = await createProduct(parsePayload(payload));
      return response.status(201).json({ product });
    } catch (error) {
      const catalogError = normalizeCatalogError(error, "Unable to create product.");
      return sendError(response, catalogError.message, catalogError.status);
    }
  });

  router.patch("/products/:id", async (request, response) => {
    try {
      const payload = request.body as Record<string, unknown>;
      const product = await updateProduct(request.params.id, parsePayload({ id: request.params.id, ...payload }));

      if (!product) {
        return sendError(response, "Product not found.", 404);
      }

      return response.json({ product });
    } catch (error) {
      const catalogError = normalizeCatalogError(error, "Unable to update product.");
      return sendError(response, catalogError.message, catalogError.status);
    }
  });

  router.delete("/products/:id", async (request, response) => {
    const product = await deleteProduct(request.params.id);
    if (!product) {
      return sendError(response, "Product not found.", 404);
    }

    return response.json({ product });
  });

  router.get("/categories", async (_request, response) => {
    const categories = await listCategories();
    return response.json({ categories });
  });

  router.get("/categories/:slug", async (request, response) => {
    const category = await getCategoryBySlug(request.params.slug);
    if (!category) {
      return sendError(response, "Category not found.", 404);
    }

    const products = await getProductsByCategory(category.slug);
    return response.json({ category, products });
  });

  router.get("/featured", async (_request, response) => {
    const products = await getFeaturedProducts();
    return response.json({ products });
  });

  router.post("/demo-orders", async (request, response) => {
    try {
      const payload = request.body as Parameters<typeof createDemoOrder>[0];
      const order = await createDemoOrder(payload);
      return response.status(201).json({ order });
    } catch (error) {
      const catalogError = normalizeCatalogError(error, "Unable to create demo order.");
      return sendError(response, catalogError.message, catalogError.status);
    }
  });

  router.post("/uploads/image", upload.single("file"), async (request, response) => {
    try {
      if (!request.file) {
        return sendError(response, "Expected a file upload.");
      }

      const fileBytes = Uint8Array.from(request.file.buffer);
      const file = Object.assign(new Blob([fileBytes], { type: request.file.mimetype }), {
        name: request.file.originalname,
      });

      const uploadResult = await uploadToCloudinary(file);
      return response.status(201).json({ upload: uploadResult });
    } catch (error) {
      return sendError(response, error instanceof Error ? error.message : "Unable to upload image.");
    }
  });

  router.use((_request, response) => sendError(response, "Route not found.", 404));

  return router;
}
