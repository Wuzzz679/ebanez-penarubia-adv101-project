import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/cart.module.css";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  // Load user and cart from database
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUser || !storedUserId) return;

    setUser(storedUser);
    setUserId(storedUserId);

    fetch(`/api/cart/view?user_id=${storedUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cart) {
          setCart(data.cart);
        }
      });
  }, []);

  // Calculate total
  useEffect(() => {
    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(totalPrice);
  }, [cart]);

  // Update quantity
  const handleQuantityChange = async (index, delta) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += delta;
    if (updatedCart[index].quantity < 1) updatedCart[index].quantity = 1;

    setCart(updatedCart);

    const cartItem = updatedCart[index];
    await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart_id: cartItem.id,
        quantity: cartItem.quantity,
      }),
    });
  };

  // Remove item
  const handleRemove = async (index) => {
    const cartItem = cart[index];
    await fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart_id: cartItem.id }),
    });

    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  // Checkout
  const handleCheckout = async () => {
    if (!userId) return alert("Please login to checkout!");

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, cart }),
    });
    const data = await res.json();

    if (res.ok) {
      setCart([]);
      alert("Checkout successful! Your order has been placed.");
    } else {
      alert(data.error || "Checkout failed.");
    }
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
              <img src={item.images[0]} alt={item.name} />
              <div className={styles.itemInfo}>
                <h2>{item.name}</h2>
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
