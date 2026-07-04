const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  year: { type: String, required: true },
  passPercentage: { type: Number, required: true }
});

const schoolSettingSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: [true, 'Please add a school name'],
    default: 'EduManage School'
  },
  schoolAddress: {
    type: String,
    default: '123 Education Lane, Learning City'
  },
  schoolStrength: {
    type: Number,
    default: 1000
  },
  defaultFee: {
    type: Number,
    default: 15000
  },
  yearlyResults: [resultSchema]
}, { timestamps: true });

module.exports = mongoose.model('SchoolSetting', schoolSettingSchema);
