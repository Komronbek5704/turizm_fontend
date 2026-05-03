const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validate } = require('../validators/validationSchemas');
const { createPaymentSchema } = require('../validators/validationSchemas');
const {
  createPayment,
  getPaymentStatus,
  getUserPayments,
  getAllPayments,
  paymeCallback,
  clickCallback,
  getPaymentStats
} = require('../controllers/paymentController');

// Create payment (authenticated users)
router.post('/', authMiddleware, validate(createPaymentSchema), createPayment);

// Get payment status (authenticated users)
router.get('/:id', authMiddleware, getPaymentStatus);

// Get user payments (authenticated users)
router.get('/my/payments', authMiddleware, getUserPayments);

// Admin only routes
router.get('/all', authMiddleware, adminMiddleware, getAllPayments);
router.get('/stats', authMiddleware, adminMiddleware, getPaymentStats);

// Payment callbacks (no auth required - payment services call these)
router.post('/payme/callback', paymeCallback);
router.post('/click/callback', clickCallback);

module.exports = router;
