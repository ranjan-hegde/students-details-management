const mongoose = require('mongoose');

/**
 * Subject Result Sub-Schema
 * Stores marks and grade for an individual subject within a result.
 */
const subjectResultSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    obtainedMarks: {
      type: Number,
      required: [true, 'Obtained marks are required'],
    },
    grade: {
      type: String,
    },
  },
  { _id: false }
);

/**
 * Result Model
 * Stores student exam results including per-subject marks,
 * totals, percentage, pass/fail status, and rank.
 */
const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
    },
    section: {
      type: String,
    },
    examType: {
      type: String,
      enum: ['Unit Test 1', 'Unit Test 2', 'Mid-Term', 'Annual', 'Other'],
      required: [true, 'Exam type is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
    subjects: [subjectResultSchema],
    totalMaxMarks: {
      type: Number,
    },
    totalObtainedMarks: {
      type: Number,
    },
    percentage: {
      type: Number,
    },
    result: {
      type: String,
      enum: ['Pass', 'Fail'],
    },
    rank: {
      type: Number,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one result per student per class per exam per year
resultSchema.index(
  { studentId: 1, class: 1, examType: 1, academicYear: 1 },
  { unique: true }
);
// Index for class-wide result queries
resultSchema.index({ class: 1, section: 1, examType: 1, academicYear: 1 });

module.exports = mongoose.model('Result', resultSchema);
