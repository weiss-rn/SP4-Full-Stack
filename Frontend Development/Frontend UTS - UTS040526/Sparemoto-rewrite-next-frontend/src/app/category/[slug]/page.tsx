import CategoryPage from "@/screens/CategoryPage";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { slug: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const [category, products] = await Promise.all([
    getCategoryBySlug(resolvedParams.slug),
    getProductsByCategory(resolvedParams.slug),
  ]);

  return <CategoryPage category={category} products={products} />;
}
