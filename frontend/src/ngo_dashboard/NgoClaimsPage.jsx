import React, { useState, useEffect } from 'react';
import styles from './NgoClaimsPage.module.css';
import { getMyClaims, updateClaimStatus } from '../services/claimService';
import MessageUserButton from '../components/MessageUserButton';

const STATUS_FLOW = ['claimed', 'picked_up', 'delivered'];

function NgoClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyClaims();
        setClaims(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const advance = async (claim) => {
    const idx = STATUS_FLOW.indexOf(claim.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    try {
      await updateClaimStatus(claim._id, next);
      setClaims((prev) => prev.map((c) => (c._id === claim._id ? { ...c, status: next } : c)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className={styles.page}>
      <h2>My Claims &amp; Timeline</h2>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? <p>Loading...</p> : (
        <ul className={styles.list}>
          {claims.map((c) => (
            <li key={c._id} className={styles.card}>
              <h3>{c.listing?.title}</h3>
              <p>Status: <strong>{c.status}</strong></p>
              <ol className={styles.timeline}>
                {(c.timeline || []).map((t, i) => (
                  <li key={i}>{t.status} — {new Date(t.timestamp).toLocaleString()}</li>
                ))}
              </ol>
              <div className={styles.actions}>
                {c.listing?.postedBy?._id && (
                  <MessageUserButton
                    userId={c.listing.postedBy._id}
                    userName={c.listing.postedBy.name}
                    listingId={c.listing._id}
                    className={styles.msgBtn}
                  />
                )}
                {c.status !== 'delivered' && c.status !== 'cancelled' && (
                  <button type="button" className={styles.btn} onClick={() => advance(c)}>Advance status</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NgoClaimsPage;
