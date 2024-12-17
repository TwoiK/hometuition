const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

const app = express();

// Improved MongoDB connection
mongoose.connect('mongodb://localhost:27017/tution_website')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Enhanced CORS configuration
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://localhost:3000',
        'http://127.0.0.1:15500',   
        'http://localhost:15500'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Import routes
const authRoutes = require('./routes/auth');
const teacherApplyRoutes = require('./routes/teacherApply');
const studentRoutes = require('./routes/students');
const parentRoutes = require('./routes/parent_apply');
const studentApplyRoutes = require('./routes/studentApply');

const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/adminRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/teacher-apply', teacherApplyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/student-apply', studentApplyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: "Backend is working!",
        timestamp: new Date(),
        status: "online"
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Route not found',
        requestedUrl: req.originalUrl
    });
});

// Enhanced error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {},
        timestamp: new Date()
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available Routes:');
    console.log('- /api/auth');
    console.log('- /api/teacher-apply');
    console.log('- /api/students');
    console.log('- /api/parents');
    console.log('- /api/student-apply');
    console.log('- /api/admin');
 
    console.log('- /api/contact');
    console.log('- /api/test');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't exit the process in development
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});