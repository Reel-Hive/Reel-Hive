import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log('File uploaded successfully! URL: ', response.url);
    fs.unlinkSync(localFilePath); // Remove the file from local
    return response;
  } catch (error) {
    console.error('Cloudinary upload error:', error); // Log the error details
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Ensure local file cleanup
    }
    return null;
  }
};


export default uploadOnCloudinary;
