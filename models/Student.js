// /server/models/Student.js

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  educationalBackground: { type: String, required: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String }, // For password reset
  resetPasswordExpires: { type: Date }, // For expiration of reset token
  isVerified: { type: Boolean, default: false }, // For email verification

  // Add documents field to store uploaded documents
  documents: [{
    documentType: { type: String, required: true }, // e.g., 'Class 10 Certificate'
    documentUrl: { type: String, required: true }, // URL or path to the stored document
    aadharNumber: { type: String, required: true },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
  }],

  // Update coursesEnrolled to store enrollment details
  coursesEnrolled: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    rollNumber: { type: String },
  }],
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
