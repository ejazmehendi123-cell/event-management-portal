import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';

const Registrants = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchRegistrants = useCallback(
    async (term) => {
      try {
        const { data } = await api.get(`/events/${id}/registrations`, { params: { search: term || undefined } });
        setRegistrations(data.registrations);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load attendees');
      }
    },
    [id]
  );

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data.event);
        await fetchRegistrants('');
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load attendees');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, fetchRegistrants]);

  // Debounce search-as-you-type against the backend.
  useEffect(() => {
    const timeout = setTimeout(() => fetchRegistrants(search), 300);
    return () => clearTimeout(timeout);
  }, [search, fetchRegistrants]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get(`/events/${id}/registrations/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event?.title?.replace(/[^a-z0-9]+/gi, '_') || 'event'}_attendees.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Could not export attendees. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Loader label="Loading attendees…" />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/admin/events" className="text-sm text-ink/50 hover:text-ink mb-6 inline-block">
        ← Back to manage events
      </Link>

      {error && <p className="text-sm text-clay bg-clay/10 px-3 py-2 rounded-md mb-6">{error}</p>}

      {event && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink mb-1">{event.title}</h1>
            <p className="text-ink/60">
              {event.registeredCount} of {event.capacity} seats booked
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || registrations.length === 0}
            className="px-4 py-2.5 rounded-md border border-ink/15 text-ink text-sm font-semibold hover:bg-ink/5 transition-colors disabled:opacity-50 focus-ring w-fit"
          >
            {exporting ? 'Exporting…' : '⬇ Export CSV'}
          </button>
        </div>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search attendees by name or email…"
        className="w-full px-4 py-2.5 rounded-md border border-ink/15 bg-white text-sm focus-ring focus:outline-none mb-6"
      />

      {registrations.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-ink/15 rounded-2xl">
          <p className="text-ink/60">{search ? 'No attendees match your search.' : 'No one has registered for this event yet.'}</p>
        </div>
      ) : (
        <div className="ticket-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ink/10 text-ink/50">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Registered on</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{reg.user?.name}</td>
                  <td className="px-5 py-3 text-ink/60">{reg.user?.email}</td>
                  <td className="px-5 py-3 text-ink/60">
                    {new Date(reg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Registrants;
