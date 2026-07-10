const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');

/**
 * @desc    Create or update a single timetable entry (upsert)
 * @route   POST /api/timetable
 */
exports.createOrUpdateEntry = async (req, res, next) => {
  try {
    const { class: cls, section, day, period, subject, teacherId, startTime, endTime } = req.body;

    // Validate required fields
    if (!cls || !section || !day || !period || !subject || !teacherId) {
      res.status(400);
      throw new Error('Class, section, day, period, subject, and teacherId are required');
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      res.status(400);
      throw new Error('Invalid teacher ID');
    }

    const entry = await Timetable.findOneAndUpdate(
      { class: cls, section, day, period },
      { class: cls, section, day, period, subject, teacherId, startTime, endTime },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Timetable entry saved successfully',
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk save timetable entries for a class+section
 *          Deletes all existing entries for that class+section, then inserts new ones
 * @route   POST /api/timetable/bulk
 * @body    { class, section, entries: [{ day, period, subject, teacherId, startTime, endTime }] }
 */
exports.bulkSaveTimetable = async (req, res, next) => {
  try {
    const { class: cls, section, entries } = req.body;

    // Validate required fields
    if (!cls || !section) {
      res.status(400);
      throw new Error('Class and section are required');
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      res.status(400);
      throw new Error('Entries array is required and must not be empty');
    }

    // Validate each entry has required fields and valid teacherId
    for (const entry of entries) {
      if (!entry.day || !entry.period || !entry.subject || !entry.teacherId) {
        res.status(400);
        throw new Error('Each entry must have day, period, subject, and teacherId');
      }
      if (!mongoose.Types.ObjectId.isValid(entry.teacherId)) {
        res.status(400);
        throw new Error(`Invalid teacher ID: ${entry.teacherId}`);
      }
    }

    // Delete existing entries for this class+section
    await Timetable.deleteMany({ class: cls, section });

    // Prepare entries with class and section
    const timetableEntries = entries.map((entry) => ({
      class: cls,
      section,
      day: entry.day,
      period: entry.period,
      subject: entry.subject,
      teacherId: entry.teacherId,
      startTime: entry.startTime,
      endTime: entry.endTime,
    }));

    // Insert all entries
    const saved = await Timetable.insertMany(timetableEntries);

    res.status(201).json({
      success: true,
      message: `${saved.length} timetable entries saved successfully`,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get timetable entries for a class+section, grouped by day
 * @route   GET /api/timetable
 * @query   class, section
 */
exports.getTimetableByClass = async (req, res, next) => {
  try {
    const { class: cls, section } = req.query;

    if (!cls || !section) {
      res.status(400);
      throw new Error('Class and section query params are required');
    }

    const entries = await Timetable.find({ class: cls, section })
      .populate('teacherId', 'firstName lastName teacherId')
      .sort({ period: 1 })
      .lean();

    // Group entries by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = {};
    for (const day of days) {
      const dayEntries = entries.filter((e) => e.day === day);
      if (dayEntries.length > 0) {
        grouped[day] = dayEntries;
      }
    }

    res.status(200).json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all timetable entries for a specific teacher
 * @route   GET /api/timetable/teacher/:teacherId
 */
exports.getTimetableByTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      res.status(400);
      throw new Error('Invalid teacher ID');
    }

    const entries = await Timetable.find({ teacherId })
      .populate('teacherId', 'firstName lastName teacherId')
      .sort({ day: 1, period: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a timetable entry by ID
 * @route   DELETE /api/timetable/:id
 */
exports.deleteEntry = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid timetable entry ID');
    }

    const entry = await Timetable.findByIdAndDelete(req.params.id);

    if (!entry) {
      res.status(404);
      throw new Error('Timetable entry not found');
    }

    res.status(200).json({
      success: true,
      message: 'Timetable entry deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
