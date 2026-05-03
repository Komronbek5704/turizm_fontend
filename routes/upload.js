const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Middleware'larni chaqirish
const { 
  uploadSingle, 
  uploadMultiple, 
  uploadTourImage: uploadTourMiddleware, // Nomini o'zgartirdik
  handleUploadError 
} = require('../middleware/upload');

// Controller'larni chaqirish
const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteUploadedImages,
  getUploadedImages,
  uploadTourImage: uploadTourController // Nomini o'zgartirdik
} = require('../controllers/uploadController');

// Single rasm yuklash (admin only)
router.post('/single', 
  authMiddleware, 
  adminMiddleware, 
  uploadSingle, 
  handleUploadError, 
  uploadSingleImage
);

// Multiple rasmlarni yuklash (admin only)
router.post('/multiple', 
  authMiddleware, 
  adminMiddleware, 
  uploadMultiple, 
  handleUploadError, 
  uploadMultipleImages
);

// Tour uchun rasm yuklash (admin only)
// Bu yerda yangi nomlangan o'zgaruvchilarni ishlatamiz
router.post('/tour-image', 
  authMiddleware, 
  adminMiddleware, 
  uploadTourMiddleware, // Middleware qismi
  handleUploadError, 
  uploadTourController // Controller qismi
);

// Rasmni o'chirish (admin only)
router.delete('/delete', authMiddleware, adminMiddleware, deleteUploadedImages);

// Rasmlarni olish (admin only)
router.get('/images', authMiddleware, adminMiddleware, getUploadedImages);

module.exports = router;
