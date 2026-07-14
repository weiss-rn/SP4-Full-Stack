import type { Metadata } from "next";

import ProductPage from "@/screens/ProductPage";
import { getProductById, getProductsByCategory } from "@/lib/catalog";

// Server-rendered to avoid D1 SQLite lock during parallel build-time prerendering
export const dynamic = "force-dynamic";

type ProductRouteProps = {
  params: Promise<{ id: string }> | { id: string };
};

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    return {
      title: "Product Not Found | MotoParts",
      description: "This motorcycle part is not available in the MotoParts demo catalog.",
    };
  }

  const title = `${product.name} | MotoParts`;
  const description = product.description;
  const images = product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function Page({ params }: ProductRouteProps) {
  const resolvedParams = await Promise.resolve(params);
  const product = await getProductById(resolvedParams.id);
  const related = product ? (await getProductsByCategory(product.categorySlug)).filter((item) => item.id !== product.id).slice(0, 4) : [];

  return <ProductPage product={product} related={related} />;
}
