"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import "bootstrap/dist/css/bootstrap.min.css";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQty) => {
    if (newQty < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    setUpdating(cartItemId);
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (res.ok) {
        fetchCart();
      } else {
        alert("Error updating cart");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating cart");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (!confirm("Remove this item from cart?")) return;

    setUpdating(cartItemId);
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCart();
      } else {
        alert("Error removing item");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error removing item");
    } finally {
      setUpdating(null);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.product_id?.price || 0) * item.quantity;
  }, 0);

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container mt-5">
          <p>Loading cart...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mt-5 mb-5">
        <h1 className="mb-4">🛒 Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="alert alert-info">
            <p>Your cart is empty</p>
            <Link href="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <Link href={`/product/${item.product_id?._id}`} className="text-decoration-none">
                          {item.product_id?.name || "Unknown Product"}
                        </Link>
                      </td>
                      <td>${item.product_id?.price || 0}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            disabled={updating === item._id}
                          >
                            −
                          </button>
                          <span className="px-2">{item.quantity}</span>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            disabled={updating === item._id}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>${((item.product_id?.price || 0) * item.quantity).toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={updating === item._id}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Link href="/products" className="btn btn-secondary">
                  ← Continue Shopping
                </Link>
              </div>
              <div className="col-md-6 text-end">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Order Summary</h5>
                    <hr />
                    <div className="d-flex justify-content-between mb-3">
                      <span>Total Items:</span>
                      <strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <h5>Total Price:</h5>
                      <h5 className="text-success">${totalPrice.toFixed(2)}</h5>
                    </div>
                    <button className="btn btn-success btn-lg w-100">Proceed to Checkout</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
