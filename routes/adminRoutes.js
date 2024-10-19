const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Define your routes
router.get('/students', adminController.viewAllStudents);
router.get('/colleges', adminController.viewAllColleges);
router.post('/suspend/student/:userID', adminController.suspendStudentAccount);
router.post('/suspend/college/:userID', adminController.suspendCollegeAccount);
router.post('/verify/document/:documentID', adminController.verifyDocument);
router.get('/courses', adminController.viewAllCourses);
router.post('/suspend/course/:courseID', adminController.suspendCourse);
router.post('/send/notification', adminController.sendNotification);
router.get('/analytics', adminController.viewAnalytics);

module.exports = router;
