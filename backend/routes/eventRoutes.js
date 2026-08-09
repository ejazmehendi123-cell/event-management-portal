const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  exportEventRegistrations,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);
router.get('/:id/registrations', protect, authorize('admin'), getEventRegistrations);
router.get('/:id/registrations/export', protect, authorize('admin'), exportEventRegistrations);

module.exports = router;
