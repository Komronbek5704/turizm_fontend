const { body, validationResult } = require('express-validator');
const ChatMessage = require('../models/ChatMessage');

// Send chat message
const sendMessage = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { message, user_id } = req.body;
    const sender_type = req.user.role === 'admin' ? 'admin' : 'user';
    const admin_id = req.user.role === 'admin' ? req.user.id : null;
    const final_user_id = req.user.role === 'admin' ? user_id : req.user.id;

    const chatMessage = await ChatMessage.create({
      user_id: final_user_id,
      admin_id,
      message,
      sender_type
    });

    // Get full message details
    const fullMessage = await ChatMessage.findById(chatMessage.id);

    res.status(201).json({
      message: 'Chat message sent successfully',
      chatMessage: fullMessage
    });

  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get chat messages for a user
const getUserChatMessages = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Check if user is admin or the actual user
    if (req.user.role !== 'admin' && req.user.id !== parseInt(user_id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await ChatMessage.findByUserId(user_id, parseInt(limit), parseInt(offset));

    res.json({
      message: 'Chat messages retrieved successfully',
      messages
    });

  } catch (error) {
    console.error('Get user chat messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all chat messages (admin only)
const getAllChatMessages = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await ChatMessage.getAll(parseInt(limit), parseInt(offset));

    res.json({
      message: 'All chat messages retrieved successfully',
      messages
    });

  } catch (error) {
    console.error('Get all chat messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get chat sessions (admin only)
const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatMessage.getChatSessions();

    res.json({
      message: 'Chat sessions retrieved successfully',
      sessions
    });

  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark chat messages as read
const markChatAsRead = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Check if user is admin or the actual user
    if (req.user.role !== 'admin' && req.user.id !== parseInt(user_id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const markedMessages = await ChatMessage.markAsRead(null, user_id);

    res.json({
      message: 'Chat messages marked as read',
      markedCount: markedMessages.length
    });

  } catch (error) {
    console.error('Mark chat as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get unread chat messages count
const getUnreadChatCount = async (req, res) => {
  try {
    let count;
    
    if (req.user.role === 'admin') {
      // Admin gets count of unread user messages
      count = await ChatMessage.getUnreadCount();
    } else {
      // User gets count of unread admin messages
      count = await ChatMessage.getUnreadCount(req.user.id);
    }

    res.json({
      message: 'Unread chat messages count retrieved successfully',
      count
    });

  } catch (error) {
    console.error('Get unread chat count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get chat statistics (admin only)
const getChatStats = async (req, res) => {
  try {
    const stats = await ChatMessage.getStats();

    res.json({
      message: 'Chat statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get recent chat messages (admin only)
const getRecentChatMessages = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const messages = await ChatMessage.getRecent(parseInt(limit));

    res.json({
      message: 'Recent chat messages retrieved successfully',
      messages
    });

  } catch (error) {
    console.error('Get recent chat messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete chat message (admin only)
const deleteChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedMessage = await ChatMessage.delete(id);
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Chat message not found' });
    }

    res.json({
      message: 'Chat message deleted successfully',
      message: deletedMessage
    });

  } catch (error) {
    console.error('Delete chat message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Validation rules
const sendMessageValidation = [
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('user_id').optional().isInt({ min: 1 }).withMessage('Valid user ID is required when admin sends message')
];

module.exports = {
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
};
