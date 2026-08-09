import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';

const categoryColors = {
  Technology: 'bg-teal/15 text-teal',
  Business: 'bg-gold/20 text-ink',
  Music: 'bg-clay/15 text-clay',
  Sports: 'bg-teal/15 text-teal',
  Education: 'bg-gold/20 text-ink',
  Arts: 'bg-clay/15 text-clay',
  Other: 'bg-ink/10 text-ink',
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const EventCard = ({ event }) => {
  const full = event.seatsLeft <= 0;

  return (
    <Link to={`/events/${event._id}`} className="block focus-ring rounded-2xl">
      <article className="ticket-card flex flex-col h-full">
        <div className="p-5 flex-1">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[event.category] || categoryColors.Other}`}>
              {event.category}
            </span>
            <div className="flex items-center gap-2">
              {full ? (
                <span className="text-xs font-semibold text-clay">Sold out</span>
              ) : (
                <span className="text-xs font-medium text-ink/50">{event.seatsLeft} seats left</span>
              )}
              <FavoriteButton eventId={event._id} />
            </div>
          </div>

          <h3 className="font-display text-lg font-semibold text-ink leading-snug mb-2 line-clamp-2">
            {event.title}
          </h3>
          <p className="text-sm text-ink/60 line-clamp-2 mb-4">{event.description}</p>

          <div className="space-y-1 text-sm text-ink/70">
            <p>📅 {formatDate(event.date)} · {event.time}</p>
            <p>📍 {event.location}</p>
          </div>
        </div>

        <div className="ticket-divider" />

        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-ink/40 font-semibold">Admit one</span>
          <span className="text-sm font-semibold text-ink">View details →</span>
        </div>
      </article>
    </Link>
  );
};

export default EventCard;
