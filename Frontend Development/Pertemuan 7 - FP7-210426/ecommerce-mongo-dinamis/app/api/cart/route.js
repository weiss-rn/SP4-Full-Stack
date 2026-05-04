import { connect } from "@/lib/db";
import Cart from "@/lib/models/Cart";
import Product from "@/lib/models/Product";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connect();
    const { product_id, qty, user_id = 1 } = await req.json();

    const newCartItem = await Cart.create({
      product_id,
      user_id,
      quantity: qty,
    });

    return NextResponse.json({
      message: "Product added to cart",
      data: newCartItem,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connect();
    const cartItems = await Cart.find().populate("product_id");
    return NextResponse.json(cartItems);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}


