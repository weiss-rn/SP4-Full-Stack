import { connect } from "@/lib/db";
import Product from "@/lib/models/Product";

export async function GET() {
  try {
    await connect();
    const products = await Product.find();
    return new Response(JSON.stringify(products), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
