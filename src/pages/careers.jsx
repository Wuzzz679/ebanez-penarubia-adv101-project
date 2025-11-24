"use client";
import React from "react";
import styles from "../styles/careers.module.css";

export default function Careers() {
  return (
    <div className={styles.careersContainer}>
      <div className={styles.careersCard}>
        <h1>Join the StreetKicks Team</h1>
        <p className={styles.tagline}>Turn your passion for sneakers into a career.</p>

        <p className={styles.careersText}>
          At <strong>StreetKicks</strong>, we’re not just selling shoes — we’re building a culture. 
          We’re looking for creative, passionate, and driven individuals who want to be part of a team that values authenticity, street style, and innovation.
        </p>

        <h2>Open Positions</h2>
        <ul className={styles.jobListings}>
          <li>
            <h3>📦 Warehouse Associate</h3>
            <p>Keep the sneaker flow running — inventory, packing, and shipping with speed and care.</p>
          </li>
          <li>
            <h3>🛍️ Retail Store Specialist</h3>
            <p>Deliver an epic in-store experience to fellow sneakerheads.</p>
          </li>
          <li>
            <h3>💻 Digital Marketing Assistant</h3>
            <p>Bring the StreetKicks brand to life online — from drops to campaigns.</p>
          </li>
          <li>
            <h3>📸 Content Creator</h3>
            <p>Shoot, edit, and flex the hottest kicks on social. Creative energy required.</p>
          </li>
        </ul>

        <p className={styles.careersFooter}>
          To apply, send your resume and a short cover letter to{" "}
          <a href="mailto:russelebanez456@gmail.com">russel.ebanez@hcdc.edu.ph</a>. Let us know why you’re the perfect fit.
        </p>
      </div>
    </div>
  );
}
