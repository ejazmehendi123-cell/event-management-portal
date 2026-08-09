const User = require('../models/User');
const Event = require('../models/Event');
const { asyncHandler } = require('../middleware/errorHandler');

// @route  GET /api/favorites
// @access Private
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  res.json({ success: true, count: user.favorites.length, favorites: user.favorites });
});

// @route  POST /api/favorites/:eventId
// @desc   Toggles an event in/out of the current user's favorites
// @access Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const user = await User.findById(req.user._id);
  const index = user.favorites.findIndex((id) => id.toString() === eventId);

  let favorited;
  if (index >= 0) {
    user.favorites.splice(index, 1);
    favorited = false;
  } else {
    user.favorites.push(eventId);
    favorited = true;
  }

  await user.save();

  res.json({ success: true, favorited, favorites: user.favorites });
});

module.exports = { getFavorites, toggleFavorite };
