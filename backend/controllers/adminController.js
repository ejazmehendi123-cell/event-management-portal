const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { asyncHandler } = require('../middleware/errorHandler');

// @route  GET /api/admin/stats
// @access Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const [totalAttendees, totalEvents, totalRegistrations, upcomingEvents, completedEvents] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Event.countDocuments(),
    Registration.countDocuments({ status: 'confirmed' }),
    Event.countDocuments({ date: { $gte: now } }),
    Event.countDocuments({ date: { $lt: now } }),
  ]);

  const eventsByCategory = await Event.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Top 5 events by confirmed registration count ("event participation stats")
  const topEventsAgg = await Registration.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: '$event', registrations: { $sum: 1 } } },
    { $sort: { registrations: -1 } },
    { $limit: 5 },
    {
      $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' },
    },
    { $unwind: '$event' },
    { $project: { _id: 0, eventId: '$event._id', title: '$event.title', capacity: '$event.capacity', registrations: 1 } },
  ]);

  // Registration trend for the last 14 days (registration signups per day)
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const trendAgg = await Registration.aggregate([
    { $match: { status: 'confirmed', createdAt: { $gte: fourteenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in zero-count days so the chart has a continuous 14-day range
  const trendMap = trendAgg.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {});
  const registrationTrends = [];
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().substring(0, 10);
    registrationTrends.push({ date: key, count: trendMap[key] || 0 });
  }

  res.json({
    success: true,
    stats: {
      totalAttendees,
      totalEvents,
      totalRegistrations,
      upcomingEvents,
      completedEvents,
      eventsByCategory,
      topEvents: topEventsAgg,
      registrationTrends,
    },
  });
});

module.exports = { getStats };
