const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Student', // Assuming Student is the model for users
  },
  studentName: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    required: true,
  },
  documentUrl: {
    type: String,
    required: true,
  },
  aadhaarNo: {
    type: String,
    required: false, // Optional if not required
  },
  digilockerId: {
    type: String,
    required: false, // Optional if not required
  },
  verified: {
    type: Boolean,
    default: false,
  },
  remarks: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
