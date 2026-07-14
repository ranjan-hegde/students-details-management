const mongoose = require('mongoose');

/**
 * Event Model
 * Stores school events for the calendar including exams, holidays,
 * sports days, cultural events, and meetings.
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
    },
    type: {
      type: String,
      enum: ['Exam', 'Holiday', 'Sports', 'Cultural', 'Meeting', 'Other'],
      default: 'Other',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ eventDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
