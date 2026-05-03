const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');

// Create new contact message
const createMessage = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { name, email, subject, message } = req.body;
    
    const newMessage = await Message.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: newMessage
    });

  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all messages (admin only)
const getAllMessages = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await Message.getAll(parseInt(limit), parseInt(offset));

    res.json({
      message: 'Messages retrieved successfully',
      messages
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get message by ID (admin only)
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      message: 'Message retrieved successfully',
      message
    });

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark message as read (admin only)
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedMessage = await Message.markAsRead(id);
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      message: 'Message marked as read',
      message: updatedMessage
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete message (admin only)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedMessage = await Message.delete(id);
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      message: 'Message deleted successfully',
      message: deletedMessage
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get message statistics (admin only)
const getMessageStats = async (req, res) => {
  try {
    const stats = await Message.getStats();

    res.json({
      message: 'Message statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get unread messages count (admin only)
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.getUnreadCount();

    res.json({
      message: 'Unread messages count retrieved successfully',
      count
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get recent messages (admin only)
const getRecentMessages = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const messages = await Message.getRecent(parseInt(limit));

    res.json({
      message: 'Recent messages retrieved successfully',
      messages
    });

  } catch (error) {
    console.error('Get recent messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Validation rules
const createMessageValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('subject').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Subject must be between 2 and 200 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters long')
];

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  markMessageAsRead,
  deleteMessage,
  getMessageStats,
  getUnreadCount,
  getRecentMessages,
  createMessageValidation
};
