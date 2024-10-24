const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  aadharNumber: { type: String, required: true }, // Only Aadhar number is now required
  documentUrl: { type: String, required: true },  // URL of the uploaded document
  documentType: { type: String, default: '' },     // Optional field for document type
  verified: { type: Boolean, default: false },     // Optional verified status
  remarks: { type: String, default: '' },          // Optional remarks
}, { timestamps: true });

const Document = mongoose.model('Document', DocumentSchema);
module.exports = Document;
