const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: String }, // e.g., '6 months'
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    // New field for remarks
    remarks: {
        type: [String], // Allows multiple remarks as an array of strings
        default: [], // Default to an empty array
    },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
