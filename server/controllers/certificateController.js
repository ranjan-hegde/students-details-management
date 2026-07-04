const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const { generatePDF } = require('../utils/pdfGenerator');

/**
 * @desc    Generate a bonafide certificate for a student
 * @route   POST /api/certificates/bonafide/:studentId
 */
exports.generateBonafide = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Build the bonafide certificate data from student fields
    const bonafideData = {
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      currentClass: student.currentClass,
      section: student.section,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      fatherName: student.fatherName,
      motherName: student.motherName,
      address: student.address,
      city: student.city,
      state: student.state,
      pinCode: student.pinCode,
      nationality: student.nationality,
      category: student.category,
      religion: student.religion,
      caste: student.caste,
      admissionDate: student.admissionDate,
      // Allow any additional custom data passed in the request body
      ...req.body,
    };

    const SchoolSetting = require('../models/SchoolSetting');
    let settings = await SchoolSetting.findOne() || {};

    // Generate simple HTML for Bonafide
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
        <h2 style="margin-bottom: 5px; text-transform: uppercase;">${settings.schoolName || 'EduManage School'}</h2>
        <h4 style="margin-top: 0; color: #555; font-weight: normal;">${settings.schoolAddress || '123 Education Lane, Learning City'}</h4>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ccc;" />
        <h3 style="text-decoration: underline; margin-bottom: 30px;">BONAFIDE CERTIFICATE</h3>
        <p style="line-height: 1.8; font-size: 16px; text-align: justify;">This is to certify that <b>${bonafideData.studentName}</b>, 
        son/daughter of <b>${bonafideData.fatherName}</b> and <b>${bonafideData.motherName}</b>, 
        is a bonafide student of our school studying in Class <b>${bonafideData.currentClass}</b>.</p>
        <p style="text-align: left; font-size: 16px;">Admission Number: <b>${bonafideData.admissionNumber}</b></p>
        <br><br><br><br>
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <p style="text-align: left;">Date: ${new Date().toLocaleDateString('en-GB')}</p>
          <p style="text-align: right;">Principal Signature</p>
        </div>
      </div>
    `;
    
    const downloadUrl = await generatePDF(htmlContent, 'Bonafide');

    const certificate = await Certificate.create({
      studentId,
      type: 'bonafide',
      data: bonafideData,
      downloadUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Bonafide certificate generated successfully',
      data: certificate,
      downloadUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate a Transfer Certificate (TC) for a student
 * @route   POST /api/certificates/tc/:studentId
 * @body    Editable TC fields (rest auto-filled from student record)
 */
exports.generateTC = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Auto-generate TC number: TC-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const tcPrefix = `TC-${currentYear}-`;
    const tcCount = await Certificate.countDocuments({
      tcNumber: { $regex: `^${tcPrefix}` },
    });
    const nextNumber = String(tcCount + 1).padStart(4, '0');
    const tcNumber = `${tcPrefix}${nextNumber}`;

    const SchoolSetting = require('../models/SchoolSetting');
    let settings = await SchoolSetting.findOne() || {};

    // Build TC data — auto-fill from student, override with editable body fields
    const tcData = {
      // Auto-filled fields from the student record
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      admissionDate: student.admissionDate,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      nationality: student.nationality,
      religion: student.religion,
      caste: student.caste,
      subCaste: student.subCaste,
      category: student.category,
      aadhaarNumber: student.aadhaarNumber,
      fatherName: student.fatherName,
      motherName: student.motherName,
      address: student.address,
      city: student.city,
      state: student.state,
      pinCode: student.pinCode,
      place: student.place,
      taluka: student.taluka,
      district: student.district,
      currentClass: student.currentClass,
      section: student.section,
      rollNumber: student.rollNumber,
      bloodGroup: student.bloodGroup,
      previousSchool: student.previousSchool,
      tcNumber,
      // Editable fields (can be overridden by the request body)
      dateOfLeaving: null,
      classAtTimeOfLeaving: student.currentClass,
      reasonForLeaving: null,
      conduct: 'Good',
      result: null,
      totalWorkingDays: null,
      totalPresentDays: null,
      remarks: null,
      // Override auto-filled data with any fields from the request body
      ...req.body,
    };

    const generateTCTemplate = require('../templates/tcTemplate');
    const htmlContent = generateTCTemplate(tcData, settings);
    
    const downloadUrl = await generatePDF(htmlContent, 'TC');

    const certificate = await Certificate.create({
      studentId,
      type: 'transfer_certificate',
      tcNumber,
      data: tcData,
      downloadUrl,
    });

    // Optionally mark student as transferred
    if (req.body.markAsTransferred) {
      await Student.findByIdAndUpdate(studentId, { status: 'transferred' });
    }

    res.status(201).json({
      success: true,
      message: 'Transfer Certificate generated successfully',
      data: certificate,
      downloadUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all certificates for a student
 * @route   GET /api/certificates/:studentId
 */
exports.getStudentCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({
      studentId: req.params.studentId,
    }).sort({ generatedAt: -1 });

    res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};
