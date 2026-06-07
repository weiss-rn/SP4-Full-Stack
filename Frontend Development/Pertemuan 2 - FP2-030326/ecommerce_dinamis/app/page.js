async function getProducts() {
	const res = await fetch("http://localhost:3000/api/products", { cache: "no-store" });
	return res.json();
}

export default async function Home() {
	const products = await getProducts();

	return (
		<main>
			<h1>STIKOM Ecommerce</h1>
			<div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
				{products.map((prod) => (
					<div key={prod.id} style={{ border: "1px solid #ccc", padding: 20, width: 240 }}>
						<img src={`/images/${prod.gambar}`} width={150} alt={prod.nama} />
						<h3>{prod.nama}</h3>
						<p>Rp {prod.harga}</p>
						<p>{prod.deskripsi}</p>
					</div>
				))}
			</div>
		</main>
	);
}