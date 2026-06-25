const mongoose = require('mongoose');
const Student = require('../models/Student');
const Document = require('../models/Document');

/**
 * @desc    Create a new student
 * @route   POST /api/students
 */
exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students with search, filter, and pagination
 * @route   GET /api/students
 * @query   search, class, section, status, page, limit
 */
exports.getAllStudents = async (req, res, next) => {
  try {
    const {
      search,
      class: studentClass,
      section,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    // Build the filter object
    const filter = {};

    // Search by name, admission number, or father's mobile
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
        { fatherMobile: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by class
    if (studentClass) {
      filter.currentClass = studentClass;
    }

    // Filter by section
    if (section) {
      filter.section = section;
    }

    // Filter by status (default: show all)
    if (status) {
      filter.status = status;
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [students, total] = await Promise.all([
      Student.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Student.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the next auto-generated admission number (ADM-YYYY-XXXX)
 * @route   GET /api/students/next-admission
 */
exports.getNextAdmissionNumber = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `ADM-${currentYear}-`;

    // Count students admitted in the current year
    const count = await Student.countDocuments({
      admissionNumber: { $regex: `^${yearPrefix}` },
    });

    // Increment and format the next number (e.g., ADM-2026-0001)
    const nextNumber = String(count + 1).padStart(4, '0');
    const nextAdmissionNumber = `${yearPrefix}${nextNumber}`;

    res.status(200).json({
      success: true,
      data: { nextAdmissionNumber },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single student by ID (with populated documents)
 * @route   GET /api/students/:id
 */
exports.getStudentById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid student ID');
    }
    const student = await Student.findById(req.params.id).lean();

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Populate associated documents
    const documents = await Document.find({ studentId: student._id }).lean();

    res.status(200).json({
      success: true,
      data: { ...student, documents },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a student by ID
 * @route   PUT /api/students/:id
 */
exports.updateStudent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid student ID');
    }
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete a student (set status to inactive)
 * @route   DELETE /api/students/:id
 */
exports.deleteStudent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid student ID');
    }
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    res.status(200).json({
      success: true,
      message: 'Student deactivated successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};
