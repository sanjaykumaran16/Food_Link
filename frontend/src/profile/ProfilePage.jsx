import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { getMe, updateProfile } from '../services/authService';
import { getReviewsForUser } from '../services/reviewService';
import { downloadCertificate } from '../services/impactService';
import { CATEGORIES } from '../components/FoodSafetyChecklist';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [prefs, setPrefs] = useState({
    preferredCategories: [],
    dailyMealCapacity: 100,
    serviceRadiusKm: 15,
  });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
        setPrefs({
          preferredCategories: me.preferredCategories || [],
          dailyMealCapacity: me.dailyMealCapacity ?? 100,
          serviceRadiusKm: me.serviceRadiusKm ?? 15,
        });
        setEditForm({
          name: me.name || '',
          phone: me.phone || me.contactNumber || '',
          address: me.address || '',
          city: me.city || '',
          pincode: me.pincode || '',
        });
        const rev = await getReviewsForUser(me._id);
        setReviews(rev);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startEditing = () => {
    setEditForm({
      name: user.name || '',
      phone: user.phone || user.contactNumber || '',
      address: user.address || '',
      city: user.city || '',
      pincode: user.pincode || '',
    });
    setSaveMsg('');
    setError('');
    setIsEditing(true);
  };

  const saveProfileInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setError('');
    try {
      const updated = await updateProfile(editForm);
      setUser(updated);
      setIsEditing(false);
      setSaveMsg('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCertificate = async () => {
    try {
      const blob = await downloadCertificate(user._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'foodlink-impact.pdf';
      a.click();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const toggleCategory = (value) => {
    setPrefs((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(value)
        ? prev.preferredCategories.filter((c) => c !== value)
        : [...prev.preferredCategories, value],
    }));
  };

  const saveMatchingPrefs = async () => {
    setSaving(true);
    setSaveMsg('');
    setError('');
    try {
      const updated = await updateProfile(prefs);
      setUser(updated);
      setSaveMsg('Matching preferences saved.');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className={styles.page}>Loading profile...</p>;
  if (!user) return <p className={styles.page}>{error || 'Not logged in'}</p>;

  return (
    <div className={styles.page}>
      <h2>Profile</h2>
      {error && <p className={styles.error}>{error}</p>}
      {saveMsg && <p className={styles.success}>{saveMsg}</p>}
      {isEditing ? (
        <form onSubmit={saveProfileInfo} className={styles.card}>
          <div className={styles.formGroup}>
            <label htmlFor="edit-name">Name</label>
            <input
              id="edit-name"
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="edit-phone">Phone</label>
            <input
              id="edit-phone"
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="edit-address">Address</label>
            <input
              id="edit-address"
              type="text"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="edit-city">City</label>
            <input
              id="edit-city"
              type="text"
              value={editForm.city}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="edit-pincode">Pincode</label>
            <input
              id="edit-pincode"
              type="text"
              value={editForm.pincode}
              onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className={styles.btn} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className={styles.btn}
              style={{ background: '#7f8c8d' }}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.card}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Phone:</strong> {user.phone || user.contactNumber}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>City:</strong> {user.city || '-'}</p>
          <p><strong>Pincode:</strong> {user.pincode || '-'}</p>
          <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'Pending'}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className={styles.btn} style={{ marginTop: 0 }} onClick={startEditing}>
              Edit Profile
            </button>
            <button type="button" className={styles.btn} style={{ marginTop: 0 }} onClick={handleCertificate}>
              Download impact certificate
            </button>
          </div>
        </div>
      )}

      {user.role === 'ngo' && (
        <div className={styles.card}>
          <h3>Smart matching preferences</h3>
          <p className={styles.hint}>
            These settings power match scores on the Available Listings and map pages.
          </p>

          <div className={styles.formGroup}>
            <label>Preferred food categories</label>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map((c) => (
                <label key={c.value} className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={prefs.preferredCategories.includes(c.value)}
                    onChange={() => toggleCategory(c.value)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="capacity">Daily meal capacity</label>
            <input
              id="capacity"
              type="number"
              min="0"
              value={prefs.dailyMealCapacity}
              onChange={(e) => setPrefs({ ...prefs, dailyMealCapacity: Number(e.target.value) })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="radius">Service radius (km)</label>
            <input
              id="radius"
              type="number"
              min="1"
              max="50"
              value={prefs.serviceRadiusKm}
              onChange={(e) => setPrefs({ ...prefs, serviceRadiusKm: Number(e.target.value) })}
            />
          </div>

          <button type="button" className={styles.btn} onClick={saveMatchingPrefs} disabled={saving}>
            {saving ? 'Saving...' : 'Save preferences'}
          </button>
        </div>
      )}

      <h3>Reviews ({reviews.length})</h3>
      <ul className={styles.reviewList}>
        {reviews.map((r) => (
          <li key={r._id}>{r.rating}★ — {r.comment || 'No comment'} — {r.reviewer?.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ProfilePage;
