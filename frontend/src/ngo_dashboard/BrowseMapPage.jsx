import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './BrowseMapPage.module.css';
import { getNearbyListings, getNearbyRestaurants, getNgoMapLocation, claimListing } from '../services/listingService';
import MessageUserButton from '../components/MessageUserButton';
import MatchScoreBadge from '../components/MatchScoreBadge';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function BrowseMapPage() {
  const [listings, setListings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [center, setCenter] = useState([28.6139, 77.209]);
  const [radiusKm, setRadiusKm] = useState(15);
  const [locationSource, setLocationSource] = useState('default');
  const [searchCityQuery, setSearchCityQuery] = useState('');

  useEffect(() => {
    const resolveCenter = async () => {
      const fallbackToProfile = async () => {
        try {
          const ngoLoc = await getNgoMapLocation();
          if (ngoLoc?.lat && ngoLoc?.lng) {
            setCenter([ngoLoc.lat, ngoLoc.lng]);
            setLocationSource('profile');
          } else {
            setLocationSource('default');
          }
        } catch {
          setLocationSource('default');
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCenter([pos.coords.latitude, pos.coords.longitude]);
            setLocationSource('device');
          },
          (err) => {
            console.warn('Initial geolocation failed, falling back to profile address:', err);
            fallbackToProfile();
          },
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 120000
          }
        );
      } else {
        fallbackToProfile();
      }
    };
    resolveCenter();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [nearby, nearbyRestaurants] = await Promise.all([
          getNearbyListings(center[0], center[1], radiusKm),
          getNearbyRestaurants(center[0], center[1], radiusKm),
        ]);
        setListings(nearby);
        setSuggestions(nearbyRestaurants);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [center, radiusKm]);

  const handleClaim = async (id) => {
    setError('');
    setSuccess('');
    try {
      await claimListing(id);
      setSuccess('Listing claimed!');
      setListings((prev) => prev.filter((l) => l._id !== id));
      setSuggestions((prev) =>
        prev
          .map((s) => ({
            ...s,
            listings: s.listings.filter((l) => l._id !== id),
            listingCount: s.listings.filter((l) => l._id !== id).length,
          }))
          .filter((s) => s.listingCount > 0)
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleSearchCity = async (e) => {
    e.preventDefault();
    if (!searchCityQuery.trim()) return;
    setError('');
    setSuccess('');
    try {
      const params = new URLSearchParams({
        q: searchCityQuery.trim(),
        format: 'json',
        limit: '1',
        countrycodes: 'in',
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { 'User-Agent': 'FoodLink/1.0 (food donation platform)' },
      });
      if (!res.ok) throw new Error('Failed to fetch city coordinates');
      const data = await res.json();
      if (!data?.length) {
        setError(`City "${searchCityQuery}" not found. Please try a different query.`);
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      setCenter([lat, lon]);
      setLocationSource('search');
      setSuccess(`Map centered on ${data[0].display_name}`);
    } catch (err) {
      setError(err.message || 'Error searching for city coordinates.');
    }
  };

  const handleLocateMe = () => {
    setError('');
    setSuccess('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser or context (requires HTTPS/localhost).');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setLocationSource('device');
        setSuccess('Location scanned successfully.');
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location access denied. Please enable location permissions for this site in your browser settings.');
        } else {
          setError(err.message || 'Failed to detect location.');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  };

  const validListings = useMemo(
    () =>
      listings.filter((l) => {
        const coords = l.location?.coordinates;
        return coords && !(coords[0] === 0 && coords[1] === 0);
      }),
    [listings]
  );

  const locationLabel =
    locationSource === 'profile'
      ? 'Centered on your NGO address'
      : locationSource === 'device'
        ? 'Centered on your device location'
        : locationSource === 'search'
          ? 'Centered on your searched location'
          : 'Using default map center — update your profile address for accuracy';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h2>Browse Nearby Donations</h2>
          <p className={styles.subtitle}>{locationLabel}</p>
        </div>
        <div className={styles.controlsRow}>
          <button
            type="button"
            className={styles.locateBtn}
            onClick={handleLocateMe}
          >
            📍 Scan Location
          </button>
          <form onSubmit={handleSearchCity} className={styles.searchCityForm}>
            <input
              type="text"
              placeholder="Search city (e.g. Tiruvannamalai)"
              value={searchCityQuery}
              onChange={(e) => setSearchCityQuery(e.target.value)}
              className={styles.searchCityInput}
            />
            <button type="submit" className={styles.searchCityBtn}>Search</button>
          </form>
          <label className={styles.radiusControl}>
            Radius: {radiusKm} km
            <input
              type="range"
              min="5"
              max="100"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            />
          </label>
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <div className={styles.layout}>
        <aside className={styles.suggestions}>
          <h3>Nearby Restaurants</h3>
          {loading ? (
            <p>Loading suggestions...</p>
          ) : suggestions.length === 0 ? (
            <p className={styles.empty}>No restaurants with active listings within {radiusKm} km.</p>
          ) : (
            <ul className={styles.suggestionList}>
              {suggestions.map((s) => (
                <li key={s.restaurant._id} className={styles.suggestionCard}>
                  <div className={styles.suggestionHeader}>
                    <strong>{s.restaurant.name}</strong>
                    <span className={styles.distance}>{s.distanceKm} km</span>
                  </div>
                  <p className={styles.address}>{s.restaurant.address}</p>
                  <p className={styles.meta}>
                    {s.listingCount} active listing{s.listingCount !== 1 ? 's' : ''}
                  </p>
                  <ul className={styles.miniListings}>
                    {s.listings.slice(0, 3).map((l) => (
                      <li key={l._id}>
                        {l.itemName || l.title} — {l.quantity} servings
                        {l.matchScore != null && ` · ${l.matchScore}% match`}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.cardActions}>
                    <MessageUserButton
                      userId={s.restaurant._id}
                      userName={s.restaurant.name}
                      className={styles.msgBtn}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className={styles.mapWrap}>
          {loading ? (
            <p className={styles.mapLoading}>Loading map...</p>
          ) : (
            <MapContainer center={center} zoom={13} className={styles.map} scrollWheelZoom>
              <Recenter center={center} zoom={13} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={center} icon={ngoIcon}>
                <Popup>
                  <strong>Your NGO</strong>
                  <p>{locationLabel}</p>
                </Popup>
              </Marker>
              <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: '#2d6a4f', fillOpacity: 0.08 }} />
              {validListings.map((l) => {
                const coords = l.location.coordinates;
                const restaurant = l.restaurant || l.postedBy;
                return (
                  <Marker key={l._id} position={[coords[1], coords[0]]}>
                    <Popup>
                      <strong>{l.itemName || l.title}</strong>
                      <p>{restaurant?.name}</p>
                      <p>{l.pickupAddress || restaurant?.address}</p>
                      <MatchScoreBadge listing={l} />
                      <div className={styles.popupActions}>
                        <button type="button" onClick={() => handleClaim(l._id)}>Claim</button>
                        {restaurant?._id && (
                          <MessageUserButton
                            userId={restaurant._id}
                            userName={restaurant.name}
                            listingId={l._id}
                            className={styles.msgBtn}
                          />
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
          {!loading && validListings.length === 0 && (
            <p className={styles.mapEmpty}>No mappable listings in range. Try increasing the radius.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrowseMapPage;
