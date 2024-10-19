const express = require('express');
const router = express.Router();
const {
    registerCollege,
    loginCollege,
    logoutCollege,
    verifyEmail,  // Add the verifyEmail function
    getCollegeById
} = require('../controllers/collegeController'); // Correct naming here

// Register college
router.post('/register', registerCollege);

// Login college
router.post('/login', loginCollege);

// Logout college
router.post('/logout', logoutCollege); // Logout route

// Route to get college by ID
router.get('/get-college/:id', getCollegeById); // Use destructured getCollegeById

module.exports = router;
