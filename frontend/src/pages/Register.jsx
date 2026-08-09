import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminInviteCode: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Create your account</h1>
      <p className="text-ink/60 mb-8">Join to reserve seats and get instant digital tickets.</p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-ink/10">
        {error && <p className="text-sm text-clay bg-clay/10 px-3 py-2 rounded-md">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Full name</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            placeholder="Jordan Rivera"
          />
        </div>

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
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            placeholder="At least 6 characters"
          />
        </div>

        <details className="text-sm text-ink/60">
          <summary className="cursor-pointer font-medium">Registering as an organizer?</summary>
          <div className="mt-2">
            <label className="block text-xs font-medium text-ink/60 mb-1">Admin invite code</label>
            <input
              type="text"
              name="adminInviteCode"
              value={form.adminInviteCode}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
              placeholder="Optional — leave blank for an attendee account"
            />
          </div>
        </details>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-md bg-ink text-paper font-semibold text-sm hover:bg-ink/90 transition-colors disabled:opacity-60 focus-ring"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-sm text-center text-ink/60">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
