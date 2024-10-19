const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); // Assuming the Course model is in models folder

// Route to add a new course
router.post('/add-course', async (req, res) => {
    try {
        const { courseName, description, price, duration, remarks, college } = req.body;

        // Check if the college ObjectId is provided
        if (!college) {
            return res.status(400).json({ message: 'College ID is required.' });
        }

        // Create a new course instance
        const course = new Course({
            courseName,
            description,
            price,
            duration,
            remarks,
            college // Make sure this is included
        });

        // Save the course to the database
        await course.save();

        // Return a success response
        res.status(201).json({
            message: 'Course added successfully',
            course
        });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Route to get all courses with college name
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find().populate('college', 'collegeName'); // Populate college name
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching courses' });
    }
});

// Route to delete a course
router.delete('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Course.findByIdAndDelete(id);
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting course' });
    }
});

// Route to update a course
router.put('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCourse = await Course.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json({ error: 'Error updating course' });
    }
});

module.exports = router;
