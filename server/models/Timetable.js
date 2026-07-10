const mongoose = require('mongoose');

/**
 * Timetable Model
 * Stores individual timetable entries mapping teachers to
 * class/section/day/period slots with subject information.
 */
const timetableSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID is required'],
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: [true, 'Day is required'],
    },
    period: {
      type: Number,
      required: [true, 'Period is required'],
      min: 1,
      max: 8,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure no two entries for the same class+section+day+period
timetableSchema.index({ class: 1, section: 1, day: 1, period: 1 }, { unique: true });
// Also index by teacher for teacher schedule lookup
timetableSchema.index({ teacherId: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
