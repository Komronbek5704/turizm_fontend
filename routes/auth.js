const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../validators/validationSchemas');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema
} = require('../validators/validationSchemas');
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');

// Register new user
router.post('/register', validate(registerSchema), register);

// Login user
router.post('/login', validate(loginSchema), login);

// Get current user profile (protected route)
router.get('/profile', authMiddleware, getProfile);

// Update user profile (protected route)
router.put('/profile', authMiddleware, validate(updateProfileSchema), updateProfile);

module.exports = router;
