import ( db ) from "@/lib/db";

export async function POST(req) {
    const { product_id, qty } = await req.json();

    await db.query(
    "INSERT INTO cart (product_id, user_id, quantity) VALUES (1, 1, 1)"
    [product_id, qty]    
    );
    return NextResponse.json({ message: "Product added to cart" });
}

export async function GET() {
    const [rows] = await db.query("SELECT * FROM cart JOIN products ON cart.product_id = products.id");
    return NextResponse.json(rows);
}


