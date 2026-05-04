"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product._id,
          qty: 1,
          user_id: 1,
        }),
      });

      if (res.ok) {
        alert("Product added to cart!");
      } else {
        alert("Error adding to cart");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 d-flex flex-column">
      <div
        className="bg-light text-center flex-grow-1 d-flex align-items-center justify-content-center"
        style={{ minHeight: "200px", position: "relative" }}
      >
        <div>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>📦</div>
          <small className="text-muted">{product.name}</small>
        </div>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text text-muted small">
          {product.description || "No description available"}
        </p>
        <p className="card-text mb-3">
          <strong className="text-success">${product.price}</strong>
        </p>
        {product.stock > 0 ? (
          <span className="badge bg-success mb-3">
            In Stock ({product.stock})
          </span>
        ) : (
          <span className="badge bg-danger mb-3">Out of Stock</span>
        )}
        <div className="d-flex gap-2 mt-auto">
          <Link
            href={`/product/${product._id}`}
            className="btn btn-primary flex-grow-1"
          >
            View Details
          </Link>
          <button
            className="btn btn-success"
            onClick={handleAddToCart}
            disabled={loading || product.stock === 0}
          >
            {loading ? "..." : "🛒"}
          </button>
        </div>
      </div>
    </div>
  );
}
