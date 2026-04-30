import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from 'multer'


// Configure Cloudinary with your account credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Tell multer to store uploaded files directly to Cloudinary
// (not saved to disk — goes straight to the cloud)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'homecoming',       // Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, crop: 'limit' }], // resize large images
  },
})

export const upload = multer({ storage })