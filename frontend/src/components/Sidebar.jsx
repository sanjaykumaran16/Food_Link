import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { FaTimes, FaBell } from 'react-icons/fa';


function Sidebar({ isOpen, closeSidebar, currentUser }) {
  // Combine base class with conditional class for open state
  const sidebarClass = `${styles.sidebar} ${isOpen ? styles.open : ''}`;

  // Determine userType from currentUser object
  const userType = currentUser?.type; // Get type from user object (e.g., 'restaurant', 'ngo')
  const unreadCount = currentUser?.unreadNotificationCount || 0;

  // Determine content based on userType
  let sidebarTitle = 'Menu';
  let navLinks = null;

  if (userType === 'restaurant') {
    sidebarTitle = 'Explore Menu';
    navLinks = (
      <>
        <li>
          {/* Add link back to main restaurant dashboard */}
          <NavLink 
            to="/restaurant/dashboard" 
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            onClick={closeSidebar}
          >
            {/* <FaTachometerAlt className={styles.icon} /> */}
            Dashboard Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/restaurant/dashboard/add"
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            onClick={closeSidebar}
          >
            {/* <FaPlus className={styles.icon} /> */}
            Add Food Listing
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/restaurant/dashboard/listings" 
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            onClick={closeSidebar}
          >
             {/* <FaListAlt className={styles.icon} /> */}
             My Listings
          </NavLink>
        </li>
         <li>
          <NavLink
            to="/restaurant/dashboard/notifications"
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            onClick={closeSidebar}
          >
             <FaBell className={styles.icon} /> 
             Notifications
             {unreadCount > 0 && (
                <span className={styles.notificationBadge}>{unreadCount}</span>
             )}
          </NavLink>
        </li>
        <li>
          <NavLink to="/restaurant/dashboard/analytics" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeSidebar}>Analytics</NavLink>
        </li>
        <li>
          <NavLink to="/restaurant/dashboard/photos" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeSidebar}>Photos &amp; Safety</NavLink>
        </li>
        <li>
          <NavLink to="/restaurant/dashboard/messages" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeSidebar}>Messages</NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeSidebar}>Profile</NavLink>
        </li>
      </>
    );
  } else if (userType === 'ngo') {
    sidebarTitle = 'NGO Menu';
    navLinks = (
      <>
        <li>
           <NavLink 
             to="/ngo/dashboard" 
             className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
             onClick={closeSidebar}
           >
            {/* <FaTachometerAlt className={styles.icon} /> */}
             Dashboard Home
          </NavLink>
        </li>
        <li>
           {/* Updated Link path for Available Listings */}
           <NavLink 
             to="/ngo/dashboard/available" 
             className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
             onClick={closeSidebar}
            >
            {/* <FaListAlt className={styles.icon} /> */}
             Available Donations
          </NavLink>
        </li>
        <li>
          <NavLink to="/ngo/dashboard/browse" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeSidebar}>Map Browse</NavLink>
        </li>
        <li>
          <NavLink to="/ngo/dashboard/claims" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeSidebar}>My Claims</NavLink>
        </li>
        <li>
          <NavLink to="/ngo/dashboard/messages" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeSidebar}>Messages</NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeSidebar}>Profile</NavLink>
        </li>
      </>
    );
  } else if (userType === 'volunteer') {
    sidebarTitle = 'Volunteer Menu';
    navLinks = (
      <>
        <li>
          <NavLink to="/volunteer/dashboard" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeSidebar}>Delivery Tasks</NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeSidebar}>Profile</NavLink>
        </li>
      </>
    );
  }

  // If no userType (e.g., on homepage where hamburger isn't shown), 
  // sidebar might still be forced open via dev tools, so render empty or default state.
  if (!userType && isOpen) {
     sidebarTitle = 'Menu';
     navLinks = <li><span className={styles.navLink}>No actions available</span></li>;
  }

  return (
    <>
      {/* Optional: Overlay to click and close sidebar */}
      {isOpen && <div className={styles.overlay} onClick={closeSidebar}></div>}
      
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
