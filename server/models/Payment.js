const mongoose = require('mongoose');

/**
 * Payment Model
 * Records individual fee payments made by a student.
 * Each payment is linked to a FeeRecord and a Student.
 */
const paymentSchema = new mongoose.Schema({
  feeRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeRecord',
    required: [true, 'Fee record ID is required'],
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [1, 'Payment amount must be at least 1'],
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'cheque'],
    required: [true, 'Payment mode is required'],
  },
  receiptNumber: {
    type: String,
    unique: true,
    required: [true, 'Receipt number is required'],
  },
  remarks: String,
});

// Indexes for efficient querying
paymentSchema.index({ studentId: 1 });
paymentSchema.index({ feeRecordId: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
