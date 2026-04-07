import ProductCard from "@/components/ProductCard";
import NavBar from "@/components/NavBar";

async function getProducts() {
  try {
    const res = await fetch("http://localhost:3000/api/products", {
      cache: "no-store",
    });
    return await res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <h1 className="mb-4">Our Products</h1>
        {products.length === 0 ? (
          <p>No products available</p>
        ) : (
          <div className="row g-4">
            {products.map((product) => (
              <div key={product.id} className="col-md-4">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
