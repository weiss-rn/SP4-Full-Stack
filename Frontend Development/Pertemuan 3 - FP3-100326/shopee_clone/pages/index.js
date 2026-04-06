import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useSearch } from "../contexts/SearchContext";
import products from "../data/products";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function HomePage() {
  const { searchTerm } = useSearch();

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query),
    );
  }, [searchTerm]);

  return (
    <>
      <Head>
        <title>Shopee Clone</title>
        <meta
          name="description"
          content="Marketplace clone untuk belajar layout dan interaksi sederhana."
        />
      </Head>

      <main className="page-shell">
        <section className="hero-panel">
          <div>
            <p className="hero-tag">Pilihan terbaik harian</p>
            <h1>Belanja lebih mudah, hemat di kantong.</h1>
            <p className="hero-subtitle">
              Temukan gadget, fashion, dan perlengkapan sehari-hari dengan harga promo
              dan pengiriman cepat.
            </p>
          </div>
          <div className="hero-card">
            <p className="hero-card-title">Promo 11.11</p>
            <p className="hero-card-detail">Top up saldo & nikmati flash sale hingga -50%</p>
          </div>
        </section>

        <section className="product-section">
          <div className="section-header">
            <div>
              <p className="section-label">Kategori populer</p>
              <h2>Produk Unggulan</h2>
            </div>
            {searchTerm && (
              <p className="search-hint">
                Menampilkan hasil pencarian untuk &ldquo;{searchTerm}&rdquo;
              </p>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <p className="no-results">Belum ada produk yang sesuai. Coba kata kunci lain.</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <div className="product-media">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={260}
                      className="product-image"
                    />
                  </div>
                  <div className="product-body">
                    <p className="product-category">{product.category}</p>
                    <h3>{product.name}</h3>
                    <p className="product-price">{currencyFormatter.format(product.price)}</p>
                    <p className="product-sold">{product.sold} terjual</p>
                    <Link href={`/product/${product.id}`} className="btn-detail">
                      Lihat Detail
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
