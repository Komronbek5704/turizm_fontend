const { uploadImage, deleteImage, getImages } = require('../config/cloudinary');

// Single rasm yuklash
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Rasm fayli topilmadi',
        error: 'Fayl yuklanmadi'
      });
    }

    // Buffer ni string ga o'tkazish
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const result = await uploadImage(fileBase64, 'tourvoyage/tours');

    res.status(201).json({
      message: 'Rasm muvaffaqiyatli yuklandi',
      image: result
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Rasm yuklashda xatolik',
      error: error.message
    });
  }
};

// Multiple rasmlarni yuklash
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'Rasm fayllari topilmadi',
        error: 'Fayllar yuklanmadi'
      });
    }

    // Fayllarni base64 formatga o'tkazish
    const filesBase64 = req.files.map(file => 
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    );
    
    const results = await Promise.all(
      filesBase64.map(file => uploadImage(file, 'tourvoyage/tours'))
    );

    res.status(201).json({
      message: 'Rasmlar muvaffaqiyatli yuklandi',
      images: results,
      count: results.length
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      message: 'Rasmlarni yuklashda xatolik',
      error: error.message
    });
  }
};

// Rasmni o'chirish
const deleteUploadedImages = async (req, res) => {
  try {
    const { public_id } = req.body;
    
    if (!public_id) {
      return res.status(400).json({
        message: 'Public ID majburiy',
        error: 'Public ID kiritilmadi'
      });
    }

    await deleteImage(public_id);

    res.json({
      message: 'Rasm muvaffaqiyatli o\'chirildi'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      message: 'Rasm o\'chirishda xatolik',
      error: error.message
    });
  }
};

// Rasmlarni olish
const getUploadedImages = async (req, res) => {
  try {
    const { folder = 'tourvoyage/tours', limit = 50 } = req.query;
    
    const images = await getImages(folder, parseInt(limit));

    res.json({
      message: 'Rasmlar muvaffaqiyatli olindi',
      images,
      count: images.length
    });

  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      message: 'Rasmlarni olishda xatolik',
      error: error.message
    });
  }
};

// Tour uchun rasm yuklash (maxsus)
const uploadTourImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Tur rasmi topilmadi',
        error: 'Fayl yuklanmadi'
      });
    }

    // Buffer ni string ga o'tkazish
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const result = await uploadImage(fileBase64, 'tourvoyage/tours');

    res.status(201).json({
      message: 'Tur rasmi muvaffaqiyatli yuklandi',
      image: result
    });

  } catch (error) {
    console.error('Tour image upload error:', error);
    res.status(500).json({
      message: 'Tur rasmini yuklashda xatolik',
      error: error.message
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteUploadedImages,
  getUploadedImages,
  uploadTourImage
};
