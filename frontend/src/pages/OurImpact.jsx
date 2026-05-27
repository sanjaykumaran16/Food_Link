import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUtensils, FaUsers, FaGlobe, FaTrophy, FaCalendarCheck, FaQuoteLeft, FaHandshake, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './OurImpact.module.css';

// Animated Count component using requestAnimationFrame
function AnimatedCount({ value, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, value, duration]);

  return <span ref={elementRef}>{count.toLocaleString()}{suffix}</span>;
}

function OurImpact() {
  const timelineMilestones = [
    {
      year: "2025",
      title: "The Vision Born",
      desc: "FoodLink concept conceived to solve the critical mismatch between restaurant surplus and local hunger centers.",
      icon: <FaGlobe />
    },
    {
      year: "Q1 2026",
      title: "Platform Launch",
      desc: "Officially went live in the LA metro area with our first 10 food donor restaurants and 5 NGO partners.",
      icon: <FaHandshake />
    },
    {
      year: "Q2 2026",
      title: "1,000 Meals Redirected",
      desc: "Passed our first major food rescue milestone, preventing tons of greenhouse gas emissions from landfills.",
      icon: <FaUtensils />
    },
    {
      year: "Future Vision",
      title: "Expanding Horizons",
      desc: "Scaling to state-wide operations with automated routes, predictive surplus dispatching, and community fridges.",
      icon: <FaTrophy />
    }
  ];

  const spotlights = [
    {
      name: "Sarah Jenkins",
      role: "Owner, Green Bistro",
      quote: "FoodLink completely altered how we handle surplus. Instead of discarding fresh, edible meals, we see them go directly to people who appreciate them. It built tremendous pride in our kitchen staff.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80"
    },
    {
      name: "Marcus Vance",
      role: "Coordinator, Hope Food Agency",
      quote: "As an NGO, getting dependable, high-quality, fresh food is a constant battle. FoodLink connects us directly with local kitchens. The speed and quality are absolutely unmatched.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
    }
  ];

  return (
    <div className={styles.impactContainer}>
      {/* Hero Banner Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <span className={styles.subtext}>Our Collective Journey</span>
          <h1 className={styles.mainTitle}>Eliminating Waste. Feeding Hope.</h1>
          <p className={styles.heroSubtitle}>
            Every listing claimed, every meal shared, and every partnership made brings us closer to a zero-food-waste community. See the difference we make together.
          </p>
        </div>
      </section>

      {/* Numbers Section */}
      <section className={styles.statsSection}>
        <div className={styles.sectionHeading}>
          <h2>Impact in Numbers</h2>
          <p>Real-time milestones accomplished by our incredible community of donors and NGOs.</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconBg}><FaUtensils /></div>
            <h3 className={styles.statNumber}>
              <AnimatedCount value={2450} suffix="+" />
            </h3>
            <span className={styles.statLabel}>Nutritious Meals Served</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBg}><FaUsers /></div>
            <h3 className={styles.statNumber}>
              <AnimatedCount value={85} suffix="%" />
            </h3>
            <span className={styles.statLabel}>NGO Demand Fulfilled</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBg}><FaCalendarCheck /></div>
            <h3 className={styles.statNumber}>
              <AnimatedCount value={120} suffix="+" />
            </h3>
            <span className={styles.statLabel}>Active Donor Kitchens</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBg}><FaGlobe /></div>
            <h3 className={styles.statNumber}>
              <AnimatedCount value={1800} suffix=" kg" />
            </h3>
            <span className={styles.statLabel}>CO₂ Emissions Saved</span>
          </div>
        </div>
      </section>

      {/* Goal Progress Ring Section */}
      <section className={styles.goalSection}>
        <div className={styles.goalContainer}>
          <div className={styles.goalInfo}>
            <span className={styles.goalBadge}>Current Initiative</span>
            <h2>Our Next Community Milestone</h2>
            <p>
              We've partnered with local municipal kitchens to target a massive community goal: redirecting <strong>5,000 total meals</strong> by the end of Q3. 
            </p>
            <p className={styles.goalSupporting}>
              Your active listing creations and claims directly drive this meter. Let's hit the goal together!
            </p>
          </div>

          <div className={styles.goalMeterWrapper}>
            <div className={styles.progressRing}>
              <svg className={styles.ringSvg}>
                <circle className={styles.ringBg} cx="100" cy="100" r="85"></circle>
                <circle className={styles.ringProgress} cx="100" cy="100" r="85"></circle>
              </svg>
              <div className={styles.ringText}>
                <span className={styles.percentage}>68%</span>
                <span className={styles.subText}>Completed</span>
              </div>
            </div>
            <div className={styles.meterLegend}>
              <span><strong>3,400</strong> Rescued</span>
              <span className={styles.legendDivider}>/</span>
              <span><strong>5,000</strong> Goal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className={styles.timelineSection}>
        <div className={styles.sectionHeading}>
          <h2>Platform Milestones</h2>
          <p>Chronological milestones and our roadmap towards a sustainable food rescue infrastructure.</p>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineLine}></div>
          {timelineMilestones.map((m, idx) => (
            <div key={idx} className={`${styles.timelineItem} ${idx % 2 === 0 ? styles.left : styles.right}`}>
              <div className={styles.timelineBadge}>
                {m.icon}
              </div>
              <div className={styles.timelineContent}>
                <span className={styles.timelineYear}>{m.year}</span>
                <h3 className={styles.timelineTitle}>{m.title}</h3>
                <p className={styles.timelineDesc}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spotlights / Testimonials */}
      <section className={styles.spotlightSection}>
        <div className={styles.sectionHeading}>
          <h2>Partnership Spotlights</h2>
          <p>Hear from the real restaurant owners and NGO staff driving this change every day.</p>
        </div>

        <div className={styles.spotlightGrid}>
          {spotlights.map((s, idx) => (
            <div key={idx} className={styles.spotlightCard}>
              <span className={styles.quoteIcon}><FaQuoteLeft /></span>
              <p className={styles.quoteText}>{s.quote}</p>
              <div className={styles.authorRow}>
                <img src={s.avatar} alt={s.name} className={styles.avatar} />
                <div>
                  <h4 className={styles.authorName}>{s.name}</h4>
                  <span className={styles.authorRole}>{s.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to write the next chapter?</h2>
          <p>Whether you're a local kitchen with surplus food or an NGO serving the community, your involvement matters.</p>
          <div className={styles.ctaButtons}>
            <Link to="/restaurant" className={styles.primaryCta}>
              Become a Donor <FaArrowRight />
            </Link>
            <Link to="/ngo" className={styles.secondaryCta}>
              Register as NGO <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OurImpact;
