import React from 'react';
import { useNavigate } from 'react-router-dom';

function MessageUserButton({ userId, userName, listingId, className, children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const base =
    role === 'restaurant'
      ? '/restaurant/dashboard/messages'
      : role === 'ngo'
        ? '/ngo/dashboard/messages'
        : '/messages';

  const handleClick = () => {
    const params = new URLSearchParams({ with: userId });
    if (listingId) params.set('listing', listingId);
    if (userName) params.set('name', userName);
    navigate(`${base}?${params.toString()}`);
  };

  return (
    <button type="button" className={className} onClick={handleClick} title={`Message ${userName || 'user'}`}>
      {children || 'Message'}
    </button>
  );
}

export default MessageUserButton;
