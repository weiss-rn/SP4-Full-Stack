import ProductsPage from "@/screens/ProductsPage";
import { listCategories, listProducts } from "@/lib/catalog";

// Server-rendered to avoid D1 SQLite lock during parallel build-time prerendering
export const dynamic = "force-dynamic";

export default async function Page() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  return <ProductsPage products={products} categories={categories} />;
}
