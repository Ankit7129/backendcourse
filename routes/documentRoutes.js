const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document'); // Import the Document model
const jwt = require('jsonwebtoken');
const { bucket } = require('../config/firebaseConfig'); // Import Firebase Admin config

// Multer setup for file uploads (in memory storage)
const storage = multer.memoryStorage();
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

// Allowed MIME types for file uploads
const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png']; // Add other allowed types as needed

// @route POST /api/documents/upload
// @desc Upload a document for the student to Firebase Storage and save metadata to MongoDB
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  // Check if the file is uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a document.' });
  }

  // Validate file type
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type. Only PDF and images are allowed.' });
  }

  // Get documentType, aadhaarNumber, and digilockerId from the request body
  const { documentType, aadharNumber, digilockerId } = req.body;

  // Validate aadhaarNumber
  if (!aadharNumber || !/^\d{16}$/.test(aadharNumber)) {
    return res.status(400).json({ error: 'Aadhar number is required and must be a 16-digit number.' });
  }

  // Check if either Aadhar number or DigiLocker ID is provided
  if (!aadharNumber && !digilockerId) {
    return res.status(400).json({ error: 'Either Aadhaar number or DigiLocker ID is required.' });
  }

  try {
    // Define the file path in Firebase Storage using aadhaarNumber
    const firebaseFilePath = `documents/${aadharNumber}/${Date.now()}-${req.file.originalname}`;

    // Upload file to Firebase Storage
    const blob = bucket.file(firebaseFilePath);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Handle stream finish and error events
    blobStream.on('error', (err) => {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Error uploading document to Firebase Storage.' });
    });

    blobStream.on('finish', async () => {
      try {
        // Get the download URL after upload is complete
        const downloadURL = await blob.getSignedUrl({
          action: 'read',
          expires: '03-09-2491', // Set far future expiration date
        });

        // Save document metadata to MongoDB
        const newDocument = new Document({
          aadharNumber,
          documentUrl: downloadURL[0], // Save Firebase download URL
          documentType,
          digilockerId,
        });

        const savedDocument = await newDocument.save();
        res.status(200).json({
          message: 'Document uploaded successfully and metadata saved.',
          document: savedDocument,
        });
      } catch (error) {
        console.error('Error saving document metadata:', error);
        res.status(500).json({ error: 'Error saving document metadata. Please try again.', details: error.message });
      }
    });

    // Start the stream upload
    blobStream.end(req.file.buffer);

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Error uploading document. Please try again.', details: error.message });
  }
});

// @route GET /api/documents
// @desc Get documents for a specific Aadhaar number or student ID
router.get('/', authenticateToken, async (req, res) => {
  const { aadharNumber } = req.query; // Get aadhaarNumber from query parameters

  // Validate aadharNumber
  if (!aadharNumber) {
    return res.status(400).json({ error: 'Aadhaar number is required.' });
  }

  // Validate that the Aadhaar number is a 16-digit number
  if (!/^\d{16}$/.test(aadharNumber)) {
    return res.status(400).json({ error: 'Aadhaar number must be a 16-digit number.' });
  }

  try {
    // Find documents by the provided aadharNumber
    const documents = await Document.find({ aadharNumber: aadharNumber });

    // Check if any documents were found
    if (documents.length === 0) {
      return res.status(404).json({ message: 'No documents found for the provided Aadhaar number.' });
    }

    // Return the found documents
    res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Error fetching documents. Please try again.', details: error.message });
  }
});

module.exports = router;
