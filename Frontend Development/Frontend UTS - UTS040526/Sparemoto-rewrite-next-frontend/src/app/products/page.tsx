import ProductsPage from "@/screens/ProductsPage";
import { listCategories, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  return <ProductsPage products={products} categories={categories} />;
}
