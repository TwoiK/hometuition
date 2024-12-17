const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { signup, login, checkRegistration, resetPasswordRequest,getProfile } = require('../controllers/teacherApplyController');
const authMiddleware = require('../middleware/auth');
const Vacancy = require('../models/Vacancy');

// Define allowed file types
const ALLOWED_TYPES = {
    'cv': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'certificates': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
};

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create uploads directory if it doesn't exist
        const fs = require('fs');
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Sanitize filename and create unique name
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(sanitizedFilename)}`);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    if (!ALLOWED_TYPES[file.fieldname]) {
        cb(new Error(`Unexpected field: ${file.fieldname}`), false);
        return;
    }

    if (!ALLOWED_TYPES[file.fieldname].includes(file.mimetype)) {
        cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${ALLOWED_TYPES[file.fieldname].join(', ')}`), false);
        return;
    }

    cb(null, true);
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
        files: 6 // Maximum number of files (1 CV + 5 certificates)
    },
    fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File size exceeds 2MB limit',
                    error: err.code
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many files uploaded',
                    error: err.code
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`,
                    error: err.code
                });
        }
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    next();
};

// Routes
router.post('/signup', 
    upload.fields([
        { name: 'cv', maxCount: 1 },
        { name: 'certificates', maxCount: 5 }
    ]),
    handleMulterError,
    async (req, res, next) => {
        try {
            await signup(req, res);
        } catch (error) {
            next(error);
        }
    }
);

router.post('/login', login);
router.get('/check-registration', checkRegistration);
router.post('/reset-password', resetPasswordRequest);
router.get('/profile', authMiddleware, getProfile);

// Global error handler
router.use((err, req, res, next) => {
    console.error('Route Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = router;





// Update the vacancies route to use authMiddleware
router.get('/available-vacancies', authMiddleware, async (req, res) => {
    try {
        const vacancies = await Vacancy.find({ 
            status: 'open',
            'applications.teacher': { $ne: req.user._id }
        }).populate('createdBy', 'name');

        res.json({ 
            success: true, 
            vacancies: vacancies.map(vacancy => ({
                _id: vacancy._id,
                title: vacancy.title,
                subject: vacancy.subject,
                description: vacancy.description,
                requirements: vacancy.requirements,
                salary: vacancy.salary,
                createdBy: vacancy.createdBy.name,
                applicantCount: vacancy.applications.length
            }))
        });
    } catch (error) {
        console.error('Error fetching vacancies:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching vacancies' 
        });
    }
});

// Add the apply for vacancy route
router.post('/apply-vacancy/:id', authMiddleware, async (req, res) => {
    try {
        const vacancyId = req.params.id;
        const teacherId = req.user._id;

        const vacancy = await Vacancy.findById(vacancyId);
        
        if (!vacancy) {
            return res.status(404).json({
                success: false,
                message: 'Vacancy not found'
            });
        }

        if (vacancy.status === 'closed') {
            return res.status(400).json({
                success: false,
                message: 'This vacancy is no longer accepting applications'
            });
        }

        // Check if already applied
        const alreadyApplied = vacancy.applications.some(
            app => app.teacher.toString() === teacherId.toString()
        );

        if (alreadyApplied) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this vacancy'
            });
        }

        // Add application to vacancy
        vacancy.applications.push({
            teacher: teacherId,
            status: 'pending',
            appliedAt: new Date()
        });

        await vacancy.save();

        res.json({
            success: true,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('Error applying for vacancy:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application'
        });
    }
});

module.exports = router;