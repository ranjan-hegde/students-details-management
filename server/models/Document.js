const mongoose = require('mongoose');

/**
 * Document Model
 * Stores metadata about files uploaded for a student (photos, certificates, etc.).
 */
const documentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  },
  type: {
    type: String,
    enum: ['photo', 'aadhaar', 'birth_certificate', 'tc', 'other'],
    required: [true, 'Document type is required'],
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for quick lookups by student
documentSchema.index({ studentId: 1 });

module.exports = mongoose.model('Document', documentSchema);
