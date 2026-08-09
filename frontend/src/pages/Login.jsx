import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Welcome back</h1>
      <p className="text-ink/60 mb-8">Sign in to book events and manage your tickets.</p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-ink/10">
        {error && <p className="text-sm text-clay bg-clay/10 px-3 py-2 rounded-md">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-md bg-ink text-paper font-semibold text-sm hover:bg-ink/90 transition-colors disabled:opacity-60 focus-ring"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-sm text-center text-ink/60">
          New here?{' '}
          <Link to="/register" className="font-semibold text-ink underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </form>

      <div className="mt-6 text-xs text-ink/40 text-center">
        Demo admin: admin@eventhub.com / admin123 · Demo user: user@eventhub.com / user1234
        <br />(after running <code>npm run seed</code> in the backend)
      </div>
    </div>
  );
};

export default Login;
