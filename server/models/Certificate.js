const mongoose = require('mongoose');

/**
 * Certificate Model
 * Stores generated certificates (bonafide, transfer certificate) for students.
 * The `data` field holds all the certificate-specific fields as a flexible object.
 */
const certificateSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  },
  type: {
    type: String,
    enum: ['bonafide', 'transfer_certificate'],
    required: [true, 'Certificate type is required'],
  },
  tcNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values (only TCs have a tcNumber)
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: Object,
    default: {},
  },
});

// Index for quick lookups by student
certificateSchema.index({ studentId: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
