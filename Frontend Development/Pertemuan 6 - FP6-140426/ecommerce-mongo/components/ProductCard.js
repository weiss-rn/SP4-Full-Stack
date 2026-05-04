import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text">
          {product.description || "No description available"}
        </p>
        <p className="card-text">
          <strong>Price: ${product.price}</strong>
        </p>
        <Link href={`/product/${product.id}`} className="btn btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
}
