import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './HomePage.module.css';
import { FaHandsHelping, FaUtensils, FaBuilding, FaQuoteLeft, FaStar, FaGlobe, FaShieldAlt, FaHeart } from 'react-icons/fa';

function HomePage() {
  const [stats, setStats] = useState({ restaurants: 12, ngos: 8, donations: 340 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
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
            <span>Connecting surplus to hunger</span>
          </div>
          <h1>
            Bridging the Gap Between <br />
            <span className={styles.highlightText}>Surplus Food & Social Impact</span>
          </h1>
          <p className={styles.subtitle}>
            A streamlined, trust-centric ecosystem connecting restaurant donors with local NGOs to eliminate waste and deliver warm meals to those who need them most.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/restaurant" className={styles.ctaButtonPrimary}>
              <FaBuilding className={styles.btnIcon} /> I'm a Restaurant
            </Link>
            <Link to="/ngo" className={styles.ctaButtonSecondary}>
              <FaHandsHelping className={styles.btnIcon} /> I'm an NGO
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
            <p className={styles.impactLabel}>Surplus Meals Redirected</p>
          </div>
          <div className={styles.impactCard}>
            <div className={styles.impactIconBg}><FaHandsHelping /></div>
            <h3 className={styles.impactNumber}>
              {loadingStats ? '...' : `${stats.ngos}`}
            </h3>
            <p className={styles.impactLabel}>Active NGO Partners</p>
          </div>
          <div className={styles.impactCard}>
            <div className={styles.impactIconBg}><FaBuilding /></div>
            <h3 className={styles.impactNumber}>
              {loadingStats ? '...' : `${stats.restaurants}`}
            </h3>
            <p className={styles.impactLabel}>Registered Restaurant Donors</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.featuresSection}>
        <h2>How FoodLink Works</h2>
        <p className={styles.sectionSubtitle}>A simple 3-step loop designed for maximum efficiency and immediate social impact.</p>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconCircle}><FaBuilding size={24} /></div>
            <h3>1. Restaurants List Surplus</h3>
            <p>Easily post excess meals, fresh ingredients, or daily surplus along with quantities and expiration times.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconCircle}><FaHandsHelping size={24} /></div>
            <h3>2. NGOs Claim Immediately</h3>
            <p>Nearby verified NGOs receive notification, check details, and claim the donation instantly via their dashboard.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconCircle}><FaUtensils size={24} /></div>
            <h3>3. Food reaches the Table</h3>
            <p>NGO coordinators coordinate instant pickups and safely distribute quality meals directly to target beneficiaries.</p>
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className={styles.trustSection}>
        <div className={styles.trustIntro}>
          <h2>Built on Mutual Trust & Safety</h2>
          <p>Every account is fully verified to ensure strict food safety standards and absolute transparent coordination.</p>
        </div>
        <div className={styles.trustGrid}>
          <div className={styles.trustCard}>
            <FaShieldAlt className={styles.trustIcon} />
            <h4>Verified Accounts Only</h4>
            <p>Only registered food businesses and accredited NGOs are approved to request or list donations.</p>
          </div>
          <div className={styles.trustCard}>
            <FaGlobe className={styles.trustIcon} />
            <h4>Real-time Notifications</h4>
            <p>Instantly alert stakeholders of available donations and claim updates to reduce pickup delays.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonialsSection}>
        <h2>Voices of Our Partners</h2>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((t, idx) => (
            <div key={idx} className={styles.testimonialCard}>
              <FaQuoteLeft className={styles.quoteIcon} />
              <p className={styles.testimonialText}>"{t.quote}"</p>
              <div className={styles.stars}>
                {[...Array(t.rating)].map((_, i) => (
                  <FaStar key={i} className={styles.starIcon} />
                ))}
              </div>
              <div className={styles.authorDetails}>
                <h5 className={styles.authorName}>{t.author}</h5>
                <span className={styles.authorRole}>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage; 