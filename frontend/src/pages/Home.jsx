import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';

const CATEGORIES = ['All', 'Technology', 'Business', 'Music', 'Sports', 'Education', 'Arts', 'Other'];
const STATUS_TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/events', {
        params: { search: search || undefined, category, status, page, limit: 9 },
      });
      setEvents(data.events);
      setPages(data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load events. Is the API server running?');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <section className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-3">Your next event is here</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink leading-tight max-w-2xl">
          Find, book, and hold your seat at events worth showing up for.
        </h1>
        <p className="mt-4 text-ink/60 max-w-xl">
          Browse hackathons, workshops, concerts, and campus events — reserve a spot in a couple of clicks and get a
          digital ticket instantly.
        </p>
      </section>

      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events by name, description, or location…"
          className="flex-1 px-4 py-2.5 rounded-md border border-ink/15 bg-white text-sm focus-ring focus:outline-none"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-md bg-ink text-paper text-sm font-semibold hover:bg-ink/90 transition-colors focus-ring"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex gap-1 bg-white border border-ink/15 rounded-full p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setStatus(t.key);
                setPage(1);
              }}
              className={`px-3.5 py-1 rounded-full text-sm font-medium transition-colors focus-ring ${
                status === t.key ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors focus-ring ${
              category === cat ? 'bg-ink text-paper' : 'bg-white border border-ink/15 text-ink/70 hover:border-ink/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <Loader label="Fetching events…" />}

      {!loading && error && (
        <div className="text-center py-16 border border-dashed border-ink/15 rounded-2xl">
          <p className="text-clay font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-16 border border-dashed border-ink/15 rounded-2xl">
          <p className="text-ink/60">No events match your search yet. Try a different keyword or category.</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-md border border-ink/15 text-sm disabled:opacity-40 focus-ring"
              >
                Previous
              </button>
              <span className="text-sm text-ink/60">
                Page {page} of {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-md border border-ink/15 text-sm disabled:opacity-40 focus-ring"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
