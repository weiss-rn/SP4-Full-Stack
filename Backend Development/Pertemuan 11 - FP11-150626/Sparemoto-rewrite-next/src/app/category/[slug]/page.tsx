import CategoryPage from "@/screens/CategoryPage";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/catalog";

// ISR: revalidate every 60 seconds for fast responses
export const revalidate = 60;

export default async function Page({ params }: { params: { slug: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const [category, products] = await Promise.all([
    getCategoryBySlug(resolvedParams.slug),
    getProductsByCategory(resolvedParams.slug),
  ]);

  return <CategoryPage category={category} products={products} />;
}
