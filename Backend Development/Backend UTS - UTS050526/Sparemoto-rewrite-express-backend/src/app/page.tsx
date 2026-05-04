import HomePage from "@/screens/HomePage";
import { getFeaturedProducts, listCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), listCategories()]);
  return <HomePage featured={featured} categories={categories} />;
}
