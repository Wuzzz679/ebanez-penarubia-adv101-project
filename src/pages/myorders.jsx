"use client";

import { useState, useEffect } from "react";
import styles from "../styles/myorders.module.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    setUser(storedUser);
    const storedOrders = JSON.parse(localStorage.getItem(`orders_${storedUser}`)) || [];
    setOrders(storedOrders);
  }, []);

  const handleCancel = (index) => {
    const updatedOrders = orders.filter((_, i) => i !== index);
    setOrders(updatedOrders);
    if (user) localStorage.setItem(`orders_${user}`, JSON.stringify(updatedOrders));
  };

  if (!user) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.header}>Please login to view your orders.</h1>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>{user}'s Orders</h1>
      </header>

      {orders.length === 0 ? (
        <p className={styles.empty}>You have no orders.</p>
      ) : (
        <main className={styles.ordersGrid}>
          {orders.map((order, index) => (
            <div key={index} className={styles.orderItem}>
              <img src={order.image} alt={order.title} />
              <div className={styles.itemInfo}>
                <h2>{order.title}</h2>
                <p>Size: {order.size}</p>
                <p>Quantity: {order.quantity}</p>
                <p>Price: ₱{(order.price * order.quantity).toLocaleString()}</p>
                <button
                  className={styles.cancelBtn}
                  onClick={() => handleCancel(index)}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          ))}
        </main>
      )}
    </div>
  );
}
