const Tour = require('../models/Tour');
const { 
    createTourSchema, 
    updateTourSchema,
    validate 
} = require('../validators/validationSchemas');

// Get all tours
const getAllTours = async (req, res) => {
  try {
    const { limit = 50, offset = 0, destination } = req.query;
    
    let tours;
    if (destination) {
      tours = await Tour.getByDestination(destination);
    } else {
      tours = await Tour.getAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      message: 'Tours retrieved successfully',
      tours,
      total: tours.length
    });

  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get tour by ID
const getTourById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    res.json({
      message: 'Tour retrieved successfully',
      tour
    });

  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new tour (admin only)
const createTour = async (req, res) => {
  try {
    const tourData = req.validatedBody;
    const tour = await Tour.create(tourData);

    res.status(201).json({
      message: 'Tour created successfully',
      tour
    });

  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update tour (admin only)
const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tourData = req.validatedBody;

    const updatedTour = await Tour.update(id, tourData);
    if (!updatedTour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    res.json({
      message: 'Tour updated successfully',
      tour: updatedTour
    });

  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete tour (admin only)
const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTour = await Tour.delete(id);
    if (!deletedTour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    res.json({
      message: 'Tour deleted successfully',
      tour: deletedTour
    });

  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get available tours
const getAvailableTours = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tours = await Tour.getAvailable(parseInt(limit));

    res.json({
      message: 'Available tours retrieved successfully',
      tours
    });

  } catch (error) {
    console.error('Get available tours error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get popular tours
const getPopularTours = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const tours = await Tour.getPopularTours(parseInt(limit));

    res.json({
      message: 'Popular tours retrieved successfully',
      tours
    });

  } catch (error) {
    console.error('Get popular tours error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get tour statistics (admin only)
const getTourStats = async (req, res) => {
  try {
    const stats = await Tour.getStats();

    res.json({
      message: 'Tour statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Get tour stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getAvailableTours,
  getPopularTours,
  getTourStats
};
