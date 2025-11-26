"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/home.module.css";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  const trendingShoes = [
    { 
      id: 1,
      slug: "nike-dunk-low", 
      name: "Nike Dunk Low", 
      price: 7894, 
      img: "/nike.avif",
      rating: 4.5,
      reviewCount: 128
    },
    { 
      id: 2,
      slug: "air-jordan-1-low", 
      name: "Air Jordan 1 Low", 
      price: 6500, 
      img: "/blurjordan.png",
      rating: 4.8,
      reviewCount: 95
    },
    { 
      id: 3,
      slug: "palermo-leather-sneakers", 
      name: "Palermo Leather Sneakers Unisex", 
      price: 4576, 
      img: "/palermo.avif",
      rating: 4.2,
      reviewCount: 67
    },
    { 
      id: 4,
      slug: "chuck-taylor-all-star", 
      name: "Chuck Taylor All Star", 
      price: 3600, 
      img: "/chuck.webp",
      rating: 4.6,
      reviewCount: 203
    },
    { 
      id: 5,
      slug: "adizero-evo-sl", 
      name: "Adizero Evo Sl Men's Shoes", 
      price: 4200, 
      img: "/adizero.webp",
      rating: 4.3,
      reviewCount: 54
    },
    { 
      id: 6,
      slug: "new-balance", 
      name: "740 unisex sneakers shoes", 
      price: 4890, 
      img: "/nb.webp",
      rating: 4.7,
      reviewCount: 89
    },
    { 
      id: 7,
      slug: "air-jordan-4-retro", 
      name: "Air Jordan 4 Retro Men's Basketball Shoes", 
      price: 5000, 
      img: "/retro.avif",
      rating: 4.9,
      reviewCount: 156
    },
  ];

  const categories = [
    { name: "MEN", slug: "men", img: "/men.jpg" },
    { name: "WOMEN", slug: "women", img: "/women.jpg" },
    { name: "KIDS", slug: "kids", img: "/kids.jpg" },
    { name: "STYLE", slug: "style", img: "/style.jpg" },
  ];

  const featuredReviews = [
    {
      id: 1,
      rating: 5,
      text: "The Nike Dunk Low is incredibly comfortable and true to size. Got so many compliments on my first day wearing them!",
      author: "Maria S.",
      product: "Nike Dunk Low"
    },
    {
      id: 2,
      rating: 4,
      text: "Fast shipping and great quality. The Air Jordan 1 Lows are perfect for both casual wear and basketball.",
      author: "John D.",
      product: "Air Jordan 1 Low"
    },
    {
      id: 3,
      rating: 5,
      text: "Love my Chuck Taylors! They never go out of style. StreetKicks had the best price and authentic products.",
      author: "Sarah L.",
      product: "Chuck Taylor All Star"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth <= 600) setItemsPerPage(1);
      else if (window.innerWidth <= 1024) setItemsPerPage(2);
      else setItemsPerPage(4);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUsername = localStorage.getItem("username");
    
    if (storedUser) {
      setUser(storedUser);
      setUsername(storedUsername || storedUser.split('@')[0]);
      
      const userCart = JSON.parse(localStorage.getItem(`cart_${storedUser}`)) || [];
      setCartCount(userCart.length);
    }
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerPage < trendingShoes.length ? prev + itemsPerPage : 0
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev - itemsPerPage >= 0 ? prev - itemsPerPage : trendingShoes.length - itemsPerPage
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    setUser(null);
    setUsername("");
    router.push("/");
  };

  const renderStars = (rating) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
          >
            ★
          </span>
        ))}
        <span className={styles.ratingText}>({rating})</span>
      </div>
    );
  };

  const getDisplayName = () => {
    if (username && username !== user) {
      return username;
    }
    return user ? user.split('@')[0] : '';
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => router.push("/")}>StreetKicks</div>
        <ul className={styles.navLinks}>
          <li><a href="#trending">Trending</a></li>
          <li><a href="#categories">Categories</a></li>
          <li><a onClick={() => router.push("/myorders")} style={{ cursor: "pointer" }}>My Orders</a></li>
          <li><a onClick={() => router.push("/profile")} style={{ cursor: "pointer" }}>Profile</a></li>
              <li><a onClick={() => router.push("/reviews")} style={{ cursor: "pointer" }}>My Reviews</a></li>
         
        </ul>
        <div className={styles.navButtons}>
          {user ? (
            <>
              <span className={styles.userName}> {getDisplayName()}</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <button className={styles.loginBtn} onClick={() => router.push("/login")}>
              Login
            </button>
          )}
          <button className={styles.cartBtn} onClick={() => router.push("/cart")}>
            🛒 Cart ({cartCount})
          </button>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroOverlay}>
          <h1>StreetKicks</h1>
          <p>Step Up Your Sneaker Game</p>
          <a href="#trending" className={styles.heroButton}>Shop Now</a>
        </div>
      </header>

      <section className={styles.trending} id="trending">
        <h2>Trending Sneakers</h2>
  
        
        <div className={styles.carouselWrapper}>
          <div
            className={styles.trendingGrid}
            style={{
              transform: `translateX(-${itemsPerPage ? (100 / trendingShoes.length) * currentIndex : 0}%)`,
              width: `${itemsPerPage ? (100 / itemsPerPage) * trendingShoes.length : trendingShoes.length * 100}%`,
            }}
          >
            {trendingShoes.map((shoe, index) => (
              <div key={shoe.id} className={styles.card} onClick={() => router.push(`/shoe/${shoe.slug}`)}>
                <img src={shoe.img} alt={shoe.name} />
                <div className={styles.cardInfo}>
                  <p className={styles.name}>{shoe.name}</p>
                  <p className={styles.price}>₱{shoe.price.toLocaleString()}</p>
                  
                  {}
                  <div className={styles.ratingSection}>
                    {renderStars(shoe.rating)}
                   
                  </div>
                  
                  <button 
                           className={styles.viewReviewsBtn}
                        onClick={(e) => {
                         e.stopPropagation();
                        router.push(`/productreview`);
                                }}
>
                          View Reviews
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className={styles.prevArrow} onClick={handlePrev}>&#10094;</button>
          <button className={styles.nextArrow} onClick={handleNext}>&#10095;</button>
        </div>
      </section>

      <section className={styles.categories} id="categories">
        <h2>Shop by Category</h2>
     
        <div className={styles.categoryGrid}>
          {categories.map((cat, index) => (
            <div key={index} className={styles.categoryCard} onClick={() => router.push(`/category/${cat.slug}`)}>
              <img src={cat.img} alt={cat.name} />
              <div className={styles.categoryOverlay}>
                <p>{cat.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {}
      <section className={styles.featuredReviews}>
        <h2>What Our Customers Say</h2>
      
        
        <div className={styles.reviewsGrid}>
          {featuredReviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                {renderStars(review.rating)}
                <span className={styles.reviewer}>{review.author}</span>
              </div>
              <p className={styles.reviewText}>"{review.text}"</p>
              <span className={styles.reviewProduct}>on {review.product}</span>
            </div>
          ))}
        </div>
        
        <button 
          className={styles.allReviewsBtn}
          onClick={() => router.push("/productreview")}
        >
          Read All Reviews
        </button>
      </section>

      <footer className={styles.footer} id="contact">
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
           
          </div>
          
          <ul className={styles.footerLinks}>
            <li><Link href="/contactus">Customer Service</Link></li>
            <li><Link href="/aboutus">About Us</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/newsletter">Newsletter</Link></li>
            <li><Link href="/reviews">Customer Reviews</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}