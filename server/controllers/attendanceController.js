const Attendance = require('../models/Attendance');

/**
 * @desc    Mark or update attendance for a class on a given date
 * @route   POST /api/attendance
 */
exports.markAttendance = async (req, res, next) => {
  try {
    const { date, currentClass, section, records } = req.body;

    if (!date || !currentClass || !records || !Array.isArray(records)) {
      res.status(400);
      throw new Error('date, currentClass, and records array are required');
    }

    const attendance = await Attendance.findOneAndUpdate(
      { date: new Date(date), currentClass, section: section || '' },
      {
        date: new Date(date),
        currentClass,
        section: section || '',
        records,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Attendance saved successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance for a specific date, class, and section
 * @route   GET /api/attendance
 * @query   date, currentClass, section
 */
exports.getAttendanceByDate = async (req, res, next) => {
  try {
    const { date, currentClass, section } = req.query;

    if (!date || !currentClass) {
      res.status(400);
      throw new Error('date and currentClass query params are required');
    }

    const attendance = await Attendance.findOne({
      date: new Date(date),
      currentClass,
      section: section || '',
    }).populate('records.studentId', 'firstName lastName rollNumber');

    res.status(200).json({
      success: true,
      data: attendance || { date, currentClass, section: section || '', records: [] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance records for a specific student in a given month
 * @route   GET /api/attendance/student/:studentId
 * @query   month (YYYY-MM)
 */
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query;

    if (!month) {
      res.status(400);
      throw new Error('month query param (YYYY-MM) is required');
    }

    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

    const attendanceDocs = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
      'records.studentId': studentId,
    }).lean();

    // Extract this student's status from each attendance doc
    const results = [];
    for (const doc of attendanceDocs) {
      const record = doc.records.find(
        (r) => r.studentId.toString() === studentId
      );
      if (record) {
        results.push({ date: doc.date, status: record.status });
      }
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get class attendance report for a given month
 * @route   GET /api/attendance/report
 * @query   currentClass, section, month (YYYY-MM)
 */
exports.getClassAttendanceReport = async (req, res, next) => {
  try {
    const { currentClass, section, month } = req.query;

    if (!currentClass || !month) {
      res.status(400);
      throw new Error('currentClass and month query params are required');
    }

    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

    const matchStage = {
      date: { $gte: startDate, $lte: endDate },
      currentClass,
    };
    if (section) matchStage.section = section;

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

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update specific records in an attendance document
 * @route   PUT /api/attendance/:id
 */
exports.updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!attendance) {
      res.status(404);
      throw new Error('Attendance record not found');
    }

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};
