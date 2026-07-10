import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Sidebar.module.css';
import { FaTimes, FaBell } from 'react-icons/fa';

function Sidebar({ isOpen, closeSidebar, currentUser }) {
  const { t } = useTranslation();
  const sidebarClass = `${styles.sidebar} ${isOpen ? styles.open : ''}`;
  const userType = currentUser?.type;
  const unreadCount = currentUser?.unreadNotificationCount || 0;

  let sidebarTitle = 'Menu';
  let navLinks = null;

  const lnk = (to, label, extra) => (
    <li key={to}>
      <NavLink
        to={to}
        end
        className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        onClick={closeSidebar}
      >
        {extra}{label}
      </NavLink>
    </li>
  );

  if (userType === 'restaurant') {
    sidebarTitle = t('appName');
    navLinks = (
      <>
        {lnk('/restaurant/dashboard', t('sidebar.dashboardHome'))}
        {lnk('/restaurant/dashboard/add', t('sidebar.addListing'))}
        {lnk('/restaurant/dashboard/listings', t('sidebar.myListings'))}
        <li>
          <NavLink
            to="/restaurant/dashboard/notifications"
            end
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            onClick={closeSidebar}
          >
            <FaBell className={styles.icon} />
            {t('sidebar.notifications')}
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </NavLink>
        </li>
        {lnk('/restaurant/dashboard/analytics', t('sidebar.analytics'))}
        {lnk('/restaurant/dashboard/reviews', `⭐ ${t('sidebar.reviews')}`)}
        {lnk('/restaurant/dashboard/photos', t('sidebar.photosSafety'))}
        {lnk('/restaurant/dashboard/messages', t('sidebar.messages'))}
        {lnk('/profile', t('sidebar.profile'))}
      </>
    );
  } else if (userType === 'ngo') {
    sidebarTitle = t('appName');
    navLinks = (
      <>
        {lnk('/ngo/dashboard', t('sidebar.dashboardHome'))}
        {lnk('/ngo/dashboard/available', t('sidebar.availableDonations'))}
        {lnk('/ngo/dashboard/browse', t('sidebar.mapBrowse'))}
        {lnk('/ngo/dashboard/claims', t('sidebar.myClaims'))}
        {lnk('/ngo/dashboard/messages', t('sidebar.messages'))}
        {lnk('/profile', t('sidebar.profile'))}
      </>
    );
  }

  if (!userType && isOpen) {
    sidebarTitle = 'Menu';
    navLinks = <li><span className={styles.navLink}>No actions available</span></li>;
  }

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={closeSidebar} />}
      <nav className={sidebarClass}>
        <button className={styles.closeButton} onClick={closeSidebar}>
          <FaTimes />
        </button>
        <h3 className={styles.sidebarTitle}>{sidebarTitle}</h3>
        {navLinks && (
          <ul className={styles.navList}>
            {navLinks}
          </ul>
        )}
      </nav>
    </>
  );
}

export default Sidebar;
