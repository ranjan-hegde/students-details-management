const mongoose = require('mongoose');

/**
 * Notice Model
 * Stores school notices and announcements with category, priority,
 * target classes, and optional expiration.
 */
const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      enum: ['General', 'Exam', 'Holiday', 'Event', 'Sports'],
      default: 'General',
    },
    targetClasses: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ['Normal', 'Important', 'Urgent'],
      default: 'Normal',
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

noticeSchema.index({ isActive: 1 });
noticeSchema.index({ category: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
