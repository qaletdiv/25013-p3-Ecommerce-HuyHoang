const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { getReviews, createReview } = require('../controllers/reviewController');

const router = express.Router();
router.get('/', getReviews);
router.post('/', authenticateToken, createReview);

module.exports = router;
