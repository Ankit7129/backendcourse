const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document'); // Import the Document model
const jwt = require('jsonwebtoken');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for uploaded documents
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

const upload = multer({ storage: storage });

// Token authentication middleware

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer token

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Add user data to request object
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// @route POST /api/documents/upload
// @desc Upload a document for the student
router.post('/upload', upload.single('document'), async (req, res) => {
  // Check if the file is uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a document.' });
  }

  // Get studentId and studentName from the request body
  const { studentId, studentName, documentType, aadhaarNo, digilockerId } = req.body;

  // Validate studentId and studentName
  if (!studentId || !studentName) {
    return res.status(400).json({ 
      error: 'Both studentId and studentName are required.' 
    });
  }

  // Check if either Aadhaar number or DigiLocker ID is provided
  if (!aadhaarNo && !digilockerId) {
    return res.status(400).json({ error: 'Either Aadhaar number or DigiLocker ID is required.' });
  }

  try {
    // Create a new document instance
    const newDocument = new Document({
      studentId,
      studentName,
      documentType,
      documentUrl: req.file.path, // Save file path
      aadhaarNo,
      digilockerId,
    });

    // Save document to the database
    const savedDocument = await newDocument.save();
    res.status(200).json({ message: 'Document uploaded successfully', document: savedDocument });
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Error uploading document. Please try again.', details: error.message });
  }
});

// @route GET /api/documents
// @desc Get documents for a specific student
router.get('/', authenticateToken, async (req, res) => {
  const { studentId } = req.query; // Get studentId from query parameters

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  try {
    // Find documents by studentId
    const documents = await Document.find({ studentId: studentId });
    res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Error fetching documents. Please try again.', details: error.message });
  }
});

// Export the router
module.exports = router;
