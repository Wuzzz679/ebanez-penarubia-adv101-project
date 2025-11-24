"use client";
import React from "react";
import styles from "../styles/newsletter.module.css";

export default function Newsletter() {
  return (
    <div className={styles.newsletterContainer}>
      <div className={styles.newsletterCard}>
        <h1>Join the StreetKicks Newsletter</h1>
        <p className={styles.tagline}>
          Be the first to hear about drops, deals, and sneaker stories.
        </p>

        <form className={styles.newsletterForm}>
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" placeholder="Your name" required />

          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" placeholder="you@example.com" required />

          <label className={styles.checkboxLabel}>
            <input type="checkbox" required />
            I agree to receive promotional emails from StreetKicks.
          </label>

          <button type="submit">Subscribe Now</button>
        </form>
      </div>
    </div>
  );
}
