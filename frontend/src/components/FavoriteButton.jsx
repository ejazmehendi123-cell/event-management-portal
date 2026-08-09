import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

// A small heart toggle. Works standalone wherever an eventId is known;
// silently no-ops the click-through to a parent Link via stopPropagation.
const FavoriteButton = ({ eventId, className = '' }) => {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [busy, setBusy] = useState(false);

  if (!user || user.role === 'admin') return null;

  const active = isFavorited(eventId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await toggleFavorite(eventId);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors focus-ring ${
        active ? 'bg-clay/15 text-clay' : 'bg-ink/5 text-ink/40 hover:text-clay hover:bg-clay/10'
      } ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
};

export default FavoriteButton;
