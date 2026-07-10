const mongoose = require('mongoose');

/**
 * Teacher Model
 * Stores teacher information including personal details,
 * qualifications, assigned subjects, and classes.
 */
const teacherSchema = new mongoose.Schema(
  {
    // --- Teacher Identification ---
    teacherId: {
      type: String,
      unique: true,
      required: [true, 'Teacher ID is required'],
    },

    // --- Personal Information ---
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: String,
    },

    // --- Professional Details ---
    qualification: {
      type: String,
    },
    subjects: [{ type: String }], // e.g. ['Mathematics', 'Physics']
    assignedClasses: [{ type: String }], // e.g. ['5', '6', '7']
    joiningDate: {
      type: Date,
      default: Date.now,
    },

    // --- Status ---
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient searching
teacherSchema.index({ firstName: 'text', lastName: 'text' });
teacherSchema.index({ status: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);
