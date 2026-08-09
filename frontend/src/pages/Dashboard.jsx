import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Countdown from '../components/Countdown';
import FavoriteButton from '../components/FavoriteButton';
import { useAuth } from '../context/AuthContext';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const StatCard = ({ label, value, accent }) => (
  <div className="ticket-card p-5">
    <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-2">{label}</p>
    <p className={`font-display text-3xl font-semibold ${accent || 'text-ink'}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, favRes] = await Promise.all([api.get('/registrations/dashboard'), api.get('/favorites')]);
        setStats(statsRes.data.stats);
        setFavorites(favRes.data.favorites);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading your dashboard…" />;

  const nextEvent = stats?.upcomingReminders?.[0];
  const otherReminders = stats?.upcomingReminders?.slice(1) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink mb-1">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="text-ink/60 mb-8">Here's how your event journey is going.</p>

      {error && <p className="text-sm text-clay bg-clay/10 px-3 py-2 rounded-md mb-6">{error}</p>}

      {stats && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="Participation streak" value={`${stats.participationStreak} mo`} accent="text-gold" />
            <StatCard label="Total registrations" value={stats.totalRegistrations} />
            <StatCard label="Upcoming" value={stats.upcomingCount} />
            <StatCard label="Completed" value={stats.completedCount} />
          </div>

          {/* Next event countdown */}
          {nextEvent ? (
            <div className="ticket-card p-6 mb-10">
              <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-3">Coming up next</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink mb-1">{nextEvent.event.title}</h2>
                  <p className="text-sm text-ink/60">
                    📅 {formatDate(nextEvent.event.date)} · {nextEvent.event.time} · 📍 {nextEvent.event.location}
                  </p>
                  <Link
                    to={`/events/${nextEvent.event._id}`}
                    className="text-sm font-semibold text-ink underline underline-offset-2 mt-2 inline-block"
                  >
                    View event
                  </Link>
                </div>
                <Countdown targetDate={nextEvent.event.date} />
              </div>
            </div>
          ) : (
            <div className="ticket-card p-6 mb-10 text-center">
              <p className="text-ink/60 mb-3">No upcoming events on your calendar yet.</p>
              <Link to="/" className="text-ink font-semibold underline underline-offset-2">
                Browse events
              </Link>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            {/* Other reminders */}
            <div className="ticket-card p-6">
              <h2 className="font-display text-lg font-semibold text-ink mb-4">Event reminders</h2>
              {otherReminders.length === 0 ? (
                <p className="text-sm text-ink/50">Nothing else on the horizon right now.</p>
              ) : (
                <div className="space-y-3">
                  {otherReminders.map((reg) => (
                    <div key={reg._id} className="flex items-center justify-between border-b border-ink/5 last:border-0 pb-3 last:pb-0">
                      <div>
                        <p className="font-medium text-ink text-sm">{reg.event.title}</p>
                        <p className="text-xs text-ink/50">{formatDate(reg.event.date)}</p>
                      </div>
                      <Countdown targetDate={reg.event.date} compact />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Favorites */}
            <div className="ticket-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-ink">Favorite events</h2>
                <span className="text-xs text-ink/40 font-semibold">{stats.favoritesCount}</span>
              </div>
              {favorites.length === 0 ? (
                <p className="text-sm text-ink/50">
                  Tap the heart on any event to save it here for quick access.
                </p>
              ) : (
                <div className="space-y-3">
                  {favorites.slice(0, 5).map((event) => (
                    <div key={event._id} className="flex items-center justify-between border-b border-ink/5 last:border-0 pb-3 last:pb-0">
                      <div>
                        <Link to={`/events/${event._id}`} className="font-medium text-ink text-sm hover:underline">
                          {event.title}
                        </Link>
                        <p className="text-xs text-ink/50">{formatDate(event.date)}</p>
                      </div>
                      <FavoriteButton eventId={event._id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
