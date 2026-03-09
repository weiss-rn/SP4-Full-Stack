async function getProducts() {
  const res = await fetch('http://localhost:3000/api/products', {
    cache: 'no-store'
  });
  return res.json();
}

export default async function Page() {
  const products = await getProducts();

  return (
    <main>
      <h1>E-Commerce Dengan Next.js</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        {products.map(prod => (
          <div key={prod.id} style={{ border: "1px solid #ccc", padding: 20 }}>
            <img src={`/images/${prod.gambar}`} width={150}/>
            <h3>{prod.nama}</h3>
            <p>Rp {prod.harga}</p>
            <p>{prod.deskripsi}</p>
          </div>
        ))}
      </div>
    </main>
  );
}