import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "../contexts/CartContext";
import { useSearch } from "../contexts/SearchContext";

const categories = [
  "Elektronik",
  "Fashion Pria",
  "Fashion Wanita",
  "Gaming",
  "Perawatan",
  "Laptop",
  "Aksesori",
];

export default function Navbar() {
  const { cart } = useCart();
  const { searchTerm, setSearchTerm } = useSearch();
  const cartQuantity = useMemo(
    () => cart.reduce((total, product) => total + product.quantity, 0),
    [cart],
  );

  return (
    <>
      <div className="top-banner">
        Gratis Ongkir + COD + Promo 11.11
      </div>

      <header className="main-header">
        <Link href="/" className="logo">
          <span className="logo-mark">S</span>
          <span className="logo-text">hopeeClone</span>
        </Link>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Cari barang murah ..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <Link href="/cart" className="cart-link">
          <span>Keranjang</span>
          {cartQuantity > 0 && (
            <span className="cart-badge" aria-label={`${cartQuantity} barang`}>
              {cartQuantity}
            </span>
          )}
        </Link>
      </header>

      <div className="category-row">
        {categories.map((category) => (
          <span key={category} className="category-pill">
            {category}
          </span>
        ))}
      </div>
    </>
  );
}
