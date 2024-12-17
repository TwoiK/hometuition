const Parent = require('../models/Parent_apply');

// Submit parent application
const submitApplication = async (req, res) => {
    try {
        const parent = new Parent({
            parentName: req.body.parentName,
            relationship: req.body.relationship,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            studentName: req.body.studentName,
            grade: req.body.grade
        });

        await parent.save();
        res.status(201).json({
            success: true,
            message: 'Parent application submitted successfully',
            data: parent
        });
    } catch (error) {
        console.error('Parent application error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all parent applications
const getAllApplications = async (req, res) => {
    try {
        const parents = await Parent.find({});
        res.status(200).json({
            success: true,
            data: parents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete parent application
const deleteApplication = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.id);
        if (!parent) {
            return res.status(404).json({
                success: false,
                message: 'Parent application not found'
            });
        }

        await parent.deleteOne(); // Using deleteOne() instead of remove()
        res.json({
            success: true,
            message: 'Parent application deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    submitApplication,
    getAllApplications,
    deleteApplication
};