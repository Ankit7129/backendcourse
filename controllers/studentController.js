const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { sendVerificationEmail } = require('./authController'); // Import the email function from authController

// Register a new student
const registerStudent = async (req, res) => {
    const { name, email, phoneNumber, aadharNumber, educationalBackground, password } = req.body;

    try {
        // Check if student exists
        let studentByEmail = await Student.findOne({ email });
        if (studentByEmail) return res.status(400).json({ message: 'Student with this email already exists' });

        // Check if Aadhaar number is unique
        let studentByAadhar = await Student.findOne({ aadharNumber });
        if (studentByAadhar) return res.status(400).json({ message: 'Aadhaar number already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create student
        const student = new Student({
            name,
            email,
            phoneNumber,
            aadharNumber, // Include Aadhaar number
            educationalBackground,
            password: hashedPassword,
            isVerified: false // Email needs to be verified
        });

        await student.save();

        // Send email verification
        await sendVerificationEmail(student, 'student'); // Call from authController

        res.status(201).json({ message: 'Student registered successfully, please verify your email' });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Login a student
const loginStudent = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if student exists
        let student = await Student.findOne({ email });
        if (!student) return res.status(400).json({ message: 'Invalid credentials' });

        // Check if the email is verified
        if (!student.isVerified) {
            return res.status(400).json({ message: 'Email not verified. Please verify your email before logging in.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Return JWT and student details
        const payload = { studentID: student.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send response with token and student information
        res.status(200).json({
            success: true,
            token,
            studentID: student.id, // Include student ID
            student: {
                name: student.name,
                email: student.email,
                phoneNumber: student.phoneNumber,
                educationalBackground: student.educationalBackground,
                aadharNumber: student.aadharNumber, // Include Aadhar number

                // Add other fields you want to include
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Logout a student
const logoutStudent = (req, res) => {
    // Here we usually clear the token from the client-side
    // For this backend, we simply send a response confirming logout
    res.status(200).json({ message: 'Logout successful' });
};

// Get student profile (optional)
const getStudentProfile = async (req, res) => {
    const { studentID } = req.params; // Assuming student ID is passed as a route parameter

    try {
        const student = await Student.findById(studentID).select('-password'); // Exclude password from response
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ message: 'Server error while fetching student profile' });
    }
};

// Update student information (optional)
const updateStudentProfile = async (req, res) => {
    const { studentID } = req.params; // Assuming student ID is passed as a route parameter
    const { name, phoneNumber, educationalBackground } = req.body;

    try {
        const student = await Student.findByIdAndUpdate(
            studentID,
            { name, phoneNumber, educationalBackground },
            { new: true, runValidators: true } // Return updated document and run validators
        );

        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json(student);
    } catch (error) {
        console.error('Error updating student profile:', error);
        res.status(500).json({ message: 'Server error while updating student profile' });
    }
};

module.exports = {
    registerStudent,
    loginStudent,
    logoutStudent,
    getStudentProfile, // Export the profile retrieval function
    updateStudentProfile // Export the profile update function
};
