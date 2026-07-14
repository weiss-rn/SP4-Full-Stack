import OrderDetailPage from "@/screens/OrderDetailPage";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <OrderDetailPage orderId={orderId} />;
}
