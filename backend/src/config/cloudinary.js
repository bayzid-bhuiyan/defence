const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Set up the storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'inventory_app', // Cloudinary will create this folder for you
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Security restriction
    transformation: [{ width: 800, height: 800, crop: 'limit' }], // Optimize size before saving
  },
});

// 3. Initialize Multer with the storage engine and a file size limit (e.g., 5MB)
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit prevents malicious large uploads
});

module.exports = { upload, cloudinary };