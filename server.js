// server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const courseRoutes = require('./routes/courseRoutes'); // Import course routes

dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Define Routes
app.use('/api/students', require('./routes/studentRoutes')); // Student routes
app.use('/api/colleges', require('./routes/collegeRoutes')); // College routes
app.use('/api/auth', require('./routes/authRoutes')); // Authentication routes
app.use('/api/documents', require('./routes/documentRoutes')); // Document routes
app.use('/api/admin', require('./routes/adminRoutes')); // Admin routes
app.use('/api/college', courseRoutes); // Use course routes

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the College Registration API');
});

// Listen to the port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
