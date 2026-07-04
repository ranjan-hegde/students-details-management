const Payment = require('../models/Payment');
const FeeRecord = require('../models/FeeRecord');
const Student = require('../models/Student');
console.log(Student)
/**
 * @desc    Record a new payment (auto-generates receipt number, pushes to fee record)
 * @route   POST /api/payments
 */

exports.createPayment = async (req, res, next) => {
  console.log(Student)
  try {
    const { studentId, amount, paymentMode, remarks } = req.body;

    // Verify the student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Find the student's fee record, or auto-create it if it doesn't exist
    let feeRecord = await FeeRecord.findOne({ studentId });
    if (!feeRecord) {
      const SchoolSetting = require('../models/SchoolSetting');
      const settings = await SchoolSetting.findOne() || {};
      const defaultFee = settings.defaultFee || 0;
      feeRecord = await FeeRecord.create({ studentId, totalFee: defaultFee });
    }

    // Auto-generate receipt number: RCP-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const yearPrefix = `RCP-${currentYear}-`;
    const paymentCount = await Payment.countDocuments({
      receiptNumber: { $regex: `^${yearPrefix}` },
    });
    const nextNumber = String(paymentCount + 1).padStart(4, '0');
    const receiptNumber = `${yearPrefix}${nextNumber}`;

    // Create the payment
    const payment = await Payment.create({
      feeRecordId: feeRecord._id,
      studentId,
      amount,
      paymentMode,
      receiptNumber,
      remarks,
    });

    console.log(feeRecord)
    // Push the payment reference into the fee record's payments array
    feeRecord.payments.push(payment._id);
    await feeRecord.save();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment history for a student
 * @route   GET /api/payments/:studentId
 */
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({
      studentId: req.params.studentId,
    }).sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};
