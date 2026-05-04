import { connect } from "@/lib/db";
import Product from "@/lib/models/Product";
import { NextResponse } from "next/server";

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

export async function POST(req) {
  try {
    await connect();
    const { name, price, description, image, stock, id } = await req.json();

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      id: id || Date.now(),
      name,
      price,
      description,
      image,
      stock: stock || 0,
    });

    return NextResponse.json(
      { message: "Product created", data: newProduct },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
