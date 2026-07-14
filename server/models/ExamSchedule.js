const mongoose = require('mongoose');

/**
 * ExamSchedule Model
 * Stores exam timetable for a class including subject-wise
 * dates, times, and maximum marks.
 */
const subjectScheduleSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
    },
    date: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
  },
  { _id: false }
);

const examScheduleSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    currentClass: {
      type: String,
      required: [true, 'Class is required'],
    },
    section: {
      type: String,
      default: '',
    },
    subjects: [subjectScheduleSchema],
    academicYear: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

examScheduleSchema.index(
  { currentClass: 1, section: 1, examName: 1 },
  { unique: true }
);

module.exports = mongoose.model('ExamSchedule', examScheduleSchema);
