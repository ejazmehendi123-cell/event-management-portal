const express = require('express');
const { getFavorites, toggleFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/:eventId', protect, toggleFavorite);

module.exports = router;
