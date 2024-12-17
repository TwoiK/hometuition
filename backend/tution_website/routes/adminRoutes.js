const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Protected Routes
router.get('/dashboard/stats', adminAuth, async (req, res) => {
    try {
        const stats = {
            students: await StudentApply.countDocuments(),
            parents: await Parent.countDocuments(),
            teachers: {
                total: await TeacherApply.countDocuments(),
                pending: await TeacherApply.countDocuments({ status: 'pending' }),
                approved: await TeacherApply.countDocuments({ status: 'approved' }),
                rejected: await TeacherApply.countDocuments({ status: 'rejected' })
            }
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
});

module.exports = router;