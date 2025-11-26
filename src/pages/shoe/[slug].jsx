import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../../styles/shoe.module.css";
import ProductReviews from "../productreview";

const shoesData = [
  {
    slug: "nike-dunk-low",
    name: "Nike Dunk Low",
    price: "₱7,894",
    images: ["/nike.avif", "/nike-alt1.avif", "/nike-alt2.avif"],
    description: "Classic Nike Dunk Low with street-ready style.",
    id: 1 
  },
  {
    slug: "air-jordan-1-low",
    name: "Air Jordan 1 Low",
    price: "₱6,500",
    images: ["/blurjordan.png", "/jordan-alt1.png", "/jordan-alt2.avif"],
    description: "Clean and iconic Air Jordan 1 Low, perfect for any outfit.",
    id: 2
  },
  {
    slug: "palermo-leather-sneakers",
    name: "Palermo Leather Sneakers Unisex",
    price: "₱4,576",
    images: ["/palermo.avif", "/palermo-alt1.avif", "/palermo-alt2.avif"],
    description: "Premium leather sneakers suitable for men and women.",
    id: 3
  },
  {
    slug: "chuck-taylor-all-star",  
    name: "Chuck Taylor All Star",
    price: "₱3,600", 
    images: ["/chuck.webp","/chuck-alt1.jpg","/chuck-alt2.jpg"],
    description: "Timeless Chuck Taylor All Star sneakers for everyday wear.",
    id: 4
  },
  {
    slug: "adizero-evo-sl", 
    name: "Adizero Evo Sl Men's Shoes", 
    price: "₱4,200", 
    images: ["/adizero.webp","/adizero-alt1.webp","/adizero-alt2.webp"],
    description: "Lightweight and responsive Adizero Evo Sl for runners.",
    id: 5
  },
  {
    slug: "new-balance", 
    name: "740 unisex sneakers shoes", 
    price: "₱4,890", 
    images: ["/nb.webp","/nb-alt1.webp","/nb-alt2.webp"], 
    description: "Comfortable and stylish New Balance sneakers.",
    id: 6
  },
  {
    slug: "air-jordan-4-retro", 
    name: "Air Jordan 4 Retro Men's Basketball Shoes", 
    price: "₱5,000", 
    images: ["/retro.avif", "/retro-alt1.avif", "/retro-alt2.avif"],
    description: "Classic Air Jordan 4 Retro for basketball enthusiasts.",
    id: 7
  }
];

export default function ShoePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(storedUser);
      const userCart = JSON.parse(localStorage.getItem(`cart_${storedUser}`)) || [];
      setCartCount(userCart.length);
    }
  }, []);

  if (!slug) return <p>Loading...</p>;

  const shoe = shoesData.find((s) => s.slug === slug);
  if (!shoe) return <p>Shoe not found.</p>;

  const sizes = [7, 7.5, 8, 8.5, 9, 9.5, 10];

  const handleAddToCart = () => {
    if (!user) return alert("Please login first!");
    if (!selectedSize) return alert("Please select a size!");

    const cartKey = `cart_${user}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const item = {
      title: shoe.name,
      price: parseInt(shoe.price.replace(/[₱,]/g, "")),
      quantity: 1,
      size: selectedSize,
      image: shoe.images[selectedImage],
    };

    cart.push(item);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setCartCount(cart.length);
    alert(`Added ${item.title} (Size ${item.size}) to your cart`);
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
          <p className={styles.price}>{shoe.price}</p>
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

      {}
      <section className={styles.reviewsSection}>
        <ProductReviews productId={shoe.id} />
      </section>
    </div>
  );
}