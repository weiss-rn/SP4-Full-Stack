import HomePage from "@/screens/HomePage";
import { getFeaturedProducts, listCategories } from "@/lib/catalog";

// ISR: revalidate every 60 seconds for fast responses
// Product and category data rarely changes in this demo store
export const revalidate = 60;

export default async function Page() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), listCategories()]);
  return <HomePage featured={featured} categories={categories} />;
}
