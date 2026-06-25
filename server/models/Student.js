const mongoose = require('mongoose');

/**
 * Student Model
 * Stores comprehensive student information including personal details,
 * parent/guardian info, academic details, and address.
 */
const studentSchema = new mongoose.Schema(
  {
    // --- Admission Details ---
    admissionNumber: {
      type: String,
      unique: true,
      required: [true, 'Admission number is required'],
    },
    admissionDate: {
      type: Date,
      default: Date.now,
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
    dateOfBirth: {
      type: String,
      // required: ['Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    bloodGroup: String,
    religion: String,
    caste: String,
    subCaste: String,
    nationality: {
      type: String,
      default: 'Indian',
    },
    aadhaarNumber: String,
    category: {
      type: String,
      enum: ['General', 'SC', 'ST', 'OBC', 'Other'],
      default: 'General',
    },

    // --- Academic Details ---
    currentClass: {
      type: String,
      required: [true, 'Current class is required'],
    },
    section: String,
    rollNumber: String,
    previousSchool: String,

    // --- Parent / Guardian Information ---
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
    },
    fatherOccupation: String,
    fatherMobile: {
      type: String,
      required: [true, "Father's mobile number is required"],
    },
    fatherEmail: String,
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
    },
    motherOccupation: String,
    motherMobile: String,

    // --- Address Details ---
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    pinCode: {
      type: String,
      required: [true, 'Pin code is required'],
    },
    place: String,
    taluka: String,
    district: String,

    // --- Photo & Status ---
    photo: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'transferred'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient searching
studentSchema.index({ firstName: 'text', lastName: 'text', admissionNumber: 'text' });
studentSchema.index({ currentClass: 1, section: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', studentSchema);
