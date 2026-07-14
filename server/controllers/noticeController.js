const Notice = require('../models/Notice');

/**
 * @desc    Create a new notice
 * @route   POST /api/notices
 */
exports.createNotice = async (req, res, next) => {
  try {
    const notice = await Notice.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all notices with optional filters
 * @route   GET /api/notices
 * @query   category, isActive
 */
exports.getNotices = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: notices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active notices (not expired)
 * @route   GET /api/notices/active
 */
exports.getActiveNotices = async (req, res, next) => {
  try {
    const now = new Date();

    const notices = await Notice.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: notices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single notice by ID
 * @route   GET /api/notices/:id
 */
exports.getNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      res.status(404);
      throw new Error('Notice not found');
    }

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a notice by ID
 * @route   PUT /api/notices/:id
 */
exports.updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!notice) {
      res.status(404);
      throw new Error('Notice not found');
    }

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notice by ID
 * @route   DELETE /api/notices/:id
 */
exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      res.status(404);
      throw new Error('Notice not found');
    }

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
