import { db } from "@/lib/db";

export async function GET() {
  const [rows] = await db.execute("SELECT * FROM products");
  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json" },
  });
}
