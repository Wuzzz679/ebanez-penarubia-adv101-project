import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/category.module.css";

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [categoryShoes, setCategoryShoes] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState({});

  useEffect(() => {
    const username = localStorage.getItem("user");
    if (!username) return;
    const cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];
    setCartCount(cart.length);
  }, []);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/products?category=${slug}`)
      .then(res => res.json())
      .then(data => setCategoryShoes(data.products))
      .catch(err => console.error(err));
  }, [slug]);

  const handleSizeChange = (slug, value) => {
    setSelectedSizes(prev => ({ ...prev, [slug]: value }));
  };

  const handleAddToCart = async (shoe) => {
    const username = localStorage.getItem("user");
    const userId = localStorage.getItem("user_id");
    if (!username || !userId) {
      alert("You must login first.");
      return;
    }

    const size = selectedSizes[shoe.slug];
    if (!size) {
      alert("Please select a shoe size before adding to cart.");
      return;
    }

    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        product_id: shoe.id,
        size,
        quantity: 1
      })
    });

    const data = await res.json();
    if (res.ok) {
      setCartCount(cartCount + 1);
      alert(`Added ${shoe.name} (Size ${size}) to cart`);
    } else {
      alert(data.error || "Failed to add to cart");
    }
  };

  if (!slug) return <p>Loading...</p>;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>{slug.toUpperCase()}</h1>
        <div className={styles.cart}>Cart: {cartCount}</div>
      </header>

      <main className={styles.productsGrid}>
        {categoryShoes.map((shoe, index) => (
          <div key={index} className={styles.productCard}>
            <Link href={`/shoe/${shoe.slug}`} className={styles.linkReset}>
              <img src={shoe.image} alt={shoe.name} />
              <h2>{shoe.name}</h2>
              <p>₱{Number(shoe.price).toLocaleString()}</p>
            </Link>

            <select
              className={styles.sizeSelect}
              value={selectedSizes[shoe.slug] || ""}
              onChange={(e) => handleSizeChange(shoe.slug, e.target.value)}
            >
              <option value="">Select Size</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>

            <button
              className={styles.addToCartBtn}
              onClick={() => handleAddToCart(shoe)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
