import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../contexts/CartContext";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function CartPage() {
  const { cart, removeFromCart, cartTotal } = useCart();

  return (
    <>
      <Head>
        <title>Keranjang Belanja | Shopee Clone</title>
        <meta name="description" content="Lihat produk yang Anda tambahkan ke keranjang" />
      </Head>

      <main className="page-shell">
        <section className="cart-page">
          <div className="section-header">
            <div>
              <p className="section-label">Keranjang Anda</p>
              <h1>Sudah siap untuk checkout?</h1>
            </div>
            <Link href="/" className="link-secondary">
              Lanjutkan belanja
            </Link>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Keranjang masih kosong, yuk tambah produk favoritmu.</p>
              <Link href="/" className="btn-primary">
                Kembali ke beranda
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-list">
                {cart.map((item) => (
                  <article key={item.id} className="cart-card">
                    <div className="cart-media">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={120}
                        height={120}
                        className="cart-image"
                      />
                    </div>
                    <div className="cart-detail">
                      <h3>{item.name}</h3>
                      <p className="product-price">{currencyFormatter.format(item.price)}</p>
                      <p className="product-quantity">Qty: {item.quantity}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Hapus
                    </button>
                  </article>
                ))}
              </div>

              <div className="cart-summary">
                <div>
                  <p className="section-label">Ringkasan</p>
                  <h2>Total Belanja</h2>
                </div>
                <p className="cart-total">{currencyFormatter.format(cartTotal)}</p>
                <button type="button" className="btn-primary">
                  Lanjutkan ke Checkout
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
