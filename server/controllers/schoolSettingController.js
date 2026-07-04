const SchoolSetting = require('../models/SchoolSetting');

// @desc    Get School Settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await SchoolSetting.findOne();
    if (!settings) {
      settings = await SchoolSetting.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update School Settings
// @route   PUT /api/settings
// @access  Public
exports.updateSettings = async (req, res, next) => {
  try {
    const { schoolName, schoolAddress, schoolStrength, defaultFee, yearlyResults } = req.body;
    let settings = await SchoolSetting.findOne();
    
    if (!settings) {
      settings = await SchoolSetting.create(req.body);
    } else {
      settings.schoolName = schoolName || settings.schoolName;
      settings.schoolAddress = schoolAddress !== undefined ? schoolAddress : settings.schoolAddress;
      settings.schoolStrength = schoolStrength || settings.schoolStrength;
      settings.defaultFee = defaultFee !== undefined ? defaultFee : settings.defaultFee;
      if (yearlyResults) {
        settings.yearlyResults = yearlyResults;
      }
      await settings.save();
    }
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};
