const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const {
    createCodOrder,
    getOrderQuote,
    listMyOrders,
    listAllOrders,
    cancelMyOrder,
    updateOrderStatus,
    getRevenue
} = require('../controllers/orderController');

router.post('/', authenticateToken, createCodOrder);
router.post('/quote', authenticateToken, getOrderQuote);
router.get('/mine', authenticateToken, listMyOrders);
router.get('/admin', authenticateToken, authorizeRole('admin'), listAllOrders);
router.patch('/:id/cancel', authenticateToken, cancelMyOrder);
router.patch('/:id/status', authenticateToken, authorizeRole('admin'), updateOrderStatus);
router.get('/admin/revenue', authenticateToken, authorizeRole('admin'), getRevenue);

module.exports = router;
