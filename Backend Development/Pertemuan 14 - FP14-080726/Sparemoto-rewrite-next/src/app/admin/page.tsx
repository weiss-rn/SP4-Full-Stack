import { cookies } from "next/headers";

import AdminLoginPage from "@/screens/AdminLoginPage";
import AdminDashboard from "@/screens/AdminDashboard";
import { ADMIN_SESSION_COOKIE, isAdminCookieValue } from "@/lib/admin-auth";
import { listCategories, listDemoOrderReportItems, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;
type AdminTab = "crud" | "catalog" | "reports";

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeTab(rawTab: string | undefined): AdminTab {
  if (rawTab === "catalog" || rawTab === "items") {
    return "catalog";
  }

  if (rawTab === "reports" || rawTab === "report") {
    return "reports";
  }

  return "crud";
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const cookieStore = await cookies();
  if (!isAdminCookieValue(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return <AdminLoginPage />;
  }

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const initialTab = normalizeTab(getSingleValue(resolvedSearchParams?.tab));
  const initialEditingId = initialTab === "crud" ? getSingleValue(resolvedSearchParams?.edit) : undefined;
  const [initialProducts, categories, initialReportItems] = await Promise.all([
    listProducts(),
    listCategories(),
    listDemoOrderReportItems(),
  ]);

  return (
    <AdminDashboard
      initialProducts={initialProducts}
      categories={categories}
      initialReportItems={initialReportItems}
      initialEditingId={initialEditingId}
      initialTab={initialTab}
    />
  );
}
