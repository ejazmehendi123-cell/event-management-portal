import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

// Tracks which event IDs the current attendee has favorited, so any
// EventCard or EventDetail can show the right heart state without each
// component re-fetching the whole list.
export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      setLoaded(true);
      return;
    }
    try {
      const { data } = await api.get('/favorites');
      setFavoriteIds(new Set(data.favorites.map((e) => e._id)));
    } catch {
      // Non-critical: favoriting is a bonus feature, fail silently.
    } finally {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleFavorite = useCallback(
    async (eventId) => {
      const { data } = await api.post(`/favorites/${eventId}`);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data.favorited) next.add(eventId);
        else next.delete(eventId);
        return next;
      });
      return data.favorited;
    },
    []
  );

  const isFavorited = useCallback((eventId) => favoriteIds.has(eventId), [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, loaded, toggleFavorite, isFavorited, refresh }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
};
