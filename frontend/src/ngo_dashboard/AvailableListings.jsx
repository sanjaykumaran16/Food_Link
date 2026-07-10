import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AvailableListings.module.css';
import {
  FaSearch, FaUtensils, FaCalendarAlt, FaBuilding, FaMapMarkerAlt, FaPhoneAlt,
  FaHandPaper, FaInfoCircle, FaTimes, FaInbox, FaHourglassHalf,
  FaSlidersH, FaChevronDown, FaChevronUp, FaRedo
} from 'react-icons/fa';
import { getFilteredListings, claimListing } from '../services/listingService';
import MessageUserButton from '../components/MessageUserButton';
import MatchScoreBadge from '../components/MatchScoreBadge';

// All known allergens (matches backend schema)
const ALLERGEN_OPTIONS = ['nuts', 'gluten', 'dairy', 'eggs', 'shellfish', 'soy', 'wheat', 'sesame'];
const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'cooked', label: '🍲 Cooked' },
  { value: 'raw', label: '🥦 Raw' },
  { value: 'packaged', label: '📦 Packaged' },
  { value: 'bakery', label: '🥐 Bakery' },
  { value: 'dairy', label: '🥛 Dairy' },
];
const SORT_OPTIONS = [
  { value: 'expiry', label: 'Expiring soonest' },
  { value: 'quantity_desc', label: 'Most quantity first' },
  { value: 'quantity_asc', label: 'Least quantity first' },
  { value: 'newest', label: 'Newest first' },
];

const EMPTY_FILTERS = {
  city: '',
  category: 'all',
  allergens: [],
  pickupAfter: '',
  pickupBefore: '',
  minQty: '',
  maxQty: '',
  sortBy: 'expiry',
};

function countActiveFilters(filters) {
  let count = 0;
  if (filters.city) count++;
  if (filters.category && filters.category !== 'all') count++;
  if (filters.allergens.length > 0) count++;
  if (filters.pickupAfter) count++;
  if (filters.pickupBefore) count++;
  if (filters.minQty !== '') count++;
  if (filters.maxQty !== '') count++;
  if (filters.sortBy && filters.sortBy !== 'expiry') count++;
  return count;
}

function FilterPanel({ filters, onChange, onApply, onReset, activeCount }) {
  const { t } = useTranslation();
  const toggleAllergen = (allergen) => {
    const newList = filters.allergens.includes(allergen)
      ? filters.allergens.filter((a) => a !== allergen)
      : [...filters.allergens, allergen];
    onChange({ ...filters, allergens: newList });
  };

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterGrid}>
        {/* City */}
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-city">{t('listings.city')}</label>
          <input
            id="filter-city"
            type="text"
            className={styles.filterInput}
            placeholder="e.g. Chennai"
            value={filters.city}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
          />
        </div>

        {/* Category */}
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-category">{t('listings.category')}</label>
          <select
            id="filter-category"
            className={styles.filterSelect}
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Sort by */}
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-sort">{t('listings.sortBy')}</label>
          <select
            id="filter-sort"
            className={styles.filterSelect}
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Pickup Window */}
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-pickup-after">{t('listings.pickupFrom')}</label>
          <input
            id="filter-pickup-after"
            type="datetime-local"
            className={styles.filterInput}
            value={filters.pickupAfter}
            onChange={(e) => onChange({ ...filters, pickupAfter: e.target.value })}
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-pickup-before">{t('listings.pickupUntil')}</label>
          <input
            id="filter-pickup-before"
            type="datetime-local"
            className={styles.filterInput}
            value={filters.pickupBefore}
            onChange={(e) => onChange({ ...filters, pickupBefore: e.target.value })}
          />
        </div>

        {/* Quantity Range */}
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>{t('listings.quantityRange')}</label>
          <div className={styles.quantityRange}>
            <input
              type="number"
              className={styles.filterInput}
              placeholder="Min"
              min={0}
              value={filters.minQty}
              onChange={(e) => onChange({ ...filters, minQty: e.target.value })}
              aria-label="Minimum quantity"
            />
            <span className={styles.rangeSep}>–</span>
            <input
              type="number"
              className={styles.filterInput}
              placeholder="Max"
              min={0}
              value={filters.maxQty}
              onChange={(e) => onChange({ ...filters, maxQty: e.target.value })}
              aria-label="Maximum quantity"
            />
          </div>
        </div>
      </div>

      {/* Allergen exclusion chips */}
      <div className={styles.allergenSection}>
        <label className={styles.filterLabel}>{t('listings.excludeAllergens')}</label>
        <p className={styles.allergenHint}>{t('listings.allergenHint')}</p>
        <div className={styles.allergenChips}>
          {ALLERGEN_OPTIONS.map((allergen) => (
            <button
              key={allergen}
              type="button"
              className={`${styles.allergenChip} ${filters.allergens.includes(allergen) ? styles.allergenChipActive : ''}`}
              onClick={() => toggleAllergen(allergen)}
              aria-pressed={filters.allergens.includes(allergen)}
            >
              {filters.allergens.includes(allergen) ? '✕ ' : ''}{allergen}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.filterActions}>
        <button className={styles.resetFilterBtn} onClick={onReset} type="button">
          <FaRedo /> {t('listings.resetFilters')} {activeCount > 0 ? `(${activeCount})` : ''}
        </button>
        <button className={styles.applyFilterBtn} onClick={onApply} type="button">
          {t('listings.applyFilters')}
        </button>
      </div>
    </div>
  );
}

function AvailableListings() {
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimNotification, setClaimNotification] = useState(null);

  // Filter state
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeCount = countActiveFilters(appliedFilters);

  const fetchListings = useCallback(async (currentFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await getFilteredListings(currentFilters);
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchListings(EMPTY_FILTERS);
  }, [fetchListings]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    fetchListings(filters);
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    fetchListings(EMPTY_FILTERS);
  };

  // Client-side search on top of server results (name / address)
  const filteredListings = listings.filter((listing) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (listing.title || listing.itemName || '').toLowerCase();
    const city = (listing.city || '').toLowerCase();
    const address = (listing.pickupAddress || listing.restaurant?.address || '').toLowerCase();
    return name.includes(q) || city.includes(q) || address.includes(q);
  });

  const getUrgencyDetails = (expiryDateString) => {
    if (!expiryDateString) return { text: 'Unknown', styleClass: styles.urgencyNormal };
    try {
      const diffMs = new Date(expiryDateString) - new Date();
      if (diffMs <= 0) return { text: 'Expired', styleClass: styles.urgencyExpired };
      const diffHours = diffMs / 3600000;
      if (diffHours < 3) return { text: `Expires in ${Math.round(diffHours * 10) / 10}h (Urgent)`, styleClass: styles.urgencyUrgent };
      if (diffHours < 12) return { text: `Expires in ${Math.round(diffHours)}h`, styleClass: styles.urgencyAmber };
      const opts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return { text: `Expires: ${new Date(expiryDateString).toLocaleDateString(undefined, opts)}`, styleClass: styles.urgencyNormal };
    } catch {
      return { text: 'Valid', styleClass: styles.urgencyNormal };
    }
  };

  const handleClaim = async (listingId) => {
    const detail = listings.find((l) => l._id === listingId);
    if (!detail) { setError('Unexpected error — listing not found.'); return; }
    setError('');
    setClaimNotification(null);
    try {
      await claimListing(listingId);
      setListings((prev) => prev.filter((l) => l._id !== listingId));
      setClaimNotification({
        itemName: detail.title || detail.itemName,
        restaurantName: detail.postedBy?.name || detail.restaurant?.name || 'the restaurant',
        expiryDate: new Date(detail.expiresAt || detail.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' }),
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to claim listing.');
    }
  };

  return (
    <div className={styles.availableListingsContainer}>
      <header className={styles.pageHeader}>
        <h2>{t('listings.availableTitle')}</h2>
        <p className={styles.pageSubtitle}>{t('listings.availableSubtitle')}</p>
      </header>

      {/* Search + Filter Bar */}
      <div className={styles.searchFilterBar}>
        <div className={styles.searchContainer} style={{ marginBottom: 0, flex: 1 }}>
          <span className={styles.searchIcon}><FaSearch /></span>
          <input
            type="text"
            placeholder={t('listings.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label={t('listings.searchPlaceholder')}
          />
        </div>

        <button
          className={`${styles.filterToggleBtn} ${filterOpen ? styles.filterToggleBtnActive : ''}`}
          onClick={() => setFilterOpen((prev) => !prev)}
          aria-expanded={filterOpen}
          aria-controls="filter-panel"
          id="filter-toggle-btn"
        >
          <FaSlidersH />
          {t('listings.filterBtn')}
          {activeCount > 0 && <span className={styles.filterBadge}>{activeCount}</span>}
          {filterOpen ? <FaChevronUp className={styles.chevron} /> : <FaChevronDown className={styles.chevron} />}
        </button>
      </div>

      {/* Collapsible Filter Panel */}
      <div
        id="filter-panel"
        className={`${styles.filterPanelWrapper} ${filterOpen ? styles.filterPanelOpen : ''}`}
        aria-hidden={!filterOpen}
      >
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          activeCount={activeCount}
        />
      </div>

      {/* Active filter summary chips */}
      {activeCount > 0 && (
        <div className={styles.activeFilterChips}>
          {appliedFilters.city && <span className={styles.activeChip}>📍 {appliedFilters.city}</span>}
          {appliedFilters.category !== 'all' && <span className={styles.activeChip}>🍽️ {appliedFilters.category}</span>}
          {appliedFilters.allergens.map((a) => <span key={a} className={styles.activeChip}>⚠️ No {a}</span>)}
          {appliedFilters.sortBy !== 'expiry' && <span className={styles.activeChip}>↕ {SORT_OPTIONS.find(o => o.value === appliedFilters.sortBy)?.label}</span>}
          {(appliedFilters.minQty !== '' || appliedFilters.maxQty !== '') && (
            <span className={styles.activeChip}>📦 {appliedFilters.minQty || '0'} – {appliedFilters.maxQty || '∞'} units</span>
          )}
          <button className={styles.clearAllBtn} onClick={handleResetFilters} type="button">
            <FaTimes /> {t('listings.clearAll')}
          </button>
        </div>
      )}

      {/* Claim Success Notification */}
      {claimNotification && (
        <div className={styles.claimNotificationBox}>
          <span className={styles.notificationIcon}><FaInfoCircle /></span>
          <p>
            <strong>Claim successful!</strong> You claimed <strong>{claimNotification.itemName}</strong> from <strong>{claimNotification.restaurantName}</strong>. Please schedule pickup before <strong>{claimNotification.expiryDate}</strong>.
          </p>
          <button className={styles.closeNotificationButton} onClick={() => setClaimNotification(null)} aria-label="Close notification">
            <FaTimes />
          </button>
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          <FaInfoCircle /> <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonHeader}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonBadge} />
              </div>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonButton} />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        filteredListings.length === 0 ? (
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyIconBg}><FaInbox /></div>
            <h3>{t('listings.noListingsFound')}</h3>
            <p>
              {searchQuery || activeCount > 0
                ? t('listings.noListingsSearch')
                : t('listings.noListingsEmpty')}
            </p>
            {(searchQuery || activeCount > 0) && (
              <button onClick={() => { setSearchQuery(''); handleResetFilters(); }} className={styles.resetButton}>
                {t('listings.resetSearchFilters')}
              </button>
            )}
          </div>
        ) : (
          <div className={styles.listingsGrid}>
            {filteredListings.map((listing) => {
              const urgency = getUrgencyDetails(listing.expiresAt || listing.expiryDate);
              const restaurant = listing.postedBy || listing.restaurant;
              return (
                <div key={listing._id} className={styles.listingCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.foodTitleGroup}>
                      <span className={styles.foodIcon}><FaUtensils /></span>
                      <h3 className={styles.foodName}>{listing.title || listing.itemName}</h3>
                    </div>
                    <span className={styles.quantityBadge}>{listing.quantity} {listing.unit || 'servings'}</span>
                  </div>

                  <MatchScoreBadge listing={listing} />

                  <div className={`${styles.urgencyAlert} ${urgency.styleClass}`}>
                    <FaHourglassHalf className={styles.hourglassIcon} />
                    <span>{urgency.text}</span>
                  </div>

                  {/* Allergen pills */}
                  {listing.allergens && listing.allergens.length > 0 && (
                    <div className={styles.allergenPills}>
                      {listing.allergens.map((a) => (
                        <span key={a} className={styles.allergenPill}>⚠️ {a}</span>
                      ))}
                    </div>
                  )}

                  <div className={styles.cardBody}>
                    <div className={styles.detailRow}>
                      <FaBuilding className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>{t('listings.restaurant')}</span>
                        <span className={styles.detailValue}>{restaurant?.name || 'Local Donor'}</span>
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <FaMapMarkerAlt className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>{t('listings.pickupAddress')}</span>
                        <span className={styles.detailValue}>{listing.pickupAddress || restaurant?.address || 'N/A'}</span>
                      </div>
                    </div>
                    {listing.pickupWindowStart && (
                      <div className={styles.detailRow}>
                        <FaCalendarAlt className={styles.detailIcon} />
                        <div className={styles.detailText}>
                          <span className={styles.detailLabel}>{t('listings.pickupWindow')}</span>
                          <span className={styles.detailValue}>
                            {new Date(listing.pickupWindowStart).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {' – '}
                            {new Date(listing.pickupWindowEnd).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className={styles.detailRow}>
                      <FaPhoneAlt className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>{t('listings.contact')}</span>
                        <span className={styles.detailValue}>{restaurant?.phone || restaurant?.contactNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <button className={styles.claimButton} onClick={() => handleClaim(listing._id)}>
                      <FaHandPaper /> {t('listings.claimDonation')}
                    </button>
                    {restaurant?._id && (
                      <MessageUserButton
                        userId={restaurant._id}
                        userName={restaurant.name}
                        listingId={listing._id}
                        className={styles.messageButton}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

export default AvailableListings;