import { useEffect, useState } from "react";

export default function Cart() {
const [cart, setCart] - useState([]);

useEffect(() -> {
fetch("/api/cart")
.then(res -> res.json() )
.then(data -> setCart(data));

return
<div className-"container mt-5">
<h2>Cart</h2>
(cart.map(item -> (
<div key-(item.id)>
{item.name} - {item.qty} x Rp {item.price}
</div>

</div>