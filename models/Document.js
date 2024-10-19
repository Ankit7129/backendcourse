const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }, // To track if the document is verified
    remarks: { type: String, default: '' }, // To store any remarks related to the document
    verificationDate: { type: Date, default: null } // To store the date when the document was verified
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
