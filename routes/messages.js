const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  createMessage,
  getAllMessages,
  getMessageById,
  markMessageAsRead,
  deleteMessage,
  getMessageStats,
  getUnreadCount,
  getRecentMessages,
  createMessageValidation
} = require('../controllers/messageController');

// Public route - anyone can send contact message
router.post('/', createMessageValidation, createMessage);

// Admin only routes
router.get('/', authMiddleware, adminMiddleware, getAllMessages);
router.get('/stats', authMiddleware, adminMiddleware, getMessageStats);
router.get('/unread', authMiddleware, adminMiddleware, getUnreadCount);
router.get('/recent', authMiddleware, adminMiddleware, getRecentMessages);
router.get('/:id', authMiddleware, adminMiddleware, getMessageById);
router.put('/:id/read', authMiddleware, adminMiddleware, markMessageAsRead);
router.delete('/:id', authMiddleware, adminMiddleware, deleteMessage);

module.exports = router;
