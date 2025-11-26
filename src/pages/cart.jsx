import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/cart.module.css";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(""); // Add username state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    payment_method: "cash"
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUsername = localStorage.getItem("username"); // Get username from localStorage
    
    if (!storedUser) return; 

    setUser(storedUser);
    setUsername(storedUsername || storedUser); // Use username if available, fallback to email
    
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

  const handleCheckoutClick = () => {
    setShowCheckoutForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async () => {
    if (!user) return alert("Please login to checkout!");
    if (cart.length === 0) return alert("Your cart is empty!");

    // Validate form
    if (!checkoutData.customer_name || !checkoutData.customer_address || !checkoutData.customer_phone) {
      return alert("Please fill in all required fields: Name, Phone, and Address");
    }

    setIsCheckingOut(true);

    try {
      console.log('🔄 Starting checkout process...');

      // Save all items as a single order with customer info
      const orderData = {
        user_email: user,
        items: cart, // Send all cart items
        customer_name: checkoutData.customer_name,
        customer_phone: checkoutData.customer_phone,
        customer_address: checkoutData.customer_address,
        payment_method: checkoutData.payment_method,
        total: total
      };

      console.log('📨 Sending order data:', orderData);

      const response = await fetch('/api/orders/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('📩 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save order: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Order saved:', responseData);

      // Clear cart after successful checkout
      setCart([]);
      localStorage.setItem(`cart_${user}`, JSON.stringify([]));
      setShowCheckoutForm(false);
      setCheckoutData({
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        payment_method: "cash"
      });

      alert("Checkout successful! Your order has been placed.");
      router.push("/myorders");

    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert(`Checkout failed: ${error.message}\n\nPlease check if the database table has the new columns.`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cancelCheckout = () => {
    setShowCheckoutForm(false);
    setCheckoutData({
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      payment_method: "cash"
    });
  };

  // Function to get display name (username or email)
  const getDisplayName = () => {
    if (username && username !== user) {
      return username; // Return username if available and different from email
    }
    return user; // Fallback to email
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>{user ? `${getDisplayName()}'s Cart` : "Your Cart"}</h1>
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
            
            {!showCheckoutForm ? (
              <button 
                className={styles.checkoutBtn} 
                onClick={handleCheckoutClick}
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className={styles.checkoutForm}>
                <h3>Shipping Information</h3>
                
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={checkoutData.customer_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={checkoutData.customer_phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Delivery Address *</label>
                  <textarea
                    name="customer_address"
                    value={checkoutData.customer_address}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    placeholder="Enter your complete delivery address"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Payment Method</label>
                  <select
                    name="payment_method"
                    value={checkoutData.payment_method}
                    onChange={handleInputChange}
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="gcash">GCash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                <div className={styles.checkoutActions}>
                  <button 
                    className={styles.cancelBtn} 
                    onClick={cancelCheckout}
                    disabled={isCheckingOut}
                  >
                    Cancel
                  </button>
                  <button 
                    className={styles.checkoutBtn} 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}