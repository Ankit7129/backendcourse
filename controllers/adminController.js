const Student = require('../models/Student'); // Importing Student model
const College = require('../models/College'); // Importing College model
const Document = require('../models/Document'); // Assuming you have a Document model defined

// View All Students
const viewAllStudents = async (req, res) => {
    try {
        const students = await Student.find(); // Fetch all students
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error while fetching students' });
    }
};

// View All Colleges
const viewAllColleges = async (req, res) => {
    try {
        const colleges = await College.find(); // Fetch all colleges
        res.status(200).json(colleges);
    } catch (error) {
        console.error('Error fetching colleges:', error);
        res.status(500).json({ message: 'Server error while fetching colleges' });
    }
};

// Suspend Student Account
const suspendStudentAccount = async (req, res) => {
    const { userID } = req.params;
    try {
        const student = await Student.findById(userID);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        student.isSuspended = true; // Assuming there's an 'isSuspended' field
        await student.save();
        res.status(200).json({ message: 'Student account suspended successfully' });
    } catch (error) {
        console.error('Error suspending student:', error);
        res.status(500).json({ message: 'Server error while suspending student' });
    }
};

// Suspend College Account
const suspendCollegeAccount = async (req, res) => {
    const { userID } = req.params;
    try {
        const college = await College.findById(userID);
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }
        college.isSuspended = true; // Assuming there's an 'isSuspended' field
        await college.save();
        res.status(200).json({ message: 'College account suspended successfully' });
    } catch (error) {
        console.error('Error suspending college:', error);
        res.status(500).json({ message: 'Server error while suspending college' });
    }
};

// Document Verification
const verifyDocument = async (req, res) => {
    const { documentID } = req.params;
    try {
        const document = await Document.findById(documentID);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        document.isVerified = true; // Assuming there's an 'isVerified' field
        await document.save();
        res.status(200).json({ message: 'Document verified successfully' });
    } catch (error) {
        console.error('Error verifying document:', error);
        res.status(500).json({ message: 'Server error while verifying document' });
    }
};

// Get all courses
const viewAllCourses = async (req, res) => {
    try {
        const courses = await Course.find(); // Ensure you have Course model defined
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server error while fetching courses' });
    }
};

// Suspend/Delete Courses
const suspendCourse = async (req, res) => {
    const { courseID } = req.params;
    try {
        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        course.isSuspended = true; // Assuming there's an 'isSuspended' field
        await course.save();
        res.status(200).json({ message: 'Course suspended successfully' });
    } catch (error) {
        console.error('Error suspending course:', error);
        res.status(500).json({ message: 'Server error while suspending course' });
    }
};

// Send notifications
const sendNotification = async (req, res) => {
    const { message } = req.body;
    // Logic to send notifications, e.g., email or push notifications
    res.status(200).json({ message: 'Notification sent successfully' });
};

// View Analytics
const viewAnalytics = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments(); // Count all students
        const totalColleges = await College.countDocuments(); // Count all colleges
        const totalCourses = await Course.countDocuments(); // Count all courses
        
        const analyticsData = {
            totalStudents,
            totalColleges,
            totalCourses,
        };

        res.status(200).json(analyticsData);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error while fetching analytics' });
    }
};

module.exports = {
    viewAllStudents,
    viewAllColleges,
    suspendStudentAccount,
    suspendCollegeAccount,
    verifyDocument,
    viewAllCourses,
    suspendCourse,
    sendNotification,
    viewAnalytics,
};
