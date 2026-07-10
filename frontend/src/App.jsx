import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaInfoCircle, FaChartBar, FaHome } from 'react-icons/fa';

import RestaurantLogin from './restraunt_login/RestaurantLogin';
import RestaurantRegistration from './restraunt_reg/RestaurantRegistration';
import NgoRegistration from './ngo_reg/NgoRegistration';
import NgoLogin from './ngo_login/NgoLogin';
import RestaurantPortal from './portals/RestaurantPortal';
import NgoPortal from './portals/NgoPortal';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import OurImpact from './pages/OurImpact';
import RestaurantDashboard from './restaurant_dashboard/RestaurantDashboard';
import AddFoodListing from './restaurant_dashboard/AddFoodListing';
import MyRestaurantListings from './restaurant_dashboard/MyRestaurantListings';
import NotificationsPage from './restaurant_dashboard/NotificationsPage';
import NgoDashboard from './ngo_dashboard/NgoDashboard';
import AvailableListings from './ngo_dashboard/AvailableListings';
import Sidebar from './components/Sidebar';
import ProfileDropdown from './components/ProfileDropdown';
import ThemeToggle from './components/ThemeToggle';
import Footer from './components/Footer';
import LanguageSwitcher from './components/LanguageSwitcher';
import BrowseMapPage from './ngo_dashboard/BrowseMapPage';
import NgoClaimsPage from './ngo_dashboard/NgoClaimsPage';
import MessagesPage from './messages/MessagesPage';
import ProfilePage from './profile/ProfilePage';
import RestaurantAnalytics from './restaurant_dashboard/RestaurantAnalytics';
import RestaurantReviews from './restaurant_dashboard/RestaurantReviews';
import ListingPhotoUpload from './foodlisting/ListingPhotoUpload';
import ResetPassword from './pages/ResetPassword';
import { getMe } from './services/authService';

import './App.css';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -10
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

const AnimatedRoute = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (isDarkMode) {
      rootElement.classList.add('dark-mode');
    } else {
      rootElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const showHamburger = location.pathname.startsWith('/restaurant/dashboard') || 
                        location.pathname.startsWith('/ngo/dashboard') ||
                        location.pathname === '/profile';
  
  let userType = null;
  if (location.pathname.startsWith('/restaurant/dashboard')) {
      userType = 'restaurant';
  } else if (location.pathname.startsWith('/ngo/dashboard')) {
      userType = 'ngo';
  } else if (location.pathname === '/profile') {
      userType = localStorage.getItem('userRole');
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
        if (userType && (localStorage.getItem('accessToken') || localStorage.getItem(`${userType}Token`))) {
            setIsLoadingUser(true);
            try {
                const data = await getMe();
                setCurrentUser({ ...data, type: data.role || userType, contactNumber: data.phone });
                localStorage.setItem('userId', data._id);
            } catch (error) {
                console.error('Error fetching user details:', error);
                setCurrentUser(null);
            } finally {
                setIsLoadingUser(false);
            }
        } else {
            setCurrentUser(null);
        }
    };

    if (showHamburger) {
        fetchUserDetails();
    } else {
        setCurrentUser(null);
        setIsLoadingUser(false);
    }
  }, [location.pathname, userType, showHamburger]);

  const handleHomeClick = (e) => {
    if (currentUser) {
      e.preventDefault();
      alert("Cannot go to Home page while logged in. Please log out first.");
    }
  };

  const handleLogout = () => {
    console.log("Logging out..."); 
    const userType = currentUser?.type; 
    if (userType === 'ngo') localStorage.removeItem('ngoToken');
    else if (userType === 'restaurant') localStorage.removeItem('restaurantToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setCurrentUser(null);
    navigate('/'); 
  };

  return (
    <div className="appContainer">
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeSidebar={toggleSidebar} 
        currentUser={currentUser}
      />

      <div className="mainContentWithNavbar">
        <nav className="appNavbar">
          <NavLink to="/" className="navbarLogo">
            <img src="/logo.png" alt="Food Link Logo" className="navbarLogoImg" />
            <span className="navbarLogoText">Food Link</span>
          </NavLink>
          {showHamburger && (
            <button onClick={toggleSidebar} className="hamburgerButton">
              <FaBars />
            </button>
          )}
          <ul className="navList" style={{ paddingLeft: showHamburger ? '0' : '2rem' }}>
            <li><NavLink to="/" onClick={handleHomeClick} className={({ isActive }) => isActive && !currentUser ? "active" : ""}><FaHome className="navIcon" /></NavLink></li>
            {!currentUser && (
              <>
                <li><NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""}><FaInfoCircle className="navIcon" /></NavLink></li>
                <li><NavLink to="/impact" title="Our Impact" className={({ isActive }) => isActive ? "active" : ""}><FaChartBar className="navIcon" /></NavLink></li>
              </>
            )}
          </ul>
          <div className="navbarRight">
            {showHamburger && !isLoadingUser && currentUser && (
                <ProfileDropdown user={currentUser} onLogout={handleLogout} />
            )}
            <LanguageSwitcher />
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            {showHamburger && isLoadingUser && (
                <div className="navbarLoading">...</div> 
            )}
          </div>
        </nav>

        <div className="mainContentContainer">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<AnimatedRoute><HomePage /></AnimatedRoute>} />
              <Route path="/about" element={<AnimatedRoute><AboutUs /></AnimatedRoute>} />
              <Route path="/impact" element={<AnimatedRoute><OurImpact /></AnimatedRoute>} />
              <Route path="/restaurant" element={<AnimatedRoute><RestaurantPortal /></AnimatedRoute>} />
              <Route path="/ngo" element={<AnimatedRoute><NgoPortal /></AnimatedRoute>} />
              <Route path="/restaurant/login" element={<AnimatedRoute><RestaurantLogin /></AnimatedRoute>} />
              <Route path="/restaurant/register" element={<AnimatedRoute><RestaurantRegistration /></AnimatedRoute>} />
              <Route path="/ngo/register" element={<AnimatedRoute><NgoRegistration /></AnimatedRoute>} />
              <Route path="/ngo/login" element={<AnimatedRoute><NgoLogin /></AnimatedRoute>} />
              
              <Route path="/restaurant/dashboard" element={<AnimatedRoute><RestaurantDashboard /></AnimatedRoute>} />
              <Route path="/restaurant/dashboard/add" element={<AnimatedRoute><AddFoodListing /></AnimatedRoute>} />
              <Route path="/restaurant/dashboard/listings" element={<AnimatedRoute><MyRestaurantListings /></AnimatedRoute>} />
              <Route path="/restaurant/dashboard/notifications" element={<AnimatedRoute><NotificationsPage /></AnimatedRoute>} />
              
              <Route path="/ngo/dashboard" element={<AnimatedRoute><NgoDashboard /></AnimatedRoute>} />
              <Route path="/ngo/dashboard/available" element={<AnimatedRoute><AvailableListings /></AnimatedRoute>} />
              <Route path="/ngo/dashboard/browse" element={<AnimatedRoute><BrowseMapPage /></AnimatedRoute>} />
              <Route path="/ngo/dashboard/claims" element={<AnimatedRoute><NgoClaimsPage /></AnimatedRoute>} />
              <Route path="/ngo/dashboard/messages" element={<AnimatedRoute><MessagesPage /></AnimatedRoute>} />

              <Route path="/restaurant/dashboard/analytics" element={<AnimatedRoute><RestaurantAnalytics /></AnimatedRoute>} />
              <Route path="/restaurant/dashboard/reviews" element={<AnimatedRoute><RestaurantReviews /></AnimatedRoute>} />
              <Route path="/restaurant/dashboard/messages" element={<AnimatedRoute><MessagesPage /></AnimatedRoute>} />
              <Route path="/restaurant/dashboard/photos" element={<AnimatedRoute><ListingPhotoUpload /></AnimatedRoute>} />

              <Route path="/profile" element={<AnimatedRoute><ProfilePage /></AnimatedRoute>} />
              <Route path="/reset-password" element={<AnimatedRoute><ResetPassword /></AnimatedRoute>} />

              <Route path="*" element={<AnimatedRoute><div><h2>404 Not Found</h2></div></AnimatedRoute>} />
            </Routes>
          </AnimatePresence>
        </div>
        {!showHamburger && <Footer />}
      </div>
    </div>
  );
}

export default App;
