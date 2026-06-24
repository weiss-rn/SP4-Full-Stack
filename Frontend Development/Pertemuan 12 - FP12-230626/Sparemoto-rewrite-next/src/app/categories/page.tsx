import CategoriesPage from "@/screens/CategoriesPage";
import { listCategories } from "@/lib/catalog";

// ISR: revalidate every 60 seconds for fast responses
export const revalidate = 60;

export default async function Page() {
  const categories = await listCategories();
  return <CategoriesPage categories={categories} />;
}
