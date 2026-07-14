const Attendance = require('../models/Attendance');
const FeeRecord = require('../models/FeeRecord');
const Payment = require('../models/Payment');
const Result = require('../models/Result');
const Student = require('../models/Student');

/**
 * @desc    Get attendance report — per-student summary for a class/month,
 *          or class-wise summary if no class is specified
 * @route   GET /api/reports/attendance
 * @query   month (YYYY-MM), currentClass, section
 */
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { month, currentClass, section } = req.query;

    if (!month) {
      res.status(400);
      throw new Error('month query param (YYYY-MM) is required');
    }

    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

    const matchStage = {
      date: { $gte: startDate, $lte: endDate },
    };
    if (currentClass) matchStage.currentClass = currentClass;
    if (section) matchStage.section = section;

    if (currentClass) {
      // Per-student summary
      const report = await Attendance.aggregate([
        { $match: matchStage },
        { $unwind: '$records' },
        {
          $group: {
            _id: '$records.studentId',
            totalDays: { $sum: 1 },
            presentDays: {
              $sum: { $cond: [{ $eq: ['$records.status', 'Present'] }, 1, 0] },
            },
            absentDays: {
              $sum: { $cond: [{ $eq: ['$records.status', 'Absent'] }, 1, 0] },
            },
            lateDays: {
              $sum: { $cond: [{ $eq: ['$records.status', 'Late'] }, 1, 0] },
            },
            halfDays: {
              $sum: { $cond: [{ $eq: ['$records.status', 'HalfDay'] }, 1, 0] },
            },
          },
        },
        {
          $addFields: {
            percentage: {
              $round: [
                { $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] },
                2,
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'students',
            localField: '_id',
            foreignField: '_id',
            as: 'student',
          },
        },
        { $unwind: '$student' },
        {
          $project: {
            _id: 1,
            studentName: {
              $concat: ['$student.firstName', ' ', '$student.lastName'],
            },
            rollNumber: '$student.rollNumber',
            totalDays: 1,
            presentDays: 1,
            absentDays: 1,
            lateDays: 1,
            halfDays: 1,
            percentage: 1,
          },
        },
        { $sort: { rollNumber: 1 } },
      ]);

      res.status(200).json({ success: true, data: report });
    } else {
      // Class-wise summary
      const report = await Attendance.aggregate([
        { $match: matchStage },
        { $unwind: '$records' },
        {
          $group: {
            _id: { currentClass: '$currentClass', section: '$section' },
            totalRecords: { $sum: 1 },
            presentCount: {
              $sum: { $cond: [{ $eq: ['$records.status', 'Present'] }, 1, 0] },
            },
            absentCount: {
              $sum: { $cond: [{ $eq: ['$records.status', 'Absent'] }, 1, 0] },
            },
            lateCount: {
              $sum: { $cond: [{ $eq: ['$records.status', 'Late'] }, 1, 0] },
            },
            halfDayCount: {
              $sum: { $cond: [{ $eq: ['$records.status', 'HalfDay'] }, 1, 0] },
            },
          },
        },
        {
          $addFields: {
            attendancePercentage: {
              $round: [
                { $multiply: [{ $divide: ['$presentCount', '$totalRecords'] }, 100] },
                2,
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            currentClass: '$_id.currentClass',
            section: '$_id.section',
            totalRecords: 1,
            presentCount: 1,
            absentCount: 1,
            lateCount: 1,
            halfDayCount: 1,
            attendancePercentage: 1,
          },
        },
        { $sort: { currentClass: 1, section: 1 } },
      ]);

      res.status(200).json({ success: true, data: report });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get fee collection report — per-class summary
 * @route   GET /api/reports/fees
 * @query   currentClass
 */
exports.getFeeReport = async (req, res, next) => {
  try {
    const { currentClass } = req.query;

    const studentMatch = {};
    if (currentClass) studentMatch.currentClass = currentClass;

    const report = await Student.aggregate([
      { $match: { status: 'active', ...studentMatch } },
      {
        $lookup: {
          from: 'feerecords',
          localField: '_id',
          foreignField: 'studentId',
          as: 'feeRecord',
        },
      },
      { $unwind: { path: '$feeRecord', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'studentId',
          as: 'payments',
        },
      },
      {
        $group: {
          _id: '$currentClass',
          totalStudents: { $sum: 1 },
          totalExpected: { $sum: { $ifNull: ['$feeRecord.totalFee', 0] } },
          totalPaid: { $sum: { $sum: '$payments.amount' } },
        },
      },
      {
        $addFields: {
          totalPending: { $subtract: ['$totalExpected', '$totalPaid'] },
          collectionPercentage: {
            $cond: [
              { $eq: ['$totalExpected', 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ['$totalPaid', '$totalExpected'] }, 100] },
                  2,
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          currentClass: '$_id',
          totalStudents: 1,
          totalExpected: 1,
          totalPaid: 1,
          totalPending: 1,
          collectionPercentage: 1,
        },
      },
      { $sort: { currentClass: 1 } },
    ]);

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get result/exam report — class stats including averages, pass/fail, subject-wise
 * @route   GET /api/reports/results
 * @query   currentClass, section, examType
 */
exports.getResultReport = async (req, res, next) => {
  try {
    const { currentClass, section, examType } = req.query;

    const filter = {};
    if (currentClass) filter.class = currentClass;
    if (section) filter.section = section;
    if (examType) filter.examType = examType;

    const results = await Result.find(filter)
      .populate('studentId', 'firstName lastName rollNumber')
      .lean();

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalStudents: 0,
          classAverage: 0,
          highestMarks: 0,
          lowestMarks: 0,
          passCount: 0,
          failCount: 0,
          subjectAverages: [],
        },
      });
    }

    const percentages = results.map((r) => r.percentage);
    const classAverage = parseFloat(
      (percentages.reduce((sum, p) => sum + p, 0) / percentages.length).toFixed(2)
    );
    const highestMarks = Math.max(...percentages);
    const lowestMarks = Math.min(...percentages);
    const passCount = results.filter((r) => r.result === 'Pass').length;
    const failCount = results.filter((r) => r.result === 'Fail').length;

    // Subject-wise averages
    const subjectMap = {};
    for (const result of results) {
      for (const sub of result.subjects) {
        if (!subjectMap[sub.subjectName]) {
          subjectMap[sub.subjectName] = { totalObtained: 0, totalMax: 0, count: 0 };
        }
        subjectMap[sub.subjectName].totalObtained += sub.obtainedMarks;
        subjectMap[sub.subjectName].totalMax += sub.maxMarks;
        subjectMap[sub.subjectName].count += 1;
      }
    }

    const subjectAverages = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      averageMarks: parseFloat((data.totalObtained / data.count).toFixed(2)),
      averagePercentage: parseFloat(
        ((data.totalObtained / data.totalMax) * 100).toFixed(2)
      ),
    }));

    res.status(200).json({
      success: true,
      data: {
        totalStudents: results.length,
        classAverage,
        highestMarks,
        lowestMarks,
        passCount,
        failCount,
        subjectAverages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student strength report — count per class and section
 * @route   GET /api/reports/strength
 */
exports.getStudentStrengthReport = async (req, res, next) => {
  try {
    const report = await Student.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: { currentClass: '$currentClass', section: '$section' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          currentClass: '$_id.currentClass',
          section: '$_id.section',
          count: 1,
        },
      },
      { $sort: { currentClass: 1, section: 1 } },
    ]);

    // Also calculate totals per class
    const classTotals = {};
    let grandTotal = 0;
    for (const entry of report) {
      const cls = entry.currentClass;
      if (!classTotals[cls]) classTotals[cls] = 0;
      classTotals[cls] += entry.count;
      grandTotal += entry.count;
    }

    res.status(200).json({
      success: true,
      data: {
        details: report,
        classTotals,
        grandTotal,
      },
    });
  } catch (error) {
    next(error);
  }
};
