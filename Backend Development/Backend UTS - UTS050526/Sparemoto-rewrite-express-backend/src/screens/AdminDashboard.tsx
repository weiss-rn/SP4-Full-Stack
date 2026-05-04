"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  Check,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

import type { Category, Product } from "@/data/products";
import { getShippingFee } from "@/lib/commerce";
import type { DemoOrderReportItem } from "@/types/demo-orders";
import { cn } from "@/utils/cn";

type AdminTab = "crud" | "catalog" | "reports";

type ProductForm = {
  id?: string;
  name: string;
  category: string;
  categorySlug: string;
  price: string;
  originalPrice: string;
  stockCount: string;
  description: string;
  specs: string;
  inStock: boolean;
  badge: string;
  rating: string;
  reviews: string;
  imageUrl: string;
  imagePublicId: string;
};

const tabs: Array<{ id: AdminTab; label: string; description: string; icon: typeof Pencil }> = [
  { id: "crud", label: "Item CRUD", description: "Create, edit, and delete products", icon: Pencil },
  { id: "catalog", label: "Catalog Table", description: "Read-only inventory table with totals", icon: Boxes },
  { id: "reports", label: "Sales Report", description: "Demo purchase log with timestamps", icon: FileText },
];

const fieldClass =
  "w-full rounded-2xl border border-mono-200 bg-mono-50 px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white";
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500";
const cardClass = "rounded-[1.75rem] border border-mono-200 bg-white p-5 shadow-sm";

function toCategoryOptions(initialProducts: Product[], categories: Category[]) {
  if (categories.length > 0) {
    return categories;
  }

  const seen = new Map<string, Category>();
  for (const product of initialProducts) {
    if (!seen.has(product.categorySlug)) {
      seen.set(product.categorySlug, {
        slug: product.categorySlug,
        name: product.category,
        description: "",
        icon: "⚙️",
        count: 0,
      });
    }
  }

  return Array.from(seen.values());
}

function createEmptyForm(categoryOptions: Category[], preferredCategorySlug?: string): ProductForm {
  const selectedCategory =
    categoryOptions.find((option) => option.slug === preferredCategorySlug) ?? categoryOptions[0] ?? {
      slug: "",
      name: "",
    };

  return {
    name: "",
    category: selectedCategory.name,
    categorySlug: selectedCategory.slug,
    price: "",
    originalPrice: "",
    stockCount: "12",
    description: "",
    specs: "",
    inStock: true,
    badge: "",
    rating: "0",
    reviews: "0",
    imageUrl: "",
    imagePublicId: "",
  };
}

function toProductForm(product: Product): ProductForm {
  const stockCount = typeof product.stockCount === "number" ? product.stockCount : product.inStock ? 12 : 0;

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    categorySlug: product.categorySlug,
    price: String(product.price),
    originalPrice: typeof product.originalPrice === "number" ? String(product.originalPrice) : "",
    stockCount: String(stockCount),
    description: product.description,
    specs: product.specs.join(", "),
    inStock: stockCount > 0,
    badge: product.badge ?? "",
    rating: String(product.rating),
    reviews: String(product.reviews),
    imageUrl: product.imageUrl || product.image || "",
    imagePublicId: product.imagePublicId || "",
  };
}

function formatCurrency(value?: number | null) {
  return typeof value === "number" ? `$${value.toFixed(2)}` : "—";
}

function shippingForPrice(price: number) {
  return getShippingFee(price);
}

function formatShipping(value: number) {
  return value === 0 ? "Free" : `$${value.toFixed(2)}`;
}

function formatStockCount(value?: number) {
  return typeof value === "number" ? value.toLocaleString() : "0";
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function buildAdminPath(pathname: string, tab: AdminTab, editId?: string) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (tab === "crud" && editId) {
    params.set("edit", editId);
  }

  return `${pathname}?${params.toString()}`;
}

export default function AdminDashboard({
  initialProducts,
  categories,
  initialReportItems,
  initialEditingId,
  initialTab,
}: {
  initialProducts: Product[];
  categories: Category[];
  initialReportItems: DemoOrderReportItem[];
  initialEditingId?: string;
  initialTab: AdminTab;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const initialCategoryOptions = toCategoryOptions(initialProducts, categories);
  const initialEditingProduct = initialEditingId
    ? initialProducts.find((product) => product.id === initialEditingId) ?? null
    : null;

  const [products, setProducts] = useState(initialProducts);
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [editingId, setEditingId] = useState<string | null>(initialEditingProduct?.id ?? null);
  const [form, setForm] = useState<ProductForm>(() =>
    initialEditingProduct ? toProductForm(initialEditingProduct) : createEmptyForm(initialCategoryOptions)
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [crudQuery, setCrudQuery] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("all");
  const [reportQuery, setReportQuery] = useState("");

  const deferredCatalogQuery = useDeferredValue(catalogQuery);
  const deferredReportQuery = useDeferredValue(reportQuery);
  const categoryOptions = useMemo(() => toCategoryOptions(products, categories), [products, categories]);

  const inStockCount = products.filter((product) => product.inStock).length;
  const outOfStockCount = products.length - inStockCount;
  const discountedCount = products.filter(
    (product) => typeof product.originalPrice === "number" && product.originalPrice > product.price
  ).length;
  const reportOrderCount = new Set(initialReportItems.map((item) => item.orderId)).size;
  const reportUnitsSold = initialReportItems.reduce((sum, item) => sum + item.quantity, 0);
  const reportGrossSales = initialReportItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const filteredCrudProducts = useMemo(() => {
    const query = crudQuery.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter((product) =>
      `${product.name} ${product.category} ${product.id}`.toLowerCase().includes(query)
    );
  }, [products, crudQuery]);

  const filteredCatalogProducts = useMemo(() => {
    const query = deferredCatalogQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !query ||
        `${product.name} ${product.category} ${product.id}`.toLowerCase().includes(query);
      const matchesCategory = catalogCategory === "all" || product.categorySlug === catalogCategory;
      return matchesQuery && matchesCategory;
    });
  }, [products, deferredCatalogQuery, catalogCategory]);

  const filteredReportItems = useMemo(() => {
    const query = deferredReportQuery.trim().toLowerCase();
    if (!query) {
      return initialReportItems;
    }

    return initialReportItems.filter((item) =>
      `${item.orderNumber} ${item.customerName} ${item.customerEmail} ${item.productName} ${item.productId} ${item.category}`
        .toLowerCase()
        .includes(query)
    );
  }, [initialReportItems, deferredReportQuery]);

  useEffect(() => {
    setActiveTab(initialTab);

    if (initialTab === "crud" && initialEditingId) {
      const product = products.find((item) => item.id === initialEditingId);
      if (product) {
        setEditingId(product.id);
        setForm(toProductForm(product));
        setError("");
      }
    }
  }, [initialTab, initialEditingId, products]);

  const updateRoute = (tab: AdminTab, editId?: string, replace = false) => {
    const href = buildAdminPath(pathname, tab, editId);
    setActiveTab(tab);

    startTransition(() => {
      if (replace) {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    });
  };

  const resetEditor = ({
    preserveMessage = false,
    preferredCategorySlug,
  }: {
    preserveMessage?: boolean;
    preferredCategorySlug?: string;
  } = {}) => {
    setEditingId(null);
    setForm(createEmptyForm(categoryOptions, preferredCategorySlug));
    setError("");
    if (!preserveMessage) {
      setMessage("");
    }
  };

  const openCreate = (mode: "push" | "replace" = "push") => {
    resetEditor();
    updateRoute("crud", undefined, mode === "replace");
  };

  const openEdit = (product: Product, mode: "push" | "replace" = "push") => {
    setEditingId(product.id);
    setForm(toProductForm(product));
    setError("");
    setMessage("");
    updateRoute("crud", product.id, mode === "replace");
  };

  const handleTabChange = (tab: AdminTab) => {
    setError("");
    updateRoute(tab, tab === "crud" ? editingId ?? undefined : undefined);
  };

  const handleCategoryChange = (categorySlug: string) => {
    const category = categoryOptions.find((option) => option.slug === categorySlug);
    setForm((current) => ({
      ...current,
      categorySlug,
      category: category?.name ?? current.category,
    }));
  };

  const handleStockCountChange = (value: string) => {
    const numeric = Number(value);
    setForm((current) => ({
      ...current,
      stockCount: value,
      inStock: Number.isFinite(numeric) && numeric > 0,
    }));
  };

  const handleStockToggle = (checked: boolean) => {
    setForm((current) => ({
      ...current,
      inStock: checked,
      stockCount: checked ? (Number(current.stockCount) > 0 ? current.stockCount : "12") : "0",
    }));
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads/image", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { error?: string; upload?: { imageUrl: string; imagePublicId: string } };
      if (!response.ok || !data.upload) {
        throw new Error(data.error || "Unable to upload image.");
      }

      setForm((current) => ({
        ...current,
        imageUrl: data.upload!.imageUrl,
        imagePublicId: data.upload!.imagePublicId,
      }));
      setMessage("Image uploaded.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const name = form.name.trim();
    const category = form.category.trim();
    const categorySlug = form.categorySlug.trim();
    const description = form.description.trim();
    const price = Number(form.price);
    const originalPrice = form.originalPrice.trim() === "" ? null : Number(form.originalPrice);
    const stockCount = Number(form.stockCount);
    const rating = Number(form.rating);
    const reviews = Number(form.reviews);

    if (!name || !category || !categorySlug || !description) {
      setSaving(false);
      setError("Name, category, and description are required.");
      return;
    }

    if (!Number.isFinite(price)) {
      setSaving(false);
      setError("Enter a valid price.");
      return;
    }

    if (originalPrice !== null && !Number.isFinite(originalPrice)) {
      setSaving(false);
      setError("Enter a valid original price.");
      return;
    }

    if (!Number.isFinite(stockCount) || stockCount < 0) {
      setSaving(false);
      setError("Enter a valid stock count.");
      return;
    }

    if (!Number.isFinite(rating) || !Number.isFinite(reviews)) {
      setSaving(false);
      setError("Rating and reviews must be numbers.");
      return;
    }

    const isEditing = Boolean(editingId);
    const payload = {
      id: form.id,
      name,
      category,
      categorySlug,
      price,
      originalPrice,
      description,
      specs: form.specs
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      inStock: stockCount > 0,
      stockCount: Math.max(0, Math.floor(stockCount)),
      badge: form.badge || null,
      rating,
      reviews,
      imageUrl: form.imageUrl || null,
      imagePublicId: form.imagePublicId || null,
    };

    try {
      const response = await fetch(isEditing ? `/api/products/${editingId}` : "/api/products", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string; product?: Product };
      if (!response.ok || !data.product) {
        throw new Error(data.error || "Unable to save item.");
      }

      const saved = data.product;
      setProducts((current) => {
        const exists = current.some((product) => product.id === saved.id);
        return exists ? current.map((product) => (product.id === saved.id ? saved : product)) : [saved, ...current];
      });

      if (isEditing) {
        setEditingId(saved.id);
        setForm(toProductForm(saved));
        setMessage("Item updated.");
        updateRoute("catalog", undefined, true);
      } else {
        resetEditor({
          preserveMessage: true,
          preferredCategorySlug: saved.categorySlug,
        });
        setMessage("Item created. Ready to add another.");
        updateRoute("crud", undefined, true);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this item?")) {
      return;
    }

    setError("");
    setMessage("");

    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error || "Unable to delete item.");
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== id));

    if (editingId === id) {
      resetEditor({ preserveMessage: true });
      updateRoute("crud", undefined, true);
    }

    setMessage("Item deleted.");
  };

  return (
    <div className="bg-mono-100/70">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="overflow-hidden rounded-[2rem] border border-mono-200 bg-white shadow-sm">
          <div className="border-b border-mono-200 bg-[linear-gradient(140deg,#fafafa_0%,#f3f4f6_100%)] px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-mono-200 bg-white shadow-sm">
                  <Boxes className="h-6 w-6 text-mono-700" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-mono-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">
                    Admin Control Center
                  </span>
                  <span className="rounded-full border border-mono-200 px-3 py-1 text-[11px] font-medium text-mono-600">
                    CRUD + catalog + reports
                  </span>
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-mono-900 sm:text-4xl">Inventory operations for the storefront</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-mono-600">
                  Use the CRUD tab to create and edit items, switch to the catalog table for live inventory totals, and
                  open the report tab to review recorded demo purchases with timestamps.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-mono-600">
                  <span className="rounded-full border border-mono-200 bg-white px-3 py-1">
                    {products.length} items
                  </span>
                  <span className="rounded-full border border-mono-200 bg-white px-3 py-1">
                    {inStockCount} in stock
                  </span>
                  <span className="rounded-full border border-mono-200 bg-white px-3 py-1">
                    {outOfStockCount} out of stock
                  </span>
                  <span className="rounded-full border border-mono-200 bg-white px-3 py-1">
                    {discountedCount} discounted
                  </span>
                  <span className="rounded-full border border-mono-200 bg-white px-3 py-1">
                    {reportOrderCount} demo orders
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openCreate()}
                  className="inline-flex items-center gap-2 rounded-full bg-mono-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mono-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-medium text-mono-500 transition hover:bg-white hover:text-mono-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Store
                </Link>
              </div>
            </div>
          </div>

          <div className="border-b border-mono-200 px-5 py-3 sm:px-8">
            <div role="tablist" aria-label="Admin sections" className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "min-w-[220px] rounded-[1.4rem] border px-4 py-3 text-left transition",
                      isActive
                        ? "border-mono-900 bg-mono-900 text-white shadow-sm"
                        : "border-mono-200 bg-white text-mono-600 hover:border-mono-900 hover:text-mono-900"
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </div>
                    <p className={cn("mt-1 text-xs", isActive ? "text-mono-300" : "text-mono-500")}>{tab.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-5 py-5 sm:px-8 sm:py-6">
            {error && (
              <div className="mb-4 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            {message && (
              <div className="mb-4 flex items-center gap-2 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <Check className="h-4 w-4" />
                {message}
              </div>
            )}

            {activeTab === "crud" && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <form onSubmit={handleSubmit} className={cn(cardClass, "space-y-5")}>
                  <div className="flex flex-col gap-4 border-b border-mono-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-mono-200 bg-mono-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">
                          {editingId ? "Editing item" : "Create item"}
                        </span>
                        {editingId && (
                          <span className="rounded-full border border-mono-200 px-2.5 py-1 text-[11px] font-medium text-mono-600">
                            {editingId}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-lg font-bold text-mono-900">{editingId ? "Edit product" : "Create product"}</h2>
                      <p className="mt-1 text-sm text-mono-500">
                        Use the button above to add a fresh item. Saving an edit takes you back to the catalog table.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openCreate("replace")}
                        className="rounded-full border border-mono-200 px-3 py-2 text-xs font-semibold text-mono-600 transition hover:border-mono-900 hover:text-mono-900"
                      >
                        Reset form
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <label className="space-y-2">
                      <span className={labelClass}>Item name</span>
                      <input
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Performance Piston Kit"
                        className={fieldClass}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className={labelClass}>Badge</span>
                      <input
                        value={form.badge}
                        onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}
                        placeholder="SALE"
                        className={fieldClass}
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <label className="space-y-2">
                      <span className={labelClass}>Category</span>
                      <select
                        value={form.categorySlug}
                        onChange={(event) => handleCategoryChange(event.target.value)}
                        className={fieldClass}
                      >
                        {categoryOptions.map((category) => (
                          <option key={category.slug} value={category.slug}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className={labelClass}>Category label</span>
                      <input value={form.category} readOnly className={cn(fieldClass, "bg-mono-100 text-mono-500")} />
                    </label>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    <label className="space-y-2">
                      <span className={labelClass}>Current price</span>
                      <input
                        value={form.price}
                        onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                        placeholder="189.99"
                        type="number"
                        step="0.01"
                        className={fieldClass}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className={labelClass}>Original price</span>
                      <input
                        value={form.originalPrice}
                        onChange={(event) => setForm((current) => ({ ...current, originalPrice: event.target.value }))}
                        placeholder="229.99"
                        type="number"
                        step="0.01"
                        className={fieldClass}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className={labelClass}>Stock count</span>
                      <input
                        value={form.stockCount}
                        onChange={(event) => handleStockCountChange(event.target.value)}
                        placeholder="12"
                        type="number"
                        min="0"
                        className={fieldClass}
                      />
                    </label>
                  </div>

                  <label className="space-y-2">
                    <span className={labelClass}>Description</span>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                      rows={5}
                      placeholder="Write a short product description for customers and admins."
                      className={cn(fieldClass, "resize-none")}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className={labelClass}>Specs</span>
                    <input
                      value={form.specs}
                      onChange={(event) => setForm((current) => ({ ...current, specs: event.target.value }))}
                      placeholder="Forged aluminum alloy, High-compression design, Includes rings & pin"
                      className={fieldClass}
                    />
                  </label>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Rating</span>
                        <input
                          value={form.rating}
                          onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          className={fieldClass}
                        />
                      </label>

                      <label className="space-y-2">
                        <span className={labelClass}>Reviews</span>
                        <input
                          value={form.reviews}
                          onChange={(event) => setForm((current) => ({ ...current, reviews: event.target.value }))}
                          type="number"
                          min="0"
                          className={fieldClass}
                        />
                      </label>
                    </div>

                    <label className="flex items-center gap-3 rounded-[1.4rem] border border-mono-200 bg-mono-50 px-4 py-3 text-sm font-medium text-mono-700">
                      <input
                        checked={form.inStock}
                        onChange={(event) => handleStockToggle(event.target.checked)}
                        type="checkbox"
                        className="h-4 w-4"
                      />
                      In stock
                    </label>
                  </div>

                  <div className="space-y-2">
                    <span className={labelClass}>Image upload</span>
                    <label className="flex flex-col gap-3 rounded-[1.4rem] border border-dashed border-mono-300 bg-mono-50 p-4 text-sm text-mono-600 transition hover:border-mono-900 hover:bg-white">
                      <span className="inline-flex items-center gap-2 font-medium text-mono-700">
                        <Upload className="h-4 w-4" />
                        {uploading ? "Uploading image..." : "Choose an image file"}
                      </span>
                      <span className="text-xs text-mono-500">PNG, JPG, or WEBP. Uploads go through the existing Cloudinary flow.</span>
                      <input onChange={handleFileChange} type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-mono-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-mono-500">
                      {editingId ? "Saving returns you to the catalog table." : "Saving keeps you on CRUD so you can add another item."}
                    </p>
                    <button
                      disabled={uploading || saving}
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-mono-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mono-800 disabled:opacity-60"
                    >
                      {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {saving ? "Saving..." : editingId ? "Update Item" : "Create Item"}
                    </button>
                  </div>
                </form>

                <section className={cardClass}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-mono-900">Existing Items</h2>
                      <p className="mt-1 text-sm text-mono-500">Add, edit, or delete items directly from the list.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCreate()}
                      className="inline-flex items-center gap-2 rounded-full border border-mono-200 px-3 py-2 text-xs font-semibold text-mono-700 transition hover:border-mono-900 hover:text-mono-900"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Item
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="relative block">
                      <span className="sr-only">Search items</span>
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
                      <input
                        value={crudQuery}
                        onChange={(event) => setCrudQuery(event.target.value)}
                        placeholder="Search by name, category, or ID"
                        className="w-full rounded-2xl border border-mono-200 bg-mono-50 py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white"
                      />
                    </label>
                  </div>

                  <div className="mt-4 space-y-3 max-h-[760px] overflow-y-auto pr-1">
                    {filteredCrudProducts.map((product) => (
                      <div key={product.id} className="flex gap-3 rounded-[1.4rem] bg-mono-50 p-3">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-mono-200 bg-white">
                          {product.imageUrl || product.image ? (
                            <img src={product.imageUrl || product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold uppercase text-mono-400">
                              {product.name.slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-mono-900">{product.name}</p>
                              <p className="text-[11px] text-mono-500">{product.category}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(product)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-mono-200 bg-white transition hover:border-mono-900 hover:text-mono-900"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(product.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-mono-200 bg-white transition hover:border-red-300 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-mono-600">
                            <span>{formatCurrency(product.price)}</span>
                            <span>Stock {formatStockCount(product.stockCount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "catalog" && (
              <section className={cardClass}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-mono-900">Catalog Table</h2>
                    <p className="mt-1 text-sm text-mono-500">
                      Full inventory view with item name, product ID, stock count, prices, category, rating, and shipping totals.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateRoute("crud", editingId ?? undefined)}
                    className="inline-flex items-center gap-2 rounded-full bg-mono-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mono-800"
                  >
                    <Plus className="h-4 w-4" />
                    Open CRUD
                  </button>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <label className="relative block">
                    <span className="sr-only">Search catalog</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
                    <input
                      value={catalogQuery}
                      onChange={(event) => setCatalogQuery(event.target.value)}
                      placeholder="Search by name, category, or ID"
                      className="w-full rounded-2xl border border-mono-200 bg-mono-50 py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white"
                    />
                  </label>

                  <select
                    value={catalogCategory}
                    onChange={(event) => setCatalogCategory(event.target.value)}
                    className={fieldClass}
                  >
                    <option value="all">All categories</option>
                    {categoryOptions.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-mono-500">
                  <p>
                    Showing <span className="font-semibold text-mono-900">{filteredCatalogProducts.length}</span> of{" "}
                    <span className="font-semibold text-mono-900">{products.length}</span> products
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogQuery("");
                      setCatalogCategory("all");
                    }}
                    className="font-semibold text-mono-600 transition hover:text-mono-900"
                  >
                    Clear filters
                  </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr className="text-left text-mono-500">
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Item name</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Product ID</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Stock count</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Original price</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Price</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Total w/ shipping</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Category</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCatalogProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-10 text-center text-sm text-mono-500">
                            No products match the current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredCatalogProducts.map((product) => {
                          const shipping = shippingForPrice(product.price);
                          const totalWithShipping = product.price + shipping;

                          return (
                            <tr key={product.id} className="text-mono-700">
                              <td className="border-b border-mono-100 px-3 py-4">
                                <p className="font-semibold text-mono-900">{product.name}</p>
                              </td>
                              <td className="border-b border-mono-100 px-3 py-4 font-mono text-xs text-mono-600">{product.id}</td>
                              <td className="border-b border-mono-100 px-3 py-4">{formatStockCount(product.stockCount)}</td>
                              <td className="border-b border-mono-100 px-3 py-4 text-mono-500">
                                {formatCurrency(product.originalPrice)}
                              </td>
                              <td className="border-b border-mono-100 px-3 py-4 font-semibold text-mono-900">
                                {formatCurrency(product.price)}
                              </td>
                              <td className="border-b border-mono-100 px-3 py-4">
                                <div className="font-semibold text-mono-900">{formatCurrency(totalWithShipping)}</div>
                                <div className="text-xs text-mono-500">{formatShipping(shipping)} shipping</div>
                              </td>
                              <td className="border-b border-mono-100 px-3 py-4">{product.category}</td>
                              <td className="border-b border-mono-100 px-3 py-4 font-semibold text-mono-900">
                                {product.rating.toFixed(1)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-xs text-mono-500">
                  Shipping follows the checkout rule: free over $200, otherwise $14.99.
                </p>
              </section>
            )}

            {activeTab === "reports" && (
              <section className={cardClass}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-mono-900">Demo Purchase Report</h2>
                    <p className="mt-1 text-sm text-mono-500">
                      Every successful demo checkout is recorded here with its timestamp, customer, items, and remaining stock.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateRoute("catalog")}
                    className="inline-flex items-center gap-2 rounded-full bg-mono-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mono-800"
                  >
                    <Boxes className="h-4 w-4" />
                    Open Catalog
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.4rem] border border-mono-200 bg-mono-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Demo orders</p>
                    <p className="mt-2 text-2xl font-bold text-mono-900">{reportOrderCount}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-mono-200 bg-mono-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Units sold</p>
                    <p className="mt-2 text-2xl font-bold text-mono-900">{reportUnitsSold.toLocaleString()}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-mono-200 bg-mono-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Gross item sales</p>
                    <p className="mt-2 text-2xl font-bold text-mono-900">{formatCurrency(reportGrossSales)}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="relative block">
                    <span className="sr-only">Search purchase report</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
                    <input
                      value={reportQuery}
                      onChange={(event) => setReportQuery(event.target.value)}
                      placeholder="Search by order, customer, item, category, or ID"
                      className="w-full rounded-2xl border border-mono-200 bg-mono-50 py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white"
                    />
                  </label>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-mono-500">
                  <p>
                    Showing <span className="font-semibold text-mono-900">{filteredReportItems.length}</span> of{" "}
                    <span className="font-semibold text-mono-900">{initialReportItems.length}</span> purchased line items
                  </p>
                  <button
                    type="button"
                    onClick={() => setReportQuery("")}
                    className="font-semibold text-mono-600 transition hover:text-mono-900"
                  >
                    Clear search
                  </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr className="text-left text-mono-500">
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Purchased at</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Order</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Customer</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Item</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Qty</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Unit price</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Line total</th>
                        <th className="border-b border-mono-200 px-3 py-3 font-medium">Remaining stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReportItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-10 text-center text-sm text-mono-500">
                            {initialReportItems.length === 0
                              ? "No demo purchases have been recorded yet."
                              : "No report rows match the current search."}
                          </td>
                        </tr>
                      ) : (
                        filteredReportItems.map((item) => (
                          <tr key={`${item.orderId}-${item.productId}-${item.createdAt}`} className="text-mono-700">
                            <td className="border-b border-mono-100 px-3 py-4 text-xs text-mono-500">
                              {formatTimestamp(item.createdAt)}
                            </td>
                            <td className="border-b border-mono-100 px-3 py-4">
                              <div className="font-semibold text-mono-900">{item.orderNumber}</div>
                              <div className="font-mono text-[11px] text-mono-500">{item.orderId}</div>
                            </td>
                            <td className="border-b border-mono-100 px-3 py-4">
                              <div className="font-semibold text-mono-900">{item.customerName}</div>
                              <div className="text-xs text-mono-500">{item.customerEmail}</div>
                            </td>
                            <td className="border-b border-mono-100 px-3 py-4">
                              <div className="font-semibold text-mono-900">{item.productName}</div>
                              <div className="text-xs text-mono-500">
                                {item.category} · {item.productId}
                              </div>
                            </td>
                            <td className="border-b border-mono-100 px-3 py-4 font-semibold text-mono-900">
                              {item.quantity}
                            </td>
                            <td className="border-b border-mono-100 px-3 py-4">{formatCurrency(item.unitPrice)}</td>
                            <td className="border-b border-mono-100 px-3 py-4 font-semibold text-mono-900">
                              {formatCurrency(item.lineTotal)}
                            </td>
                            <td className="border-b border-mono-100 px-3 py-4">{formatStockCount(item.remainingStock)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
