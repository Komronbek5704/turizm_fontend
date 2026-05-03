const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  sendMessage,
  getUserChatMessages,
  getAllChatMessages,
  getChatSessions,
  markChatAsRead,
  getUnreadChatCount,
  getChatStats,
  getRecentChatMessages,
  deleteChatMessage,
  sendMessageValidation
} = require('../controllers/chatController');

// Send chat message (authenticated users)
router.post('/', authMiddleware, sendMessageValidation, sendMessage);

// Get user's chat messages (user can see their own, admin can see all)
router.get('/user/:user_id', authMiddleware, getUserChatMessages);

// Mark chat as read
router.put('/read/:user_id', authMiddleware, markChatAsRead);

// Get unread chat count
router.get('/unread', authMiddleware, getUnreadChatCount);

// Admin only routes
router.get('/sessions', authMiddleware, adminMiddleware, getChatSessions);
router.get('/all', authMiddleware, adminMiddleware, getAllChatMessages);
router.get('/stats', authMiddleware, adminMiddleware, getChatStats);
router.get('/recent', authMiddleware, adminMiddleware, getRecentChatMessages);
router.delete('/:id', authMiddleware, adminMiddleware, deleteChatMessage);

module.exports = router;
