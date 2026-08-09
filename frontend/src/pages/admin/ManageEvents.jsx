import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events', { params: { limit: 50, sort: '-date' } });
      setEvents(data.events);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This also removes all of its registrations. This cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete event');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader label="Loading events…" />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink mb-1">Manage events</h1>
          <p className="text-ink/60">Create, edit, or remove events.</p>
        </div>
        <Link
          to="/admin/events/new"
          className="px-5 py-2.5 rounded-md bg-ink text-paper text-sm font-semibold hover:bg-ink/90 transition-colors focus-ring w-fit"
        >
          + New event
        </Link>
      </div>

      {error && <p className="text-sm text-clay bg-clay/10 px-3 py-2 rounded-md mb-6">{error}</p>}

      {events.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-ink/15 rounded-2xl">
          <p className="text-ink/60">No events yet. Create your first one.</p>
        </div>
      ) : (
        <div className="ticket-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ink/10 text-ink/50">
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Seats</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{event.title}</td>
                  <td className="px-5 py-3 text-ink/60">{formatDate(event.date)}</td>
                  <td className="px-5 py-3 text-ink/60">{event.category}</td>
                  <td className="px-5 py-3 text-ink/60">
                    {event.registeredCount}/{event.capacity}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link to={`/admin/events/${event._id}/registrants`} className="text-teal font-medium hover:underline">
                        Attendees
                      </Link>
                      <Link to={`/admin/events/${event._id}/edit`} className="text-ink font-medium hover:underline">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id)}
                        disabled={deletingId === event._id}
                        className="text-clay font-medium hover:underline disabled:opacity-50"
                      >
                        {deletingId === event._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
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

export default ManageEvents;
