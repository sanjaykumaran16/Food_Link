import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styles from './HomePage.module.css';
import { FaHandsHelping, FaUtensils, FaBuilding, FaQuoteLeft, FaStar, FaGlobe, FaShieldAlt, FaHeart } from 'react-icons/fa';
import { getPublicStats } from '../services/impactService';

function HomePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ restaurants: 12, ngos: 8, donations: 340 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPublicStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch live stats, using default values:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const testimonials = [
    {
      quote: "FoodLink has revolutionized how we manage excess inventory. Instead of wasting surplus ingredients, we can instantly feed 50+ local families every single week. The interface is incredibly fast and secure.",
      author: "Chef Marcus Vance",
      role: "Owner, Green Bistro",
      rating: 5
    },
    {
      quote: "As an NGO, timing is absolutely critical for fresh food listings. With FoodLink's real-time alerts and simple claiming flow, we pick up hot meals and distribute them while they are perfectly fresh.",
      author: "Sarah Jenkins",
      role: "Director, Community Table NGO",
      rating: 5
    }
  ];

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.tagline}>
            <FaHeart className={styles.tagIcon} />
            <span>{t('home.heroTagline')}</span>
          </div>
          <h1>
            {t('home.heroTitle1')} <br />
            <span className={styles.highlightText}>{t('home.heroTitle2')}</span>
          </h1>
          <p className={styles.subtitle}>{t('home.heroSubtitle')}</p>
          <div className={styles.ctaButtons}>
            <Link to="/restaurant" className={styles.ctaButtonPrimary}>
              <FaBuilding className={styles.btnIcon} /> {t('home.iAmRestaurant')}
            </Link>
            <Link to="/ngo" className={styles.ctaButtonSecondary}>
              <FaHandsHelping className={styles.btnIcon} /> {t('home.iAmNgo')}
            </Link>
          </div>
        </div>
      </header>

      {/* Live Impact Counters */}
      <section className={styles.impactSection}>
        <div className={styles.impactGrid}>
          <div className={styles.impactCard}>
            <div className={styles.impactIconBg}><FaUtensils /></div>
            <h3 className={styles.impactNumber}>
              {loadingStats ? '...' : `${stats.donations}`}
            </h3>
            <p className={styles.impactLabel}>{t('home.mealCount')}</p>
          </div>
          <div className={styles.impactCard}>
            <div className={styles.impactIconBg}><FaHandsHelping /></div>
            <h3 className={styles.impactNumber}>
              {loadingStats ? '...' : `${stats.ngos}`}
            </h3>
            <p className={styles.impactLabel}>{t('home.ngoCount')}</p>
          </div>
          <div className={styles.impactCard}>
            <div className={styles.impactIconBg}><FaBuilding /></div>
            <h3 className={styles.impactNumber}>
              {loadingStats ? '...' : `${stats.restaurants}`}
            </h3>
            <p className={styles.impactLabel}>{t('home.restaurantCount')}</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.featuresSection}>
        <h2>{t('home.howTitle')}</h2>
        <p className={styles.sectionSubtitle}>{t('home.howSubtitle')}</p>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconCircle}><FaBuilding size={24} /></div>
            <h3>{t('home.step1Title')}</h3>
            <p>{t('home.step1Desc')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconCircle}><FaHandsHelping size={24} /></div>
            <h3>{t('home.step2Title')}</h3>
            <p>{t('home.step2Desc')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconCircle}><FaUtensils size={24} /></div>
            <h3>{t('home.step3Title')}</h3>
            <p>{t('home.step3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className={styles.trustSection}>
        <div className={styles.trustIntro}>
          <h2>{t('home.trustTitle')}</h2>
          <p>{t('home.trustDesc')}</p>
        </div>
        <div className={styles.trustGrid}>
          <div className={styles.trustCard}>
            <FaShieldAlt className={styles.trustIcon} />
            <h4>{t('home.trustCard1Title')}</h4>
            <p>{t('home.trustCard1Desc')}</p>
          </div>
          <div className={styles.trustCard}>
            <FaGlobe className={styles.trustIcon} />
            <h4>{t('home.trustCard2Title')}</h4>
            <p>{t('home.trustCard2Desc')}</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonialsSection}>
        <h2>{t('home.testimonialsTitle')}</h2>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((t_item, idx) => (
            <div key={idx} className={styles.testimonialCard}>
              <FaQuoteLeft className={styles.quoteIcon} />
              <p className={styles.testimonialText}>"{t_item.quote}"</p>
              <div className={styles.stars}>
                {[...Array(t_item.rating)].map((_, i) => (
                  <FaStar key={i} className={styles.starIcon} />
                ))}
              </div>
              <div className={styles.authorDetails}>
                <h5 className={styles.authorName}>{t_item.author}</h5>
                <span className={styles.authorRole}>{t_item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;