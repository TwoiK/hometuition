const express = require('express');
const router = express.Router();
const { 
    submitApplication, 
    getAllApplications,
    deleteApplication    // Add this
} = require('../controllers/parent_applyController');

// Submit parent application
router.post('/submit', submitApplication);

// Get all parent applications
router.get('/all', getAllApplications);

// Delete parent application
router.delete('/delete/:id', deleteApplication);  // Add this route

module.exports = router;