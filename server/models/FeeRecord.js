const mongoose = require('mongoose');

/**
 * FeeRecord Model
 * Tracks the total fee assigned to a student and references all payments made.
 * Each student has one fee record per admission.
 */
const feeRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      unique: true,
    },
    totalFee: {
      type: Number,
      required: [true, 'Total fee amount is required'],
      min: [0, 'Total fee cannot be negative'],
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FeeRecord', feeRecordSchema);
