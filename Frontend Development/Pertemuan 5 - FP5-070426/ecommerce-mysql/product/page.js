import Link from "next/link";

async function getProduct(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/products`, {
      cache: "no-store",
    });
    const products = await res.json();
    return products.find((p) => p.id === parseInt(id));
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
    <div className="container mt-5">
      <Link href="/products" className="btn btn-secondary mb-3">
        Back to Products
      </Link>
      <div className="row">
        <div className="col-md-8">
          <h1>{product.name}</h1>
          <p className="lead">{product.description}</p>
          <h2 className="text-primary">${product.price}</h2>
          <button className="btn btn-success btn-lg">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
