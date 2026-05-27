import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from './NgoLogin.module.css'; // We'll create this CSS module next
import { FaEnvelope, FaLock } from 'react-icons/fa'; // Import icons

function NgoLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    const apiUrl = `${import.meta.env.VITE_API_URL}/api/ngos/login`;
    console.log('Attempting NGO login to:', apiUrl);

    try {
      const response = await fetch(apiUrl, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Safely parse JSON — guards against empty or non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || 'Unexpected server response' };
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful login
      console.log('NGO Login successful:', data);
      // Store token (ensure your backend actually sends a token named 'token')
      if (data.token) {
        localStorage.setItem('ngoToken', data.token);
        // Redirect to dashboard
        navigate('/ngo/dashboard');
      } else {
        // Handle case where login succeeds but no token is returned
        console.error('Login successful but no token received.');
        setError('Login failed: Could not authenticate session.');
      }
      // Remove placeholder alerts/storage
      // localStorage.setItem('userInfo', JSON.stringify(data)); 
      // alert('NGO Login successful! Token stored.'); 

    } catch (err) {
      console.error('NGO Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
     // Remove placeholder alert
     // alert('NGO Login functionality not yet implemented. Check console for data.');
  };

  return (
    <div className={styles.loginContainer}>
      <h2>NGO Login</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.inputIcon} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your NGO email"
              required 
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
              minLength="6" 
            />
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>Login</button>
      </form>
      {/* Optional: Link to registration */}
      {/* <p className={styles.switchFormText}>Don't have an account? <Link to="/ngo/register">Register here</Link></p> */}
    </div>
  );
}

export default NgoLogin; 