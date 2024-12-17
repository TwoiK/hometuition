const Teacher = require('../models/TeacherApply');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.signup = async (req, res) => {
    try {
        const { fullName, email, phone, password, fees } = req.body;
        
        // Parse subjects from the request body
        let subjects;
        try {
            subjects = JSON.parse(req.body.subjects);
        } catch (error) {
            subjects = req.body.subjects ? req.body.subjects.split(',') : [];
        }

        // Basic validation
        if (!fullName || !email || !phone || !password || !fees || !subjects.length) {
            return res.status(400).json({
                success: false,
                message: 'All fields including subjects are required'
            });
        }

        // Check for existing teacher
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Validate CV file
        if (!req.files?.cv?.[0]) {
            return res.status(400).json({
                success: false,
                message: 'CV file is required'
            });
        }

        // Upload CV to Cloudinary
        const cvResult = await cloudinary.uploader.upload(req.files.cv[0].path, {
            folder: 'teacher_cvs',
            resource_type: 'auto'
        });

        // Upload certificates if any
        let certificateUrls = [];
        if (req.files.certificates) {
            const uploadPromises = req.files.certificates.map(file => 
                cloudinary.uploader.upload(file.path, {
                    folder: 'teacher_certificates',
                    resource_type: 'auto'
                })
            );
            const results = await Promise.all(uploadPromises);
            certificateUrls = results.map(result => result.secure_url);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new teacher
        const newTeacher = await Teacher.create({
            fullName,
            email,
            phone,
            password: hashedPassword,
            cv: cvResult.secure_url,
            certificates: certificateUrls,
            subjects,
            fees
        });

        // Clean up uploaded files
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                fullName: newTeacher.fullName,
                email: newTeacher.email,
                subjects: newTeacher.subjects,
                fees: newTeacher.fees
            }
        });

    } catch (error) {
        // Clean up uploaded files on error
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }

        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during registration: ' + error.message
        });
    }
};
// ... rest of the controller code (login, checkRegistration, etc.) 

// Teacher login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find teacher
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = jwt.sign(
            { id: teacher._id, role: teacher.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            teacher: {
                id: teacher._id,
                fullName: teacher.fullName,
                email: teacher.email,
                phone: teacher.phone,
                role: teacher.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
};

// Reset password request
exports.resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        const teacher = await Teacher.findOne({ email });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Email not found'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: teacher._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // In a real application, you would send this token via email
        // For now, we'll just return it in the response
        res.json({
            success: true,
            message: 'Password reset link has been sent to your email',
            resetToken // Remove this in production
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending reset link'
        });
    }
};

// Add this function to your existing controller
exports.checkRegistration = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const teacher = await Teacher.findOne({ email });
        
        res.json({
            success: true,
            isRegistered: !!teacher
        });
    } catch (error) {
        console.error('Check registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking registration'
        });
    }
};

// Add this new method to your controller
exports.getProfile = async (req, res) => {
    try {
        const teacherId = req.user.id; // This will come from the auth middleware
        
        const teacher = await Teacher.findById(teacherId).select('-password');
        
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.json({
            success: true,
            teacher: {
                fullName: teacher.fullName,
                email: teacher.email,
                phone: teacher.phone,
                cv: teacher.cv,
                certificates: teacher.certificates,
                status: teacher.status,
                subjects: teacher.subjects,
                fees: teacher.fees
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};