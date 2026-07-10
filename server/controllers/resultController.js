const mongoose = require('mongoose');
const Result = require('../models/Result');

/**
 * Helper: Calculate grade based on percentage
 * @param {number} percentage - The percentage to grade
 * @returns {string} The letter grade
 */
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'F';
};

/**
 * @desc    Create or update a student result (upsert by studentId+class+examType+academicYear)
 *          Auto-calculates per-subject grades, totals, percentage, and pass/fail
 * @route   POST /api/results
 */
exports.createResult = async (req, res, next) => {
  try {
    const { studentId, class: cls, section, examType, academicYear, subjects, remarks } = req.body;

    // Validate required fields
    if (!studentId || !cls || !examType || !academicYear) {
      res.status(400);
      throw new Error('studentId, class, examType, and academicYear are required');
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400);
      throw new Error('Invalid student ID');
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      res.status(400);
      throw new Error('Subjects array is required and must not be empty');
    }

    // Calculate per-subject grades and totals
    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;

    const gradedSubjects = subjects.map((sub) => {
      const maxMarks = sub.maxMarks || 100;
      const obtainedMarks = sub.obtainedMarks;
      const subjectPercentage = (obtainedMarks / maxMarks) * 100;
      const grade = calculateGrade(subjectPercentage);

      totalMaxMarks += maxMarks;
      totalObtainedMarks += obtainedMarks;

      return {
        subjectName: sub.subjectName,
        maxMarks,
        obtainedMarks,
        grade,
      };
    });

    const percentage = parseFloat(((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2));
    const result = percentage >= 35 ? 'Pass' : 'Fail';

    // Upsert based on studentId+class+examType+academicYear
    const savedResult = await Result.findOneAndUpdate(
      { studentId, class: cls, examType, academicYear },
      {
        studentId,
        class: cls,
        section,
        examType,
        academicYear,
        subjects: gradedSubjects,
        totalMaxMarks,
        totalObtainedMarks,
        percentage,
        result,
        remarks,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Result saved successfully',
      data: savedResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all results for a student, sorted by academicYear descending
 * @route   GET /api/results/student/:studentId
 */
exports.getResultsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400);
      throw new Error('Invalid student ID');
    }

    const results = await Result.find({ studentId })
      .populate('studentId', 'firstName lastName admissionNumber currentClass section')
      .sort({ academicYear: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get results by class, section, exam type, and academic year
 * @route   GET /api/results
 * @query   class, section, examType, academicYear
 */
exports.getResultsByClass = async (req, res, next) => {
  try {
    const { class: cls, section, examType, academicYear } = req.query;

    // Build filter
    const filter = {};
    if (cls) filter.class = cls;
    if (section) filter.section = section;
    if (examType) filter.examType = examType;
    if (academicYear) filter.academicYear = academicYear;

    const results = await Result.find(filter)
      .populate('studentId', 'firstName lastName admissionNumber currentClass section')
      .sort({ percentage: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a result by ID, recalculate grades and totals
 * @route   PUT /api/results/:id
 */
exports.updateResult = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid result ID');
    }

    const existingResult = await Result.findById(req.params.id);

    if (!existingResult) {
      res.status(404);
      throw new Error('Result not found');
    }

    // Merge updates
    const updatedData = { ...existingResult.toObject(), ...req.body };

    // Recalculate grades and totals if subjects are provided
    if (updatedData.subjects && updatedData.subjects.length > 0) {
      let totalMaxMarks = 0;
      let totalObtainedMarks = 0;

      updatedData.subjects = updatedData.subjects.map((sub) => {
        const maxMarks = sub.maxMarks || 100;
        const obtainedMarks = sub.obtainedMarks;
        const subjectPercentage = (obtainedMarks / maxMarks) * 100;
        const grade = calculateGrade(subjectPercentage);

        totalMaxMarks += maxMarks;
        totalObtainedMarks += obtainedMarks;

        return {
          subjectName: sub.subjectName,
          maxMarks,
          obtainedMarks,
          grade,
        };
      });

      updatedData.totalMaxMarks = totalMaxMarks;
      updatedData.totalObtainedMarks = totalObtainedMarks;
      updatedData.percentage = parseFloat(
        ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2)
      );
      updatedData.result = updatedData.percentage >= 35 ? 'Pass' : 'Fail';
    }

    const result = await Result.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Result updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a result by ID
 * @route   DELETE /api/results/:id
 */
exports.deleteResult = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid result ID');
    }

    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      res.status(404);
      throw new Error('Result not found');
    }

    res.status(200).json({
      success: true,
      message: 'Result deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
