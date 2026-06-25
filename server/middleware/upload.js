const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Multer Configuration
 * - Storage: saves files to `uploads/{studentId}/` directory
 * - File Filter: accepts only images (jpg, jpeg, png) and PDFs
 * - Size Limit: 5MB per file
 */

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create a subdirectory for each student using their ID from the route param
    const studentId = req.params.studentId;
    const uploadDir = path.join(__dirname, '..', 'uploads', studentId);

    // Ensure the directory exists
    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: timestamp-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter — allow only images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG images and PDF files are allowed'), false);
  }
};

// Create and export the multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

module.exports = upload;
