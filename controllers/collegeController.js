const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Ensure mongoose is imported
const College = require('../models/College');
const Student = require('../models/Student'); // Import the Student model
const { sendVerificationEmail } = require('./authController');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Register a new college
const registerCollege = async (req, res) => {
    const { collegeName, adminEmail, registrationNumber, phoneNumber, password } = req.body;

    try {
        // Check if college already exists
        let college = await College.findOne({ adminEmail });
        if (college) {
            return res.status(400).json({ message: 'College already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new college
        college = new College({
            collegeName,
            adminEmail,
            registrationNumber,
            phoneNumber,
            password: hashedPassword,
            isVerified: false // Email needs to be verified
        });

        await college.save();
        await sendVerificationEmail(college, 'college'); // Send verification email
        res.status(201).json({ message: 'College registered successfully, please verify your email' });
    } catch (error) {
        console.error('Error registering college:', error);
        res.status(500).json({ message: 'Server error while registering college' });
    }
};

// Login a college
const loginCollege = async (req, res) => {
    const { adminEmail, password } = req.body;

    try {
        // Check if college exists
        const college = await College.findOne({ adminEmail });
        if (!college) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the college email is verified
        if (!college.isVerified) {
            return res.status(400).json({ message: 'Email not verified. Please verify your email before logging in.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, college.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Return JWT and college details
        const payload = { collegeID: college.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send response with token and college information
        res.status(200).json({
            success: true,
            token,
            collegeID: college.id, // Include college ID
            college: {
                collegeName: college.collegeName,
                adminEmail: college.adminEmail,
                phoneNumber: college.phoneNumber,
                address: college.address,
                registrationNumber: college.registrationNumber,
                // Add other fields you want to include
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Logout a college (optional)
const logoutCollege = (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};

const getCollegeById = async (req, res) => {
    console.log('getCollegeById route hit'); // Add this to ensure the route is hit

    try {
        const collegeId = req.params.id;
        console.log(`Fetching college with ID: ${collegeId}`); // Log the ID being used
        const college = await College.findById(collegeId);

        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        res.status(200).json(college);
    } catch (error) {
        console.error('Error fetching college:', error);
        res.status(500).json({ message: 'Server error while fetching college' });
    }
};





module.exports = {
    registerCollege,
    loginCollege,
    logoutCollege,
    getCollegeById
};
