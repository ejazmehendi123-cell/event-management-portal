const express = require('express');
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getDashboardStats,
  getTicket,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/dashboard', protect, getDashboardStats);
router.get('/:id/ticket', protect, getTicket);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;
