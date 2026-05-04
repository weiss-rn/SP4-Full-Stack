import { connect } from "@/lib/db";
import Cart from "@/lib/models/Cart";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connect();
    const { id } = params;
    const { quantity } = await req.json();

    const updatedItem = await Cart.findByIdAndUpdate(
      id,
      { quantity, updatedAt: Date.now() },
      { new: true }
    ).populate("product_id");

    if (!updatedItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Cart item updated",
      data: updatedItem,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connect();
    const { id } = params;

    const deletedItem = await Cart.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Item removed from cart",
      data: deletedItem,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
