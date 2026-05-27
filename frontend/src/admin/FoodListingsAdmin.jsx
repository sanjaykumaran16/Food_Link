import React, { useState, useEffect } from 'react';

// Assuming we need similar fetching logic as NgoDashboard but maybe without restriction?
// Or perhaps this needs admin-specific endpoint?

function FoodListingsAdmin() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllListings = async () => {
      setLoading(true);
      setError('');
      
      // TODO: Get admin token if required for this endpoint
      const token = localStorage.getItem('adminToken') || localStorage.getItem('ngoToken') || localStorage.getItem('restaurantToken'); // Placeholder logic for token
      
      if (!token) {
        // setError('Admin authentication required.'); 
        // setLoading(false);
        // For now, maybe allow anonymous view or use NGO token for testing?
        console.warn('No admin token found, attempting fetch without specific auth for testing...');
      } 

      try {
        const apiUrl = '/api/foodlistings'; 
        // NOTE: This currently uses the NGO-restricted endpoint. 
        // You might need a separate admin endpoint /api/admin/foodlistings 
        // OR adjust the backend middleware for /api/foodlistings to allow admins.

        console.log('Admin: Fetching listings');
        
        const response = await fetch(apiUrl, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {} // Send token if available
        });

        if (!response.ok) {
           // If using the NGO endpoint, non-NGOs will get 403 Forbidden here.
           const errorData = await response.json(); 
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setListings(data); 

      } catch (err) {
        console.error('Admin: Error fetching listings:', err);
        // Provide a more specific error if possible (e.g., if status is 403)
        setError(err.message.includes('403') ? 'Access Forbidden: Admin role required?' : err.message || 'Could not load food listings.');
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllListings();
  }, []); 

  return (
    <div>
      <h2>Admin: All Food Listings</h2>
      
      {loading && <p>Loading listings...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && (
        listings.length > 0 ? (
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Restaurant Address</th>
                <th>Listed At</th>
                 {/* TODO: Add Restaurant Name/ID? Needs population on backend. */}
                {/* TODO: Add Actions (e.g., Delete) */}
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing._id}>
                  <td>{listing.itemName}</td>
                  <td>{listing.quantity}</td>
                  <td>{new Date(listing.expiryDate).toLocaleDateString()}</td> 
                  <td>{listing.address}</td>
                  <td>{new Date(listing.listedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No food listings found.</p>
        )
      )}
    </div>
  );
}

export default FoodListingsAdmin; 