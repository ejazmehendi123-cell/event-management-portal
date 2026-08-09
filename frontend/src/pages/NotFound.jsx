import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="max-w-md mx-auto px-4 py-24 text-center">
    <p className="font-display text-6xl font-semibold text-ink mb-4">404</p>
    <p className="text-ink/60 mb-6">This page doesn't exist, or the event you're looking for was removed.</p>
    <Link to="/" className="text-ink font-semibold underline underline-offset-2">
      Back to all events
    </Link>
  </div>
);

export default NotFound;
