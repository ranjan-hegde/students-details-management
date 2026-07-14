const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'HalfDay'], required: true },
});

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: [true, 'Date is required'] },
  currentClass: { type: String, required: [true, 'Class is required'] },
  section: { type: String, default: '' },
  records: [attendanceRecordSchema],
}, { timestamps: true });

attendanceSchema.index({ date: 1, currentClass: 1, section: 1 }, { unique: true });
attendanceSchema.index({ 'records.studentId': 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
