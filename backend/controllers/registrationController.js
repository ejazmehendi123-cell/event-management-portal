const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { asyncHandler } = require('../middleware/errorHandler');
const { streamTicketPdf } = require('../utils/ticketPdf');

// @route  POST /api/registrations
// @body   { eventId }
// @access Private
const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    res.status(400);
    throw new Error('eventId is required');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (new Date(event.date) < new Date()) {
    res.status(400);
    throw new Error('This event has already taken place');
  }

  const existing = await Registration.findOne({ user: req.user._id, event: eventId });

  if (existing && existing.status === 'confirmed') {
    res.status(400);
    throw new Error('You are already registered for this event');
  }

  const confirmedCount = await Registration.countDocuments({ event: eventId, status: 'confirmed' });
  if (confirmedCount >= event.capacity) {
    res.status(400);
    throw new Error('This event is fully booked');
  }

  let registration;
  if (existing) {
    // Re-registering after a previous cancellation
    existing.status = 'confirmed';
    registration = await existing.save();
  } else {
    registration = await Registration.create({ user: req.user._id, event: eventId });
  }

  registration = await registration.populate('event');

  res.status(201).json({ success: true, registration });
});

// @route  GET /api/registrations/my
// @access Private
// Supports ?status=upcoming|completed|all (default: all)
const getMyRegistrations = asyncHandler(async (req, res) => {
  const { status = 'all' } = req.query;

  const registrations = await Registration.find({ user: req.user._id, status: 'confirmed' })
    .populate('event')
    .sort('-createdAt');

  const now = new Date();
  const enriched = registrations
    .filter((r) => r.event) // guard against events that were deleted
    .map((r) => {
      const obj = r.toObject();
      obj.isPast = new Date(r.event.date) < now;
      return obj;
    });

  const filtered = enriched.filter((r) => {
    if (status === 'upcoming') return !r.isPast;
    if (status === 'completed') return r.isPast;
    return true;
  });

  res.json({ success: true, count: filtered.length, registrations: filtered });
});

// @route  GET /api/registrations/dashboard
// @desc   Aggregated stats for the attendee dashboard: streak, totals,
//         upcoming events for reminders/countdowns, and favorite count.
// @access Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id, status: 'confirmed' })
    .populate('event')
    .sort('-createdAt');

  const now = new Date();
  const valid = registrations.filter((r) => r.event);
  const upcoming = valid.filter((r) => new Date(r.event.date) >= now).sort((a, b) => new Date(a.event.date) - new Date(b.event.date));
  const completed = valid.filter((r) => new Date(r.event.date) < now);

  // Participation streak: consecutive months (ending this month) in which
  // the attendee registered for at least one event.
  const monthsWithActivity = new Set(valid.map((r) => `${r.createdAt.getFullYear()}-${r.createdAt.getMonth()}`));
  let streak = 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  while (monthsWithActivity.has(`${cursor.getFullYear()}-${cursor.getMonth()}`)) {
    streak += 1;
    cursor.setMonth(cursor.getMonth() - 1);
  }

  const favoritesCount = req.user.favorites?.length || 0;

  res.json({
    success: true,
    stats: {
      totalRegistrations: valid.length,
      upcomingCount: upcoming.length,
      completedCount: completed.length,
      favoritesCount,
      participationStreak: streak,
      upcomingReminders: upcoming.slice(0, 5),
    },
  });
});

// @route  GET /api/registrations/:id/ticket
// @desc   Streams a downloadable PDF ticket for a confirmed registration
// @access Private (owner or admin)
const getTicket = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id).populate('event').populate('user', 'name email');

  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }

  if (registration.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only download your own ticket');
  }

  if (registration.status !== 'confirmed') {
    res.status(400);
    throw new Error('This registration is not confirmed, so no ticket is available');
  }

  await streamTicketPdf(res, {
    registration,
    event: registration.event,
    attendee: registration.user,
  });
});

// @route  DELETE /api/registrations/:id
// @access Private
const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }

  if (registration.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only cancel your own registration');
  }

  registration.status = 'cancelled';
  await registration.save();

  res.json({ success: true, message: 'Registration cancelled' });
});

module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getDashboardStats,
  getTicket,
};
