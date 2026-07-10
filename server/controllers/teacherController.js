const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');

/**
 * @desc    Create a new teacher with auto-generated teacherId (TCH-YYYY-XXXX)
 * @route   POST /api/teachers
 */
exports.createTeacher = async (req, res, next) => {
  try {
    const { firstName, lastName, mobile, gender } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !mobile || !gender) {
      res.status(400);
      throw new Error('First name, last name, mobile, and gender are required');
    }

    // Auto-generate teacherId as TCH-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const yearPrefix = `TCH-${currentYear}-`;

    const count = await Teacher.countDocuments({
      teacherId: { $regex: `^${yearPrefix}` },
    });

    const nextNumber = String(count + 1).padStart(4, '0');
    const teacherId = `${yearPrefix}${nextNumber}`;

    const teacher = await Teacher.create({
      ...req.body,
      teacherId,
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all teachers with search and pagination
 * @route   GET /api/teachers
 * @query   search, page, limit
 */
exports.getAllTeachers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    // Build the filter object
    const filter = {};

    // Search by firstName, lastName, or subject
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { subjects: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Teacher.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: teachers,
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
 * @desc    Get the next auto-generated teacher ID (TCH-YYYY-XXXX)
 * @route   GET /api/teachers/next-id
 */
exports.getNextTeacherId = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `TCH-${currentYear}-`;

    // Count teachers registered in the current year
    const count = await Teacher.countDocuments({
      teacherId: { $regex: `^${yearPrefix}` },
    });

    // Increment and format the next number (e.g., TCH-2026-0001)
    const nextNumber = String(count + 1).padStart(4, '0');
    const nextTeacherId = `${yearPrefix}${nextNumber}`;

    res.status(200).json({
      success: true,
      data: { nextTeacherId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single teacher by ID
 * @route   GET /api/teachers/:id
 */
exports.getTeacherById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid teacher ID');
    }

    const teacher = await Teacher.findById(req.params.id).lean();

    if (!teacher) {
      res.status(404);
      throw new Error('Teacher not found');
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a teacher by ID
 * @route   PUT /api/teachers/:id
 */
exports.updateTeacher = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid teacher ID');
    }

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!teacher) {
      res.status(404);
      throw new Error('Teacher not found');
    }

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete a teacher (set status to inactive)
 * @route   DELETE /api/teachers/:id
 */
exports.deleteTeacher = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid teacher ID');
    }

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!teacher) {
      res.status(404);
      throw new Error('Teacher not found');
    }

    res.status(200).json({
      success: true,
      message: 'Teacher deactivated successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};
