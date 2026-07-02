const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper function to handle memory buffer uploads to Cloudinary for PDFs/TXT files
 * @param {Buffer} fileBuffer - The file buffer coming from req.file.buffer
 * @param {string} originalName - Original filename for identification
 */
const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "exampulse_materials",
        public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, "")}`, // Removes file extension for cleaner ID
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result); 
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};