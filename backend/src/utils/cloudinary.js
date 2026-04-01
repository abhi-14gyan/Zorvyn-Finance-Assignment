const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Cloudinary config from environment variables
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Upload a file from local path to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("No File Path");
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Auto-detects type (image, video, raw, etc.)
        });

        // Delete local file after successful upload
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // If upload fails, delete the local file to clean up
        fs.unlinkSync(localFilePath);
        return null;
    }
};

// Delete a file from Cloudinary using its public ID
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
