const FeeRecord = require('../models/FeeRecord');
const Student = require('../models/Student');

/**
 * @desc    Create a fee record for a student
 * @route   POST /api/fees
 */
exports.createFeeRecord = async (req, res, next) => {
  try {
    const { studentId, totalFee } = req.body;

    // Verify the student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Check if a fee record already exists for this student
    const existing = await FeeRecord.findOne({ studentId });
    if (existing) {
      res.status(400);
      throw new Error('Fee record already exists for this student');
    }

    const feeRecord = await FeeRecord.create({ studentId, totalFee });

    res.status(201).json({
      success: true,
      message: 'Fee record created successfully',
      data: feeRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get fee record for a student with populated payments and calculated amounts
 * @route   GET /api/fees/:studentId
 */
exports.getFeeRecord = async (req, res, next) => {
  try {
    const feeRecord = await FeeRecord.findOne({
      studentId: req.params.studentId,
    }).populate('payments');

    if (!feeRecord) {
      res.status(404);
      throw new Error('Fee record not found for this student');
    }

    // Calculate paid and pending amounts
    const totalPaid = feeRecord.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const pendingFee = feeRecord.totalFee - totalPaid;

    res.status(200).json({
      success: true,
      data: {
        _id: feeRecord._id,
        studentId: feeRecord.studentId,
        totalFee: feeRecord.totalFee,
        totalPaid,
        pendingFee,
        payments: feeRecord.payments,
        createdAt: feeRecord.createdAt,
        updatedAt: feeRecord.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the total fee for a fee record
 * @route   PUT /api/fees/:id
 */
exports.updateFeeRecord = async (req, res, next) => {
  try {
    const { totalFee } = req.body;

    if (totalFee === undefined || totalFee === null) {
      res.status(400);
      throw new Error('Total fee is required');
    }

    const feeRecord = await FeeRecord.findByIdAndUpdate(
      req.params.id,
      { totalFee },
      { new: true, runValidators: true }
    );

    if (!feeRecord) {
      res.status(404);
      throw new Error('Fee record not found');
    }

    res.status(200).json({
      success: true,
      message: 'Fee record updated successfully',
      data: feeRecord,
    });
  } catch (error) {
    next(error);
  }
};
