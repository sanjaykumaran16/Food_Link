import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaUsers, FaHeart } from 'react-icons/fa';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Brand Column */}
        <div className={styles.footerCol}>
          <h3 className={styles.brandTitle}>FoodLink</h3>
          <p className={styles.brandTagline}>
            Connecting surplus food donors with hunger relief organisations. Let's build a zero-waste, hunger-free future together.
          </p>
          <div className={styles.initiativeInfo}>
            <FaUsers className={styles.colIcon} />
            <div>
              <span className={styles.colLabel}>An Initiative By</span>
              <span className={styles.colValue}>Calvin • Sanjay • Niranchan • Jaison</span>
            </div>
          </div>
        </div>

        {/* Links Column */}
        <div className={styles.footerCol}>
          <h4 className={styles.colHeading}>Quick Links</h4>
          <ul className={styles.colLinks}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/impact">Our Impact</Link></li>
          </ul>
        </div>

        {/* Get Involved Column */}
        <div className={styles.footerCol}>
          <h4 className={styles.colHeading}>Join the Movement</h4>
          <ul className={styles.colLinks}>
            <li><Link to="/restaurant">Food Donor Portal</Link></li>
            <li><Link to="/ngo">NGO Portal</Link></li>
          </ul>
        </div>

        {/* Contact Us Column */}
        <div className={styles.footerCol}>
          <h4 className={styles.colHeading}>Get In Touch</h4>
          <div className={styles.contactDetails}>
            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <span>Kurunji Extension, CEG, Chennai 600 028</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} FoodLink. Made with <FaHeart className={styles.heartIcon} /> for a better community.</p>
      </div>
    </footer>
  );
}

export default Footer;
