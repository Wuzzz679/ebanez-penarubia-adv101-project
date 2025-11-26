"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/myorders.module.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(""); // Add username state
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUsername = localStorage.getItem("username"); // Get username
    
    if (!storedUser) {
      router.push("/login");
      return;
    }

    setUser(storedUser);
    setUsername(storedUsername || storedUser); // Use username if available
    fetchOrders(storedUser);
  }, []);

  const fetchOrders = async (userEmail) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/user?user_email=${userEmail}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      
      if (data.success) {
        // Filter out cancelled orders so they don't show up
        const activeOrders = data.orders.filter(order => order.status !== 'cancelled');
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!user || !confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await fetch(`/api/orders/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          user_email: user
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      // Remove the cancelled order from the local state immediately
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      alert("Order cancelled successfully!");
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    const paymentMethods = {
      'cash': 'Cash on Delivery',
      'gcash': 'GCash',
      'card': 'Credit/Debit Card',
      'bank': 'Bank Transfer'
    };
    return paymentMethods[method] || method;
  };

  // Function to get display name (username or email)
  const getDisplayName = () => {
    if (username && username !== user) {
      return username; // Return username if available and different from email
    }
    return user; // Fallback to email
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1>{user ? `${getDisplayName()}'s Orders` : "Your Orders"}</h1>
        </header>
        <p className={styles.empty}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>{user ? `${getDisplayName()}'s Orders` : "Your Orders"}</h1>
      </header>

      {orders.length === 0 ? (
        <p className={styles.empty}>You have no active orders.</p>
      ) : (
        <main className={styles.ordersGrid}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderItem}>
              <img src={order.product_image} alt={order.product_title} />
              <div className={styles.itemInfo}>
                <h2>{order.product_title}</h2>
                
                {/* Product Details */}
                <div className={styles.detailsSection}>
                  <h3>Product Details</h3>
                  <p><strong>Size:</strong> {order.size}</p>
                  <p><strong>Price:</strong> ₱{parseFloat(order.price).toLocaleString()}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Total:</strong> ₱{(parseFloat(order.price) * order.quantity).toLocaleString()}</p>
                </div>

                {/* Customer Information */}
                <div className={styles.detailsSection}>
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {order.customer_name}</p>
                  <p><strong>Phone:</strong> {order.customer_phone}</p>
                  <p><strong>Address:</strong> {order.customer_address}</p>
                </div>

                {/* Order Information */}
                <div className={styles.detailsSection}>
                  <h3>Order Information</h3>
                  <p><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
                  <p><strong>Payment Method:</strong> {formatPaymentMethod(order.payment_method)}</p>
                  <p><strong>Status:</strong> 
                    <span className={`
                      ${styles.status} 
                      ${order.status === 'pending' ? styles.pending : ''}
                      ${order.status === 'shipped' ? styles.shipped : ''}
                      ${order.status === 'delivered' ? styles.delivered : ''}
                      ${order.status === 'cancelled' ? styles.cancelled : ''}
                    `}>
                      {order.status}
                    </span>
                  </p>
                </div>

                {}
                {order.status === 'pending' && (
                  <button 
                    className={styles.cancelBtn} 
                    onClick={() => handleCancel(order.id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </main>
      )}
    </div>
  );
}