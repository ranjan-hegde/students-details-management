const ExamSchedule = require('../models/ExamSchedule');

/**
 * @desc    Create a new exam schedule
 * @route   POST /api/exam-schedules
 */
exports.createExamSchedule = async (req, res, next) => {
  try {
    const examSchedule = await ExamSchedule.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Exam schedule created successfully',
      data: examSchedule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get exam schedules with optional class/section filter
 * @route   GET /api/exam-schedules
 * @query   currentClass, section
 */
exports.getExamSchedules = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.currentClass) filter.currentClass = req.query.currentClass;
    if (req.query.section) filter.section = req.query.section;

    const examSchedules = await ExamSchedule.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: examSchedules,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single exam schedule by ID
 * @route   GET /api/exam-schedules/:id
 */
exports.getExamSchedule = async (req, res, next) => {
  try {
    const examSchedule = await ExamSchedule.findById(req.params.id);

    if (!examSchedule) {
      res.status(404);
      throw new Error('Exam schedule not found');
    }

    res.status(200).json({
      success: true,
      data: examSchedule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an exam schedule by ID
 * @route   PUT /api/exam-schedules/:id
 */
exports.updateExamSchedule = async (req, res, next) => {
  try {
    const examSchedule = await ExamSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!examSchedule) {
      res.status(404);
      throw new Error('Exam schedule not found');
    }

    res.status(200).json({
      success: true,
      message: 'Exam schedule updated successfully',
      data: examSchedule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an exam schedule by ID
 * @route   DELETE /api/exam-schedules/:id
 */
exports.deleteExamSchedule = async (req, res, next) => {
  try {
    const examSchedule = await ExamSchedule.findByIdAndDelete(req.params.id);

    if (!examSchedule) {
      res.status(404);
      throw new Error('Exam schedule not found');
    }

    res.status(200).json({
      success: true,
      message: 'Exam schedule deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
