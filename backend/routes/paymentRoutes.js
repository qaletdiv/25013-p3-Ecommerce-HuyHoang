const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const { createCheckoutSession, confirmCheckoutSession } = require('../controllers/stripeController');

router.get('/', (req, res) => {
    res.json([
        {
            id: 'cod',
            name: 'Thanh toán khi nhận hàng',
            type: 'cash'
        },
        {
            id: 'stripe',
            name: 'Thanh toán online qua Stripe',
            type: 'stripe'
        }
    ]);
});

router.post('/stripe/create-checkout-session', authenticateToken, createCheckoutSession);
router.get('/stripe/confirm', authenticateToken, confirmCheckoutSession);

module.exports = router;
