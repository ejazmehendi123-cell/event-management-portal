import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-md transition-colors focus-ring ${
    isActive ? 'text-ink bg-gold/20' : 'text-ink/70 hover:text-ink hover:bg-ink/5'
  }`;

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-ink/10">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 focus-ring rounded-md">
          <span className="w-8 h-8 rounded-full bg-ink text-gold font-display font-semibold flex items-center justify-center text-sm">
            E
          </span>
          <span className="font-display text-xl font-semibold text-ink">EventHub</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Browse events
          </NavLink>

          {user && !isAdmin && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}

          {user && !isAdmin && (
            <NavLink to="/my-registrations" className={navLinkClass}>
              My tickets
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin dashboard
            </NavLink>
          )}

          {!user ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Sign in
              </NavLink>
              <Link
                to="/register"
                className="ml-2 px-4 py-2 text-sm font-semibold rounded-md bg-ink text-paper hover:bg-ink/90 transition-colors focus-ring"
              >
                Get started
              </Link>
            </>
          ) : (
            <>
              <span className="hidden sm:inline px-3 text-sm text-ink/60">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold rounded-md border border-ink/15 text-ink hover:bg-ink/5 transition-colors focus-ring"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
