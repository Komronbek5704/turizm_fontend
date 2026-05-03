const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const User = require('../models/User');
const { 
  sendBookingConfirmationEmail,
  sendNewBookingNotification
} = require('../config/email');

// Create new booking
const createBooking = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { tour_id, travel_date, number_of_people = 1 } = req.body;
    const user_id = req.user.id;

    // Check if tour exists and has available spots
    const tour = await Tour.findById(tour_id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    if (tour.available_spots < number_of_people) {
      return res.status(400).json({ 
        message: 'Not enough available spots for this tour' 
      });
    }

    // Calculate total price
    const total_price = tour.price * number_of_people;

    // Create booking
    const booking = await Booking.create({
      user_id,
      tour_id,
      travel_date,
      number_of_people,
      total_price
    });

    // Update available spots
    await Tour.updateAvailableSpots(tour_id, tour.available_spots - number_of_people);

    // Get full booking details
    const fullBooking = await Booking.findById(booking.id);

    // Send email notifications
    try {
      const userData = await User.findById(user_id);
      if (userData) {
        // Send confirmation email to user
        await sendBookingConfirmationEmail(booking, userData, tour);
        
        // Send notification to admin
        await sendNewBookingNotification(booking, userData, tour);
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Email xatosi bron qilishga to'sqin qilmaydi
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: fullBooking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const bookings = await Booking.getAll(parseInt(limit), parseInt(offset));

    res.json({
      message: 'Bookings retrieved successfully',
      bookings
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      message: 'Booking retrieved successfully',
      booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const user_id = req.user.id;
    
    const bookings = await Booking.findByUserId(user_id, parseInt(limit), parseInt(offset));

    res.json({
      message: 'User bookings retrieved successfully',
      bookings
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = await Booking.updateStatus(id, status);
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // If booking is cancelled, restore available spots
    if (status === 'cancelled') {
      const tour = await Tour.findById(updatedBooking.tour_id);
      if (tour) {
        await Tour.updateAvailableSpots(tour.id, tour.available_spots + updatedBooking.number_of_people);
      }
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cancel booking (user can cancel their own booking)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancellation of pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ 
        message: 'Cannot cancel booking in current status' 
      });
    }

    const updatedBooking = await Booking.updateStatus(id, 'cancelled');

    // Restore available spots
    const tour = await Tour.findById(booking.tour_id);
    if (tour) {
      await Tour.updateAvailableSpots(tour.id, tour.available_spots + booking.number_of_people);
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get booking statistics (admin only)
const getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.getStats();

    res.json({
      message: 'Booking statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get monthly statistics (admin only)
const getMonthlyStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const stats = await Booking.getMonthlyStats(parseInt(year));

    res.json({
      message: 'Monthly statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Get monthly stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user booking statistics
const getUserBookingStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    const stats = await Booking.getUserBookingStats(user_id);

    res.json({
      message: 'User booking statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Get user booking stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get recent bookings (admin only)
const getRecentBookings = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const bookings = await Booking.getRecentBookings(parseInt(limit));

    res.json({
      message: 'Recent bookings retrieved successfully',
      bookings
    });

  } catch (error) {
    console.error('Get recent bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Validation rules
const createBookingValidation = [
  body('tour_id').isInt({ min: 1 }).withMessage('Valid tour ID is required'),
  body('travel_date').isISO8601().withMessage('Valid travel date is required'),
  body('number_of_people').isInt({ min: 1, max: 20 }).withMessage('Number of people must be between 1 and 20')
];

const updateStatusValidation = [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status')
];

module.exports = {
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
};
