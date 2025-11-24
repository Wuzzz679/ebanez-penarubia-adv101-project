import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/cart.module.css";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return; 

    setUser(storedUser);

    const storedCart = JSON.parse(localStorage.getItem(`cart_${storedUser}`)) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(totalPrice);
  }, [cart]);

  const handleQuantityChange = (index, delta) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += delta;
    if (updatedCart[index].quantity < 1) updatedCart[index].quantity = 1;
    setCart(updatedCart);
    if (user) localStorage.setItem(`cart_${user}`, JSON.stringify(updatedCart));
  };

  const handleRemove = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    if (user) localStorage.setItem(`cart_${user}`, JSON.stringify(updatedCart));
  };

  const handleCheckout = () => {
    if (!user) return alert("Please login to checkout!");

   
    const existingOrders = JSON.parse(localStorage.getItem(`orders_${user}`)) || [];
    const newOrders = [...existingOrders, ...cart];

   
    localStorage.setItem(`orders_${user}`, JSON.stringify(newOrders));

  
    setCart([]);
    localStorage.setItem(`cart_${user}`, JSON.stringify([]));

    alert("Checkout successful! Your order has been placed.");
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>{user ? `${user}'s Cart` : "Your Cart"}</h1>
      </header>

      {cart.length === 0 ? (
        <>
          <p className={styles.empty}>Your cart is empty.</p>
          {user && (
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                className={styles.checkoutBtn}
                onClick={() => router.push("/myorders")}
              >
                Go to My Orders
              </button>
            </div>
          )}
        </>
      ) : (
        <main className={styles.cartGrid}>
          {cart.map((item, index) => (
            <div key={index} className={styles.cartItem}>
              <img src={item.image} alt={item.title} />
              <div className={styles.itemInfo}>
                <h2>{item.title}</h2>
                <p>Size: {item.size}</p>
                <p>Price: ₱{item.price.toLocaleString()}</p>
                <div className={styles.quantity}>
                  <button onClick={() => handleQuantityChange(index, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(index, 1)}>+</button>
                </div>
                <button className={styles.removeBtn} onClick={() => handleRemove(index)}>Remove</button>
              </div>
            </div>
          ))}
          <div className={styles.total}>
            <h2>Total: ₱{total.toLocaleString()}</h2>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>Checkout</button>
          </div>
        </main>
      )}
    </div>
  );
}
