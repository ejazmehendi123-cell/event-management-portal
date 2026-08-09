import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api/axios';
import Loader from '../../components/Loader';

const StatCard = ({ label, value }) => (
  <div className="ticket-card p-6">
    <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-2">{label}</p>
    <p className="font-display text-3xl font-semibold text-ink">{value}</p>
  </div>
);

const formatShortDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.stats);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader label="Loading dashboard…" />;

  const trendData = stats?.registrationTrends.map((t) => ({ ...t, label: formatShortDate(t.date) })) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink mb-1">Admin dashboard</h1>
          <p className="text-ink/60">An overview of activity across EventHub.</p>
        </div>
        <Link
          to="/admin/events"
          className="px-5 py-2.5 rounded-md bg-ink text-paper text-sm font-semibold hover:bg-ink/90 transition-colors focus-ring w-fit"
        >
          Manage events
        </Link>
      </div>

      {error && <p className="text-sm text-clay bg-clay/10 px-3 py-2 rounded-md mb-6">{error}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total events" value={stats.totalEvents} />
            <StatCard label="Upcoming events" value={stats.upcomingEvents} />
            <StatCard label="Completed events" value={stats.completedEvents} />
            <StatCard label="Confirmed registrations" value={stats.totalRegistrations} />
            <StatCard label="Registered attendees" value={stats.totalAttendees} />
            <StatCard
              label="Avg. registrations / event"
              value={stats.totalEvents ? (stats.totalRegistrations / stats.totalEvents).toFixed(1) : '0'}
            />
          </div>

          {/* Registration trend chart */}
          <div className="ticket-card p-6 mb-6">
            <h2 className="font-display text-xl font-semibold text-ink mb-1">Registration trends</h2>
            <p className="text-sm text-ink/50 mb-4">New registrations over the last 14 days</p>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b6f8a' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b6f8a' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #E4E0D6', fontSize: 12 }}
                    labelStyle={{ color: '#1B1F3B', fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="count" name="Registrations" stroke="#E8A33D" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Events by category */}
            <div className="ticket-card p-6">
              <h2 className="font-display text-xl font-semibold text-ink mb-4">Events by category</h2>
              {stats.eventsByCategory.length === 0 ? (
                <p className="text-sm text-ink/50">No events created yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.eventsByCategory.map((c) => {
                    const max = Math.max(...stats.eventsByCategory.map((x) => x.count));
                    const pct = Math.round((c.count / max) * 100);
                    return (
                      <div key={c._id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-ink">{c._id}</span>
                          <span className="text-ink/50">{c.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
                          <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top events by participation */}
            <div className="ticket-card p-6">
              <h2 className="font-display text-xl font-semibold text-ink mb-4">Most popular events</h2>
              {stats.topEvents.length === 0 ? (
                <p className="text-sm text-ink/50">No registrations yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.topEvents.map((e, i) => (
                    <Link
                      key={e.eventId}
                      to={`/admin/events/${e.eventId}/registrants`}
                      className="flex items-center justify-between border-b border-ink/5 last:border-0 pb-3 last:pb-0 hover:bg-ink/[0.02] -mx-1 px-1 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-ink/5 text-ink/50 text-xs font-semibold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-ink">{e.title}</span>
                      </div>
                      <span className="text-sm text-ink/50">
                        {e.registrations}/{e.capacity}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
