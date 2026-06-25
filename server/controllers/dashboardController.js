const Student = require('../models/Student');
const FeeRecord = require('../models/FeeRecord');
const Payment = require('../models/Payment');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @returns totalStudents, newAdmissionsThisMonth, totalPendingFees,
 *          activeClasses, recentAdmissions, pendingFeeAlerts
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // --- Total active students ---
    const totalStudents = await Student.countDocuments({ status: 'active' });

    // --- New admissions this month ---
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newAdmissionsThisMonth = await Student.countDocuments({
      admissionDate: { $gte: startOfMonth },
      status: 'active',
    });

    // --- Total pending fees (aggregate across all fee records) ---
    const feeAggregation = await FeeRecord.aggregate([
      {
        // Lookup all payments for each fee record
        $lookup: {
          from: 'payments',
          localField: 'payments',
          foreignField: '_id',
          as: 'paymentDetails',
        },
      },
      {
        // Calculate total paid per fee record
        $addFields: {
          totalPaid: { $sum: '$paymentDetails.amount' },
          pendingFee: {
            $subtract: ['$totalFee', { $sum: '$paymentDetails.amount' }],
          },
        },
      },
      {
        // Sum all pending fees across every record
        $group: {
          _id: null,
          totalPendingFees: { $sum: '$pendingFee' },
        },
      },
    ]);
    const totalPendingFees =
      feeAggregation.length > 0 ? feeAggregation[0].totalPendingFees : 0;

    // --- Active classes (distinct classes among active students) ---
    const activeClasses = await Student.distinct('currentClass', {
      status: 'active',
    });

    // --- Recent admissions (last 5 students) ---
    const recentAdmissions = await Student.find({ status: 'active' })
      .sort({ admissionDate: -1 })
      .limit(5)
      .select('firstName lastName admissionNumber currentClass admissionDate photo')
      .lean();

    // --- Pending fee alerts (top 5 students with highest pending fees) ---
    const pendingFeeAlerts = await FeeRecord.aggregate([
      {
        $lookup: {
          from: 'payments',
          localField: 'payments',
          foreignField: '_id',
          as: 'paymentDetails',
        },
      },
      {
        $addFields: {
          totalPaid: { $sum: '$paymentDetails.amount' },
          pendingFee: {
            $subtract: ['$totalFee', { $sum: '$paymentDetails.amount' }],
          },
        },
      },
      {
        // Only include records with a positive pending balance
        $match: { pendingFee: { $gt: 0 } },
      },
      {
        $sort: { pendingFee: -1 },
      },
      {
        $limit: 5,
      },
      {
        // Lookup the student details
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: '$student',
      },
      {
        $project: {
          _id: 1,
          studentId: 1,
          totalFee: 1,
          totalPaid: 1,
          pendingFee: 1,
          studentName: {
            $concat: ['$student.firstName', ' ', '$student.lastName'],
          },
          admissionNumber: '$student.admissionNumber',
          currentClass: '$student.currentClass',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        newAdmissionsThisMonth,
        totalPendingFees,
        activeClasses,
        recentAdmissions,
        pendingFeeAlerts,
      },
    });
  } catch (error) {
    next(error);
  }
};
