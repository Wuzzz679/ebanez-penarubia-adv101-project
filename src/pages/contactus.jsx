"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/contactus.module.css";

export default function ContactUs() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    contact_type: "general"
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(storedUser);
      
      // Convert username to email if needed
      let userEmail = storedUser;
      let userName = storedUser;
      
      // If it's just a username without @, add domain
      if (!storedUser.includes('@')) {
        userEmail = `${storedUser}@example.com`;
      } else {
        userName = storedUser.split('@')[0]; // Extract name from email
      }
      
      setFormData(prev => ({
        ...prev,
        email: userEmail, // Full email address
        name: userName // Name part
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to send a message.");
      router.push("/login");
      return;
    }

    // Validate email format before sending
    if (!formData.email.includes('@')) {
      alert("❌ Invalid email format. Please enter a full email address with @ symbol.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          contactType: formData.contact_type,
          message: formData.message
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessageSent(true);
        setFormData(prev => ({
          ...prev,
          message: ""
        }));

        setTimeout(() => setMessageSent(false), 5000);
      } else {
        alert(`Error: ${result.message}`);
      }

    } catch (error) {
      alert(`There was an issue sending your message: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactContainer}>
      <div className={styles.contactCard}>
        <h1>Customer Service</h1>
        <p className={styles.tagline}>
          Have questions or feedback? We'd love to hear from you.
        </p>

        {messageSent && (
          <div className={styles.successMessage}>
            ✅ Your message has been sent successfully! We'll get back to you soon.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.emailInput}
          />
          
          {user && (
            <div style={{ marginTop: '5px' }}>
              <small className={styles.loginNote}>Logged in as: {user}</small>
            </div>
          )}

          <label htmlFor="contact_type">Contact Type</label>
          <select
                   name="contact_type"
                    value={formData.contact_type}
                     onChange={handleChange}
>
                             <option value="general">General Inquiry</option>
                             <option value="order">Order Issue</option>
                            <option value="product">Product Question</option>
                            <option value="shipping">Shipping Question</option>
                            <option value="return">Return Request</option>
                             <option value="complaint">Complaint</option>
                              <option value="compliment">Compliment</option>
                                       <option value="message">Message</option>
          </select>

          <label htmlFor="message">Message</label>
          <textarea
            name="message"
            placeholder="Your message..."
            value={formData.message}
            onChange={handleChange}
            rows="5"
            required
          />

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={isSubmitting ? styles.submitting : ""}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>

          {!user && (
            <p className={styles.loginPrompt}>
              💡 <a href="/login">Login</a> to have your messages linked to your account for faster support.
            </p>
          )}
        </form>

        <div className={styles.contactInfo}>
          <h3>Other Contact Methods</h3>
          <div className={styles.contactMethods}>
            <div className={styles.contactMethod}>
              <strong>📧 Email</strong>
              <p>russelebanez@456@gmail.com</p>
            </div>
            <div className={styles.contactMethod}>
              <strong>📞 Phone</strong>
              <p>+1 (555) 123-4567</p>
            </div>
            <div className={styles.contactMethod}>
              <strong>🕒 Response Time</strong>
              <p>Within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}