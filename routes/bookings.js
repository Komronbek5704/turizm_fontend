const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  createBooking,
  getAllBookings,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
  getMonthlyStats,
  getUserBookingStats,
  getRecentBookings,
  createBookingValidation,
  updateStatusValidation
} = require('../controllers/bookingController');

// User routes
router.post('/', authMiddleware, createBookingValidation, createBooking);
router.get('/my', authMiddleware, getUserBookings);
router.get('/my/stats', authMiddleware, getUserBookingStats);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/cancel', authMiddleware, cancelBooking);

// Admin only routes
router.get('/', authMiddleware, adminMiddleware, getAllBookings);
router.put('/:id/status', authMiddleware, adminMiddleware, updateStatusValidation, updateBookingStatus);
router.get('/stats/admin', authMiddleware, adminMiddleware, getBookingStats);
router.get('/stats/monthly', authMiddleware, adminMiddleware, getMonthlyStats);
router.get('/recent/admin', authMiddleware, adminMiddleware, getRecentBookings);

module.exports = router;
