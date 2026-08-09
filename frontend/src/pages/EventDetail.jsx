import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import FavoriteButton from '../components/FavoriteButton';
import { useAuth } from '../context/AuthContext';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');
  const [registering, setRegistering] = useState(false);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event);
    } catch (err) {
      setError(err.response?.data?.message || 'Event not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    setActionErr('');
    setActionMsg('');
    setRegistering(true);
    try {
      await api.post('/registrations', { eventId: id });
      setActionMsg('You are registered! Find your ticket under "My tickets".');
      fetchEvent();
    } catch (err) {
      setActionErr(err.response?.data?.message || 'Could not complete registration');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <Loader label="Loading event…" />;

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-clay font-medium mb-4">{error || 'Event not found'}</p>
        <Link to="/" className="text-ink underline underline-offset-2">
          Back to all events
        </Link>
      </div>
    );
  }

  const isPast = new Date(event.date) < new Date();
  const full = event.seatsLeft <= 0;
  const registrationDisabled = full || isPast;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/" className="text-sm text-ink/50 hover:text-ink mb-6 inline-block">
        ← Back to all events
      </Link>

      <div className="ticket-card p-8">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold/20 text-ink">{event.category}</span>
          <div className="flex items-center gap-3">
            {isPast ? (
              <span className="text-sm font-semibold text-teal">Completed</span>
            ) : full ? (
              <span className="text-sm font-semibold text-clay">Sold out</span>
            ) : (
              <span className="text-sm font-medium text-ink/50">{event.seatsLeft} of {event.capacity} seats left</span>
            )}
            <FavoriteButton eventId={event._id} />
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-4">{event.title}</h1>

        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div className="flex items-start gap-2">
            <span>📅</span>
            <div>
              <p className="font-medium text-ink">{formatDate(event.date)}</p>
              <p className="text-ink/60">{event.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span>📍</span>
            <div>
              <p className="font-medium text-ink">{event.location}</p>
            </div>
          </div>
        </div>

        <div className="ticket-divider mb-6" />

        <p className="text-ink/70 leading-relaxed whitespace-pre-line mb-8">{event.description}</p>

        {actionMsg && <p className="text-sm text-teal bg-teal/10 px-3 py-2 rounded-md mb-4">{actionMsg}</p>}
        {actionErr && <p className="text-sm text-clay bg-clay/10 px-3 py-2 rounded-md mb-4">{actionErr}</p>}

        <button
          onClick={handleRegister}
          disabled={registrationDisabled || registering}
          className="px-6 py-3 rounded-md bg-ink text-paper font-semibold text-sm hover:bg-ink/90 transition-colors disabled:opacity-50 focus-ring"
        >
          {isPast ? 'Event has ended' : full ? 'Sold out' : registering ? 'Reserving your seat…' : 'Reserve my seat'}
        </button>

        {event.createdBy?.name && (
          <p className="text-xs text-ink/40 mt-6">Hosted by {event.createdBy.name}</p>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
