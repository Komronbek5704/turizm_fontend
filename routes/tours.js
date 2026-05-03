const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validate } = require('../validators/validationSchemas');
const {
  createTourSchema,
  updateTourSchema
} = require('../validators/validationSchemas');
const {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getAvailableTours,
  getPopularTours,
  getTourStats
} = require('../controllers/tourController');

// Public routes
router.get('/', getAllTours);
router.get('/available', getAvailableTours);
router.get('/popular', getPopularTours);
router.get('/:id', getTourById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, validate(createTourSchema), createTour);
router.put('/:id', authMiddleware, adminMiddleware, validate(updateTourSchema), updateTour);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTour);
router.get('/stats/admin', authMiddleware, adminMiddleware, getTourStats);

module.exports = router;
