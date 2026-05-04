import { connect } from "@/lib/db";
import Product from "@/lib/models/Product";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

async function getProduct(id) {
  try {
    await connect();
    const product = await Product.findById(id);
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductDetail({ params }) {
  const { id } = params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="container mt-5">
        <h1>Product Not Found</h1>
        <Link href="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <Link href="/products" className="btn btn-secondary mb-4">
        ← Back to Products
      </Link>

      <div className="row">
        <div className="col-md-6">
          <div
            className="bg-light rounded p-5 text-center"
            style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <div>
              <div style={{ fontSize: "80px", marginBottom: "10px" }}>📦</div>
              <p className="text-muted">{product.name}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <h1 className="mb-3">{product.name}</h1>

          <div className="mb-3">
            <span className="badge bg-primary">ID: {product._id}</span>
          </div>

          <p className="text-muted mb-4">{product.description || "No description available"}</p>

          <div className="mb-4">
            <h2 className="text-success">${product.price}</h2>
          </div>

          <div className="mb-4">
            <p>
              <strong>Stock: </strong>
              <span className={product.stock > 0 ? "text-success" : "text-danger"}>
                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
              </span>
            </p>
          </div>

          <div className="mb-4">
            <p className="text-muted small">
              <strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}
            </p>
          </div>

          {product.stock > 0 ? (
            <form
              action="/api/cart"
              method="POST"
              className="d-flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const qty = parseInt(e.target.qty.value);
                try {
                  const res = await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      product_id: product._id,
                      qty,
                      user_id: 1,
                    }),
                  });
                  if (res.ok) {
                    alert("Product added to cart!");
                  } else {
                    alert("Error adding to cart");
                  }
                } catch (error) {
                  alert("Error: " + error.message);
                }
              }}
            >
              <input type="number" name="qty" min="1" max={product.stock} defaultValue="1" className="form-control" style={{ maxWidth: "100px" }} required />
              <button type="submit" className="btn btn-success btn-lg">
                🛒 Add to Cart
              </button>
            </form>
          ) : (
            <button className="btn btn-danger btn-lg" disabled>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
