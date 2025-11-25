import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../../styles/shoe.module.css";

export default function ShoePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [shoe, setShoe] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  const sizes = [7, 7.5, 8, 8.5, 9, 9.5, 10];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(storedUser);
      const userCart = JSON.parse(localStorage.getItem(`cart_${storedUser}`)) || [];
      setCartCount(userCart.length);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) setShoe(data.product);
      })
      .catch(err => console.error(err));
  }, [slug]);

  if (!slug) return <p>Loading...</p>;
  if (!shoe) return <p>Shoe not found.</p>;

  const handleAddToCart = async () => {
    if (!user) return alert("Please login first!");
    if (!selectedSize) return alert("Please select a size!");

    const userId = localStorage.getItem("user_id");

    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        product_id: shoe.id,
        size: selectedSize,
        quantity: 1
      })
    });

    const data = await res.json();
    if (res.ok) {
      setCartCount(cartCount + 1);
      alert(`Added ${shoe.name} (Size ${selectedSize}) to your cart`);
    } else {
      alert(data.error || "Failed to add to cart");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>StreetKicks</h1>
        <div className={styles.cart}>Cart: {cartCount}</div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.imageSection}>
          <img
            src={shoe.images[selectedImage]}
            alt={shoe.name}
            className={styles.mainImage}
          />
          {shoe.images.length > 1 && (
            <div className={styles.thumbnails}>
              {shoe.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${shoe.name} ${idx}`}
                  className={selectedImage === idx ? styles.activeThumbnail : ""}
                  onClick={() => setSelectedImage(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <h2>{shoe.name}</h2>
          <p className={styles.price}>₱{Number(shoe.price).toLocaleString()}</p>
          <p className={styles.description}>{shoe.description}</p>

          <div className={styles.sizes}>
            {sizes.map((size) => (
              <button
                key={size}
                className={selectedSize === size ? styles.selectedSize : styles.sizeBtn}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          <button className={styles.addToCartBtn} onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </main>
    </div>
  );
}
