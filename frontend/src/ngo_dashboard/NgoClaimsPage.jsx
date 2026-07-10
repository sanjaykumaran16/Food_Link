import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './NgoClaimsPage.module.css';
import { getMyClaims, confirmPickupSafety, confirmDeliverySafety } from '../services/claimService';
import MessageUserButton from '../components/MessageUserButton';
import ReviewModal from './ReviewModal';
import { FaStar } from 'react-icons/fa';

const PICKUP_FIELDS = [
  { key: 'receivedInSafeCondition', label: 'Food received in safe condition' },
  { key: 'tempVerified', label: 'Temperature verified at pickup' },
  { key: 'packagingIntact', label: 'Packaging is intact and sealed' },
  { key: 'withinTimeLimit', label: 'Pickup within safe time window' },
];

const DELIVERY_FIELDS = [
  { key: 'distributedSafely', label: 'Food distributed safely to recipients' },
  { key: 'recipientsInformed', label: 'Recipients informed about allergens / handling' },
];

function SafetyForm({ fields, values, onChange, onSubmit, submitLabel, notes, onNotesChange }) {
  return (
    <form className={styles.safetyForm} onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      {fields.map(({ key, label }) => (
        <label key={key} className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={Boolean(values[key])}
            onChange={(e) => onChange({ ...values, [key]: e.target.checked })}
          />
          {label}
        </label>
      ))}
      <textarea
        className={styles.notes}
        placeholder="Optional notes for audit trail..."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
      />
      <button type="submit" className={styles.btn}>{submitLabel}</button>
    </form>
  );
}

function StarDisplay({ rating }) {
  return (
    <span className={styles.starDisplay} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar key={s} className={s <= rating ? styles.starFilled : styles.starEmpty} />
      ))}
    </span>
  );
}

function NgoClaimsPage() {
  const { t } = useTranslation();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pickupForms, setPickupForms] = useState({});
  const [deliveryForms, setDeliveryForms] = useState({});
  const [pickupNotes, setPickupNotes] = useState({});
  const [deliveryNotes, setDeliveryNotes] = useState({});

  // Track which claims have been reviewed in this session
  const [reviewedClaimIds, setReviewedClaimIds] = useState(new Set());
  // Modal state
  const [reviewTarget, setReviewTarget] = useState(null); // { claimId, listingId, restaurantId, restaurantName, listingTitle }

  const loadClaims = async () => {
    const data = await getMyClaims();
    setClaims(data);

    const pickup = {};
    const delivery = {};
    for (const c of data) {
      pickup[c._id] = {
        receivedInSafeCondition: false,
        tempVerified: false,
        packagingIntact: false,
        withinTimeLimit: false,
      };
      delivery[c._id] = { distributedSafely: false, recipientsInformed: false };
    }
    setPickupForms(pickup);
    setDeliveryForms(delivery);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadClaims();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePickupConfirm = async (claimId) => {
    setError('');
    try {
      const updated = await confirmPickupSafety(claimId, {
        ...pickupForms[claimId],
        notes: pickupNotes[claimId] || '',
      });
      setClaims((prev) => prev.map((c) => (c._id === claimId ? updated : c)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeliveryConfirm = async (claimId) => {
    setError('');
    try {
      const updated = await confirmDeliverySafety(claimId, {
        ...deliveryForms[claimId],
        notes: deliveryNotes[claimId] || '',
      });
      setClaims((prev) => prev.map((c) => (c._id === claimId ? updated : c)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const openReviewModal = (claim) => {
    setReviewTarget({
      claimId: claim._id,
      listingId: claim.listing?._id,
      restaurantId: claim.listing?.postedBy?._id,
      restaurantName: claim.listing?.postedBy?.name || 'the restaurant',
      listingTitle: claim.listing?.title || claim.listing?.itemName || 'this listing',
    });
  };

  const handleReviewSuccess = (claimId) => {
    setReviewedClaimIds((prev) => new Set([...prev, claimId]));
    setReviewTarget(null);
  };

  return (
    <div className={styles.page}>
      <h2>{t('claims.title')}</h2>
      <p className={styles.subtitle}>{t('claims.subtitle')}</p>
      {error && <p className={styles.error}>{error}</p>}

      {loading ? <p>Loading...</p> : claims.length === 0 ? (
        <p className={styles.empty}>{t('claims.noClaimsYet')}</p>
      ) : (
        <ul className={styles.list}>
          {claims.map((c) => {
            const pickupDone = c.pickupSafetyConfirmation?.confirmedAt;
            const deliveryDone = c.deliverySafetyConfirmation?.confirmedAt;
            const isDelivered = c.status === 'delivered';
            const alreadyReviewed = reviewedClaimIds.has(c._id);
            const hasRestaurant = !!c.listing?.postedBy?._id;

            return (
              <li key={c._id} className={styles.card}>
                <h3>{c.listing?.title || c.listing?.itemName}</h3>
                <p>
                  Status: <strong className={`${styles.statusBadge} ${styles[`status_${c.status}`]}`}>{c.status.replace(/_/g, ' ')}</strong>
                </p>
                {c.listing?.safetyStatus && (
                  <p className={styles.safetyStatus}>Safety: {c.listing.safetyStatus}</p>
                )}

                <ol className={styles.timeline}>
                  {(c.timeline || []).map((t, i) => (
                    <li key={i}>{t.status} — {new Date(t.timestamp).toLocaleString()}{t.note ? ` (${t.note})` : ''}</li>
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
                </div>

                {!pickupDone && c.status !== 'delivered' && c.status !== 'cancelled' && (
                  <div className={styles.safetySection}>
                    <h4>{t('claims.pickupSafety')}</h4>
                    <SafetyForm
                      fields={PICKUP_FIELDS}
                      values={pickupForms[c._id] || {}}
                      onChange={(vals) => setPickupForms((prev) => ({ ...prev, [c._id]: vals }))}
                      notes={pickupNotes[c._id] || ''}
                      onNotesChange={(v) => setPickupNotes((prev) => ({ ...prev, [c._id]: v }))}
                      onSubmit={() => handlePickupConfirm(c._id)}
                      submitLabel={t('claims.confirmPickup')}
                    />
                  </div>
                )}

                {pickupDone && !deliveryDone && c.status === 'picked_up' && (
                  <div className={styles.safetySection}>
                    <h4>{t('claims.deliverySafety')}</h4>
                    <SafetyForm
                      fields={DELIVERY_FIELDS}
                      values={deliveryForms[c._id] || {}}
                      onChange={(vals) => setDeliveryForms((prev) => ({ ...prev, [c._id]: vals }))}
                      notes={deliveryNotes[c._id] || ''}
                      onNotesChange={(v) => setDeliveryNotes((prev) => ({ ...prev, [c._id]: v }))}
                      onSubmit={() => handleDeliveryConfirm(c._id)}
                      submitLabel={t('claims.confirmDelivery')}
                    />
                  </div>
                )}

                {/* Review section — visible after delivery */}
                {(deliveryDone || isDelivered) && (
                  <div className={styles.completedSection}>
                    <p className={styles.complete}>
                      ✅ {t('claims.donationCompleted')}
                    </p>
                    {hasRestaurant && (
                      alreadyReviewed ? (
                        <div className={styles.reviewedBadge}>
                          <FaStar className={styles.starFilled} />
                          <span>{t('claims.reviewSubmitted')}</span>
                        </div>
                      ) : (
                        <button
                          className={styles.reviewBtn}
                          onClick={() => openReviewModal(c)}
                          aria-label={`Leave a review for ${c.listing?.postedBy?.name}`}
                        >
                          <FaStar /> {t('claims.rateRestaurant')}
                        </button>
                      )
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          listingId={reviewTarget.listingId}
          restaurantId={reviewTarget.restaurantId}
          restaurantName={reviewTarget.restaurantName}
          listingTitle={reviewTarget.listingTitle}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => handleReviewSuccess(reviewTarget.claimId)}
        />
      )}
    </div>
  );
}

export default NgoClaimsPage;
