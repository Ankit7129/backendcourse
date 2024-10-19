const express = require('express');
const {
    registerStudent,
    loginStudent,
    logoutStudent,
    getStudentProfile,
    updateStudentProfile
} = require('../controllers/studentController'); // Import the student controller functions

const router = express.Router();

// Register a new student
router.post('/register', registerStudent);

// Login a student
router.post('/login', loginStudent);

// Logout a student
router.post('/logout', logoutStudent);

// Get student profile by ID
router.get('/profile/:studentID', getStudentProfile);

// Update student profile by ID
router.put('/profile/:studentID', updateStudentProfile);

module.exports = router;
