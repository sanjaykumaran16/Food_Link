import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt, FaUsers, FaHeart } from 'react-icons/fa';
import styles from './Footer.module.css';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Brand Column */}
        <div className={styles.footerCol}>
          <h3 className={styles.brandTitle}>{t('appName')}</h3>
          <p className={styles.brandTagline}>{t('footer.tagline')}</p>
        </div>

        {/* Links Column */}
        <div className={styles.footerCol}>
          <h4 className={styles.colHeading}>{t('footer.quickLinks')}</h4>
          <ul className={styles.colLinks}>
            <li><Link to="/">{t('footer.home')}</Link></li>
            <li><Link to="/about">{t('footer.aboutUs')}</Link></li>
            <li><Link to="/impact">{t('footer.ourImpact')}</Link></li>
          </ul>
        </div>

        {/* Get Involved Column */}
        <div className={styles.footerCol}>
          <h4 className={styles.colHeading}>{t('footer.joinMovement')}</h4>
          <ul className={styles.colLinks}>
            <li><Link to="/restaurant">{t('footer.foodDonorPortal')}</Link></li>
            <li><Link to="/ngo">{t('footer.ngoPortal')}</Link></li>
          </ul>
        </div>

        {/* Contact Us Column */}
        <div className={styles.footerCol}>
          <h4 className={styles.colHeading}>{t('footer.getInTouch')}</h4>
          <div className={styles.contactDetails}>
            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <span>Kurunji Extension, CEG, Chennai 600 028</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} {t('appName')}. {t('footer.copyright')}</p>
      </div>
    </footer>
  );
}

export default Footer;
