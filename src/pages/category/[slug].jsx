import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/category.module.css";

const allShoes = [
  { slug: "nike-dunk-low", name: "Nike Dunk Low", price: "₱7,894", img: "/nike.avif", category: "MEN" },
  { slug: "air-jordan-1-low", name: "Air Jordan 1 Low", price: "₱6,500", img: "/blurjordan.png", category: "MEN" },
  { slug: "palermo-leather-sneakers", name: "Palermo Leather Sneakers", price: "₱4,576", img: "/palermo.avif", category: "WOMEN" },
  { slug: "chuck-taylor-all-star", name: "Chuck Taylor All Star", price: "₱3,600", img: "/chuck.webp", category: "KIDS" },
  { slug: "adizero-evo-sl", name: "Adizero Evo Sl", price: "₱4,200", img: "/adizero.webp", category: "MEN" },
  { slug: "new-balance", name: "740 Sneakers", price: "₱4,890", img: "/nb.webp", category: "WOMEN" },
  { slug: "air-jordan-4-retro", name: "Air Jordan 4 Retro", price: "₱5,000", img: "/retro.avif", category: "MEN" },
];

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [cartCount, setCartCount] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState({});

  useEffect(() => {
    const username = localStorage.getItem("user");
    if (!username) return;
    const cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];
    setCartCount(cart.length);
  }, []);

  if (!slug) return <p>Loading...</p>;

  const categoryShoes = allShoes.filter(
    (shoe) => shoe.category.toLowerCase() === slug.toLowerCase()
  );

  const handleSizeChange = (slug, value) => {
    setSelectedSizes(prev => ({ ...prev, [slug]: value }));
  };

  const handleAddToCart = (shoe) => {
    const username = localStorage.getItem("user");
    if (!username) {
      alert("You must login first.");
      return;
    }

    const size = selectedSizes[shoe.slug];
    if (!size) {
      alert("Please select a shoe size before adding to cart.");
      return;
    }

    const cartKey = `cart_${username}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    cart.push({
      ...shoe,
      size,
      quantity: 1,
      image: shoe.img,
      title: shoe.name,
      price: Number(shoe.price.replace(/[₱,]/g, "")),
    });

    localStorage.setItem(cartKey, JSON.stringify(cart));
    setCartCount(cart.length);
    alert(`Added ${shoe.name} (Size ${size}) to cart`);
  };

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
              <img src={shoe.img} alt={shoe.name} />
              <h2>{shoe.name}</h2>
              <p>{shoe.price}</p>
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
