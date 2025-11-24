"use client";
import React from "react";
import styles from '../styles/aboutus.module.css';

export default function AboutUs() {
  return (
    <div className={styles['about-container']}>
      <div className={styles['about-card']}>
        <h1>About StreetKicks</h1>
        <p className={styles.tagline}>Where Street Meets Style</p>

        <p className={styles['about-text']}>
          At <strong>StreetKicks</strong>, we live and breathe sneakers. Born
          from the streets and fueled by culture, we're more than just a shoe
          retailer — we're a movement. Whether you're into limited releases,
          classic styles, or the newest drops, we bring the heat to your feet
          with authenticity and attitude.
        </p>

        <p className={styles['about-text']}>
          Founded in 2025, StreetKicks has grown from a small sneaker spot to a
          go-to hub for sneakerheads all over the country. We believe in
          community, creativity, and staying true to the streetwear roots that
          started it all.
        </p>

        <p className={styles['about-text']}>
          Lace up with us and step into the future of street style.
        </p>
      </div>
    </div>
  );
}
