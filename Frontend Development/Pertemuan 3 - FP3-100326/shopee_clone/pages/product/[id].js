import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../../contexts/CartContext";
import products from "../../data/products";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <main className="page-shell">
        <p className="loading-state">
          {router.isFallback ? "Memuat data..." : "Produk tidak ditemukan."}
        </p>
      </main>
    );
  }

  const handleAdd = () => {
    addToCart(product);
  };

  return (
    <>
      <Head>
        <title>{product.name} | Shopee Clone</title>
        <meta name="description" content={product.description} />
      </Head>

      <main className="page-shell">
        <section className="detail-card">
          <div className="detail-media">
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className="detail-image"
            />
          </div>
          <div className="detail-body">
            <p className="product-label">Kategori: {product.category}</p>
            <h1>{product.name}</h1>
            <p className="detail-price">{currencyFormatter.format(product.price)}</p>
            <p className="detail-desc">{product.description}</p>
            <div className="detail-actions">
              <button type="button" className="btn-primary" onClick={handleAdd}>
                + Tambah ke Keranjang
              </button>
              <Link href="/" className="link-secondary">
                Kembali ke beranda
              </Link>
            </div>
            <p className="detail-sold">{product.sold} pelanggan telah membeli produk ini.</p>
          </div>
        </section>
      </main>
    </>
  );
}
