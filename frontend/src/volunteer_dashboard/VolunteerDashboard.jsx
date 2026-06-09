import React, { useState, useEffect } from 'react';
import styles from './VolunteerDashboard.module.css';
import { getTasks, acceptTask, updateTask } from '../services/volunteerService';
import { uploadProof } from '../services/claimService';

function VolunteerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (claimId) => {
    setError('');
    setSuccess('');
    try {
      await acceptTask(claimId);
      setSuccess('Task accepted');
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleStatus = async (claimId, status) => {
    setError('');
    try {
      await updateTask(claimId, status, `Updated to ${status}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleProof = async (claimId, file) => {
    if (!file) return;
    setError('');
    try {
      await uploadProof(claimId, file);
      setSuccess('Proof uploaded');
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h2>Volunteer Delivery Board</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>{success}</p>}
      {loading ? <p>Loading tasks...</p> : (
        <ul className={styles.taskList}>
          {tasks.length === 0 ? <li>No open tasks</li> : tasks.map((t) => (
            <li key={t._id} className={styles.taskCard}>
              <strong>{t.listing?.title}</strong>
              <p>Status: {t.status}</p>
              <p>Pickup: {t.listing?.pickupAddress || t.listing?.postedBy?.address}</p>
              {!t.volunteer && (
                <button type="button" className={styles.actionBtn} onClick={() => handleAccept(t._id)}>Accept</button>
              )}
              {t.volunteer && (
                <>
                  <button type="button" className={styles.actionBtn} onClick={() => handleStatus(t._id, 'picked_up')}>Mark Picked Up</button>
                  <button type="button" className={styles.actionBtn} onClick={() => handleStatus(t._id, 'delivered')}>Mark Delivered</button>
                  <input type="file" accept="image/*" onChange={(e) => handleProof(t._id, e.target.files[0])} />
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VolunteerDashboard;
