import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';

const CATEGORIES = ['Technology', 'Business', 'Music', 'Sports', 'Education', 'Arts', 'Other'];

const emptyForm = {
  title: '',
  description: '',
  category: 'Technology',
  date: '',
  time: '',
  location: '',
  capacity: 50,
  imageUrl: '',
};

// Handles both "create" (no :id in the route) and "edit" (:id present).
const EventForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        const e = data.event;
        setForm({
          title: e.title,
          description: e.description,
          category: e.category,
          date: e.date ? e.date.substring(0, 10) : '',
          time: e.time,
          location: e.location,
          capacity: e.capacity,
          imageUrl: e.imageUrl || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'capacity' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/events/${id}`, form);
      } else {
        await api.post('/events', form);
      }
      navigate('/admin/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading event…" />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">{isEdit ? 'Edit event' : 'Create a new event'}</h1>
      <p className="text-ink/60 mb-8">
        {isEdit ? 'Update the details below.' : 'Fill in the details attendees will see.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-ink/10">
        {error && <p className="text-sm text-clay bg-clay/10 px-3 py-2 rounded-md">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Title</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            placeholder="e.g. TechFusion Hackathon 2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            placeholder="What is this event about?"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">Capacity</label>
            <input
              type="number"
              name="capacity"
              min={1}
              required
              value={form.capacity}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">Date</label>
            <input
              type="date"
              name="date"
              required
              value={form.date}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">Time</label>
            <input
              type="text"
              name="time"
              required
              value={form.time}
              onChange={handleChange}
              placeholder="e.g. 05:30 PM"
              className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Location</label>
          <input
            name="location"
            required
            value={form.location}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            placeholder="e.g. Innovation Hall, Main Campus"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Image URL (optional)</label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-md border border-ink/15 text-sm focus-ring focus:outline-none"
            placeholder="https://…"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-md bg-ink text-paper font-semibold text-sm hover:bg-ink/90 transition-colors disabled:opacity-60 focus-ring"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/events')}
            className="px-6 py-2.5 rounded-md border border-ink/15 text-ink text-sm font-semibold hover:bg-ink/5 transition-colors focus-ring"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
