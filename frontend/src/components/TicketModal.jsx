import { useState } from 'react';
import api from '../api/axios';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// A styled on-screen ticket preview ("view the ticket") with a button that
// pulls the server-generated PDF ("download the ticket") as a blob, since
// the endpoint requires an Authorization header a plain <a href> can't send.
const TicketModal = ({ registration, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const event = registration.event;

  const handleDownload = async () => {
    setError('');
    setDownloading(true);
    try {
      const response = await api.get(`/registrations/${registration._id}/ticket`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${event?.title?.replace(/[^a-z0-9]+/gi, '_') || registration._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Could not download the ticket. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="ticket-card max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="bg-ink text-paper rounded-t-2xl p-6">
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-2">EventHub · Admit One</p>
          <h2 className="font-display text-2xl font-semibold leading-snug">{event?.title}</h2>
          <p className="text-sm text-paper/60 mt-1">{event?.category}</p>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-1">Date</p>
            <p className="text-ink font-medium">{event ? formatDate(event.date) : '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-1">Time</p>
            <p className="text-ink font-medium">{event?.time}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-1">Location</p>
            <p className="text-ink font-medium">{event?.location}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-1">Registration status</p>
            <p className="text-teal font-semibold capitalize">{registration.status}</p>
          </div>
        </div>

        <div className="ticket-divider" />

        {error && <p className="text-sm text-clay px-6 pt-4">{error}</p>}

        <div className="p-6 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-4 py-2.5 rounded-md bg-ink text-paper text-sm font-semibold hover:bg-ink/90 transition-colors disabled:opacity-60 focus-ring"
          >
            {downloading ? 'Preparing PDF…' : 'Download PDF ticket'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-md border border-ink/15 text-ink text-sm font-semibold hover:bg-ink/5 transition-colors focus-ring"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
