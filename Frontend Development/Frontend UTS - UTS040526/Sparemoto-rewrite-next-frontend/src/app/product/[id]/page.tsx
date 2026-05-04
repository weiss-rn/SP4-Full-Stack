import ProductPage from "@/screens/ProductPage";
import { getProductById, getProductsByCategory } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const product = await getProductById(resolvedParams.id);
  const related = product ? (await getProductsByCategory(product.categorySlug)).filter((item) => item.id !== product.id).slice(0, 4) : [];

  return <ProductPage product={product} related={related} />;
}
