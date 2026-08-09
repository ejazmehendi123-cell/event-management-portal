import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import TicketModal from '../components/TicketModal';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [tab, setTab] = useState('all');
  const [activeTicket, setActiveTicket] = useState(null);

  const fetchMine = useCallback(async (status) => {
    setLoading(true);
    try {
      const { data } = await api.get('/registrations/my', { params: { status } });
      setRegistrations(data.registrations);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMine(tab);
  }, [fetchMine, tab]);

  const handleCancel = async (registrationId) => {
    setCancellingId(registrationId);
    try {
      await api.delete(`/registrations/${registrationId}`);
      setRegistrations((prev) => prev.filter((r) => r._id !== registrationId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel this registration');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">My tickets</h1>
      <p className="text-ink/60 mb-6">Every event you've reserved a seat for.</p>

      <div className="flex gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus-ring ${
              tab === t.key ? 'bg-ink text-paper' : 'bg-white border border-ink/15 text-ink/70 hover:border-ink/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-clay bg-clay/10 px-3 py-2 rounded-md mb-6">{error}</p>}

      {loading ? (
        <Loader label="Loading your tickets…" />
      ) : registrations.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-ink/15 rounded-2xl">
          <p className="text-ink/60 mb-4">
            {tab === 'upcoming' && "You don't have any upcoming events."}
            {tab === 'completed' && "You haven't attended any events yet."}
            {tab === 'all' && "You haven't reserved any seats yet."}
          </p>
          <Link to="/" className="text-ink font-semibold underline underline-offset-2">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div key={reg._id} className="ticket-card flex flex-col sm:flex-row">
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold/20 text-ink inline-block">
                    {reg.event?.category}
                  </span>
                  {reg.isPast && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal/15 text-teal inline-block">
                      Completed
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mb-1">{reg.event?.title}</h3>
                <p className="text-sm text-ink/60">
                  📅 {reg.event ? formatDate(reg.event.date) : '—'} · {reg.event?.time}
                </p>
                <p className="text-sm text-ink/60">📍 {reg.event?.location}</p>
              </div>

              <div className="ticket-divider sm:hidden" />

              <div className="p-5 flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:w-44 sm:border-l sm:border-dashed sm:border-ink/15">
                <button
                  onClick={() => setActiveTicket(reg)}
                  className="text-sm font-semibold text-ink underline underline-offset-2"
                >
                  View ticket
                </button>
                <Link to={`/events/${reg.event?._id}`} className="text-sm text-ink/60 hover:text-ink underline underline-offset-2">
                  View event
                </Link>
                {!reg.isPast && (
                  <button
                    onClick={() => handleCancel(reg._id)}
                    disabled={cancellingId === reg._id}
                    className="text-sm font-medium text-clay hover:underline disabled:opacity-50"
                  >
                    {cancellingId === reg._id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTicket && <TicketModal registration={activeTicket} onClose={() => setActiveTicket(null)} />}
    </div>
  );
};

export default MyRegistrations;
