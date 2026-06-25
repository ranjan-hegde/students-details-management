const Document = require('../models/Document');
const Student = require('../models/Student');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Upload one or more documents for a student
 * @route   POST /api/documents/upload/:studentId
 */
exports.uploadDocuments = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Verify the student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Check that files were uploaded
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('No files uploaded');
    }

    // Get the document type from the request body (applies to all files in this batch)
    const { type } = req.body;
    if (!type) {
      res.status(400);
      throw new Error('Document type is required');
    }

    // Create a Document record for each uploaded file
    const documents = await Promise.all(
      req.files.map((file) =>
        Document.create({
          studentId,
          type,
          fileName: file.originalname,
          filePath: file.path,
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `${documents.length} document(s) uploaded successfully`,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all documents for a student
 * @route   GET /api/documents/:studentId
 */
exports.getStudentDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({
      studentId: req.params.studentId,
    }).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a document by ID and remove the file from disk
 * @route   DELETE /api/documents/:id
 */
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404);
      throw new Error('Document not found');
    }

    // Remove the physical file from disk
    const absolutePath = path.resolve(document.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // Remove the document record from the database
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
