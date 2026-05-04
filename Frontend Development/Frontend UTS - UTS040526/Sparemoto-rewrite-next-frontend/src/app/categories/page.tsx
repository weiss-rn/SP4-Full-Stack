import CategoriesPage from "@/screens/CategoriesPage";
import { listCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Page() {
  const categories = await listCategories();
  return <CategoriesPage categories={categories} />;
}
