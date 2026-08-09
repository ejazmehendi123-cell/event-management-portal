const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { asyncHandler } = require('../middleware/errorHandler');

// @route  GET /api/events
// @access Public
// Supports ?search=&category=&status=upcoming|completed|all&sort=date|-date|createdAt&page=&limit=
const getEvents = asyncHandler(async (req, res) => {
  const { search, category, status = 'all', sort = 'date', page = 1, limit = 9 } = req.query;

  const query = {};
  if (search) {
    query.$text = { $search: search };
  }
  if (category && category !== 'All') {
    query.category = category;
  }
  if (status === 'upcoming') {
    query.date = { $gte: new Date() };
  } else if (status === 'completed') {
    query.date = { $lt: new Date() };
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const [events, total] = await Promise.all([
    Event.find(query).sort(sort).skip(skip).limit(limitNum).populate('createdBy', 'name email'),
    Event.countDocuments(query),
  ]);

  // Attach a live count of confirmed registrations + seats remaining
  const eventIds = events.map((e) => e._id);
  const counts = await Registration.aggregate([
    { $match: { event: { $in: eventIds }, status: 'confirmed' } },
    { $group: { _id: '$event', count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.count }), {});

  const enriched = events.map((e) => {
    const obj = e.toObject();
    obj.registeredCount = countMap[e._id.toString()] || 0;
    obj.seatsLeft = e.capacity - obj.registeredCount;
    return obj;
  });

  res.json({
    success: true,
    count: enriched.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    events: enriched,
  });
});

// @route  GET /api/events/:id
// @access Public
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const registeredCount = await Registration.countDocuments({ event: event._id, status: 'confirmed' });

  res.json({
    success: true,
    event: {
      ...event.toObject(),
      registeredCount,
      seatsLeft: event.capacity - registeredCount,
    },
  });
});

// @route  POST /api/events
// @access Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, category, date, time, location, capacity, imageUrl } = req.body;

  if (!title || !description || !date || !time || !location || !capacity) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const event = await Event.create({
    title,
    description,
    category,
    date,
    time,
    location,
    capacity,
    imageUrl,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, event });
});

// @route  PUT /api/events/:id
// @access Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, event });
});

// @route  DELETE /api/events/:id
// @access Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  await event.deleteOne();
  await Registration.deleteMany({ event: event._id });

  res.json({ success: true, message: 'Event deleted successfully' });
});

// @route  GET /api/events/:id/registrations
// @access Private/Admin
// Supports ?search= to filter attendees by name or email
const getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  let registrations = await Registration.find({ event: event._id, status: 'confirmed' })
    .populate('user', 'name email')
    .sort('-createdAt');

  const { search } = req.query;
  if (search) {
    const term = search.toLowerCase();
    registrations = registrations.filter(
      (r) => r.user?.name?.toLowerCase().includes(term) || r.user?.email?.toLowerCase().includes(term)
    );
  }

  res.json({ success: true, count: registrations.length, registrations });
});

// @route  GET /api/events/:id/registrations/export
// @desc   Streams a CSV file of confirmed attendees for one event
// @access Private/Admin
const exportEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const registrations = await Registration.find({ event: event._id, status: 'confirmed' })
    .populate('user', 'name email')
    .sort('-createdAt');

  const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const header = ['Name', 'Email', 'Registered On', 'Status'].join(',');
  const rows = registrations.map((r) =>
    [
      escapeCsv(r.user?.name),
      escapeCsv(r.user?.email),
      escapeCsv(new Date(r.createdAt).toLocaleString()),
      escapeCsv(r.status),
    ].join(',')
  );
  const csv = [header, ...rows].join('\n');

  const filename = `${event.title.replace(/[^a-z0-9]+/gi, '_')}_attendees.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  exportEventRegistrations,
};
