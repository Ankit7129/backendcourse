// /server/models/College.js

const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  adminEmail: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String }, // For password reset
  resetPasswordExpires: { type: Date }, // For expiration of reset token
  isVerified: { type: Boolean, default: false }, // For email verification

  // Update courses to reference the Course model
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

  // Add a field to track students who have enrolled in courses offered by the college
  studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

const College = mongoose.model('College', collegeSchema);
module.exports = College;
