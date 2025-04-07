// multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the upload directory
const uploadDir = 'uploads/images';

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });  // Create the directory if it doesn't exist
}

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    // Get file extension and original name
    const fileExtension = path.extname(file.originalname); // Get file extension (e.g., .jpg)
    const originalName = path.basename(file.originalname, fileExtension); // Get the name without extension
    const filename = `${originalName}-${Date.now()}${fileExtension}`; // Append timestamp to the original name
    cb(null, filename); // Set the file name with original name and date
  }
});

// Create a multer instance with storage settings, accepting only one file ('image') and file size limit
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5 MB (in bytes)
});

module.exports = upload;