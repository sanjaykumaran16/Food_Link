import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css'; // We'll create this CSS file next
// Import icons (install react-icons first: npm install react-icons)
import { FaHandsHelping, FaUtensils, FaBuilding } from 'react-icons/fa'; // Example icons

function HomePage() {
  return (
    <div className={styles.homeContainer}>
      <header className={styles.heroSection}>
        <h1>Welcome to Food Link</h1>
        <p className={styles.subtitle}>
          Connecting surplus food with those who need it most.
        </p>
        <div className={styles.ctaButtons}>
          <Link to="/restaurant" className={styles.ctaButton}>I'm a Restaurant</Link>
          <Link to="/ngo" className={styles.ctaButton}>I'm an NGO</Link>
        </div>
      </header>

      <section className={styles.featuresSection}>
        <h2>How It Works</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <FaBuilding size={40} className={styles.featureIcon} />
            <h3>Restaurants List Surplus</h3>
            <p>Easily list available food items nearing expiry or excess inventory.</p>
          </div>
          <div className={styles.featureCard}>
            <FaHandsHelping size={40} className={styles.featureIcon} />
            <h3>NGOs Request Food</h3>
            <p>Registered NGOs browse listings and request food for their communities.</p>
          </div>
          <div className={styles.featureCard}>
            <FaUtensils size={40} className={styles.featureIcon} />
            <h3>Food Reaches People</h3>
            <p>Facilitating efficient pickup and distribution to reduce waste and fight hunger.</p>
          </div>
        </div>
      </section>

      {/* You can add more sections here - e.g., impact stats, testimonials */}

    </div>
  );
}

export default HomePage; 