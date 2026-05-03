const cloudinary = require('cloudinary').v2;

// Cloudinary konfiguratsiyasi
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Rasm yuklash funksiyasi
const uploadImage = async (file, folder = 'tourvoyage') => {
  try {
    if (!file) {
      throw new Error('Fayl topilmadi');
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      max_file_size: 5000000, // 5MB
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      size: result.bytes,
      format: result.format
    };

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Rasm yuklashda xatolik: ' + error.message);
  }
};

// Rasmni o'chirish funksiyasi
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Public ID kerak');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return true;
    } else {
      throw new Error('Rasm o\'chirilmadi');
    }

  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Rasm o\'chirishda xatolik: ' + error.message);
  }
};

// Rasmlarni olish funksiyasi
const getImages = async (folder = 'tourvoyage', maxResults = 50) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: maxResults
    });

    return result.resources.map(resource => ({
      url: resource.secure_url,
      public_id: resource.public_id,
      size: resource.bytes,
      format: resource.format,
      created_at: resource.created_at
    }));

  } catch (error) {
    console.error('Cloudinary get images error:', error);
    throw new Error('Rasmlarni olishda xatolik: ' + error.message);
  }
};

// URL generatsiya qilish (optimallashtirilgan)
const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto:good',
    fetch_format: 'auto',
    crop: 'limit',
    width: 800,
    height: 600
  };

  const finalOptions = { ...defaultOptions, ...options };

  return cloudinary.url(publicId, finalOptions);
};

// Multiple rasm yuklash
const uploadMultipleImages = async (files, folder = 'tourvoyage') => {
  try {
    if (!files || !Array.isArray(files)) {
      throw new Error('Fayllar array kerak');
    }

    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);

    return results;

  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error('Ko\'plab rasmlarni yuklashda xatolik: ' + error.message);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getImages,
  getOptimizedUrl,
  uploadMultipleImages
};
