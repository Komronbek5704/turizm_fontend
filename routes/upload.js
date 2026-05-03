const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { 
  uploadSingle, 
  uploadMultiple, 
  uploadTourImage, 
  handleUploadError 
} = require('../middleware/upload');
let {
  uploadSingleImage,
  uploadMultipleImages,
  deleteUploadedImages,
  getUploadedImages,
  uploadTourImage
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
router.post('/tour-image', 
  authMiddleware, 
  adminMiddleware, 
  uploadTourImage, 
  handleUploadError, 
  uploadTourImage
);

// Rasmni o'chirish (admin only)
router.delete('/delete', authMiddleware, adminMiddleware, deleteUploadedImages);

// Rasmlarni olish (admin only)
router.get('/images', authMiddleware, adminMiddleware, getUploadedImages);

module.exports = router;
