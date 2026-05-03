const multer = require('multer');
const path = require('path');

// Multer konfiguratsiyasi - memory storage (Cloudinary uchun)
const storage = multer.memoryStorage();

// Fayl filteri - faqat rasmlar
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat JPG, JPEG, PNG, GIF, WEBP formatdagi rasmlar ruxsat etilgan'), false);
  }
};

// Multer konfiguratsiyasi
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Maksimum 5 ta fayl
  }
});

// Single rasm yuklash middleware
const uploadSingle = upload.single('image');

// Multiple rasm yuklash middleware (maksimum 5 ta)
const uploadMultiple = upload.array('images', 5);

// Tour rasm yuklash uchun maxsus middleware
const uploadTourImage = upload.single('tourImage');

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'Fayl hajmi 5MB dan oshmasligi kerak',
        error: 'Fayl hajmi juda katta'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Bir vaqtda 5 tadan ko\'p fayl yuklash mumkin emas',
        error: 'Fayllar soni juda ko\'p'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Noto\'g\'ri fayl maydoni nomi',
        error: 'Fayl maydoni xato'
      });
    }
  }

  if (err.message.includes('Faqat') || err.message.includes('formatdagi')) {
    return res.status(400).json({
      message: err.message,
      error: 'Fayl turi noto\'g\'ri'
    });
  }

  next(err);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadTourImage,
  handleUploadError
};
