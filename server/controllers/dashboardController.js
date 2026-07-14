const Student = require('../models/Student');
const FeeRecord = require('../models/FeeRecord');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Notice = require('../models/Notice');

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

    // --- School Settings (for default fee) ---
    const SchoolSetting = require('../models/SchoolSetting');
    const settings = await SchoolSetting.findOne();
    const defaultFee = settings?.defaultFee || 0;

    // --- Total Expected Fees ---
    const totalExpectedFees = totalStudents * defaultFee;

    // --- Total Paid Fees (sum of all payments) ---
    const paymentAgg = await Payment.aggregate([
      { $group: { _id: null, totalPaid: { $sum: '$amount' } } },
    ]);
    const totalPaidFees = paymentAgg.length > 0 ? paymentAgg[0].totalPaid : 0;

    // --- Total Pending Fees ---
    const totalPendingFees = totalExpectedFees - totalPaidFees;

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

    // --- Recent Payments (last 5 payments with student details) ---
    const recentPayments = await Payment.aggregate([
      { $sort: { paymentDate: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $project: {
          _id: 1,
          amount: 1,
          paymentDate: 1,
          paymentMode: 1,
          receiptNumber: 1,
          studentId: 1,
          studentName: {
            $concat: ['$student.firstName', ' ', '$student.lastName'],
          },
          currentClass: '$student.currentClass',
          section: '$student.section',
        },
      },
    ]);

    // --- Today's Attendance Summary ---
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const todayAttendanceDocs = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd },
    }).lean();

    let totalRecords = 0;
    let presentCount = 0;
    let absentCount = 0;
    for (const doc of todayAttendanceDocs) {
      for (const record of doc.records) {
        totalRecords++;
        if (record.status === 'Present') presentCount++;
        else if (record.status === 'Absent') absentCount++;
      }
    }
    const todayAttendance = { totalRecords, presentCount, absentCount };

    // --- Upcoming Events (next 5) ---
    const upcomingEvents = await Event.find({ eventDate: { $gte: todayStart } })
      .sort({ eventDate: 1 })
      .limit(5)
      .lean();

    // --- Active Notices Count ---
    const activeNoticesCount = await Notice.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        newAdmissionsThisMonth,
        totalExpectedFees,
        totalPaidFees,
        totalPendingFees,
        activeClasses,
        recentAdmissions,
        pendingFeeAlerts,
        recentPayments,
        todayAttendance,
        upcomingEvents,
        activeNoticesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
